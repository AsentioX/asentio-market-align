// PerkPath: scrape offers from program sites, web search, and RSS feeds.
// For each membership a user owns, walk every active source whose
// membership_slug matches the membership.slug, extract offer candidates with
// Firecrawl + Lovable AI, dedupe via fingerprint, and insert matched offers
// as perks under that membership.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2';
const LOVABLE_AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

interface ExtractedOffer {
  title: string;
  value_label: string;
  category: 'auto' | 'dining' | 'travel' | 'shopping' | 'health' | 'entertainment' | 'services' | 'other';
  venue?: string | null;
  how_to_redeem?: string | null;
  source_url?: string | null;
  perk_tags?: string[];
}

function fingerprint(o: { title: string; venue?: string | null; value_label: string }): string {
  return [o.title, o.venue ?? '', o.value_label]
    .join('|')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

async function firecrawlScrape(url: string, apiKey: string): Promise<string | null> {
  try {
    const r = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.data?.markdown ?? d?.markdown ?? null;
  } catch {
    return null;
  }
}

async function firecrawlSearch(query: string, apiKey: string): Promise<string | null> {
  try {
    const r = await fetch(`${FIRECRAWL_V2}/search`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        limit: 6,
        scrapeOptions: { formats: ['markdown'] },
      }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const list: any[] = Array.isArray(d?.data) ? d.data : Array.isArray(d?.web?.results) ? d.web.results : [];
    return list
      .map((x) => `# ${x.title ?? ''}\n${x.url ?? ''}\n\n${x.markdown ?? x.description ?? ''}`)
      .join('\n\n---\n\n')
      .slice(0, 12000);
  } catch {
    return null;
  }
}

async function fetchRssText(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 PerkPath/1.0' } });
    if (!r.ok) return null;
    const xml = await r.text();
    // Strip tags to a flat blob the LLM can extract from
    return xml
      .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
      .replace(/<\/?[^>]+>/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .slice(0, 12000);
  } catch {
    return null;
  }
}

async function extractOffersWithLLM(
  membershipName: string,
  sourceContext: string,
  rawText: string,
  lovableApiKey: string,
): Promise<ExtractedOffer[]> {
  const prompt = `You are extracting member-only offers and discounts for a membership called "${membershipName}".
Source: ${sourceContext}

From the content below, extract up to 6 distinct concrete offers. Each offer must:
- Be a real, specific deal (e.g. "20% off Hertz rentals", "$50 hotel credit"), NOT marketing fluff
- Have a clear monetary value or percentage / credit / freebie
- Be redeemable by a member of "${membershipName}"

Return ONLY valid JSON in this exact shape (no prose):
{ "offers": [ { "title": string, "value_label": string, "category": "auto"|"dining"|"travel"|"shopping"|"health"|"entertainment"|"services"|"other", "venue": string|null, "how_to_redeem": string|null, "source_url": string|null, "perk_tags": string[] } ] }

If no real offers are present, return { "offers": [] }.

CONTENT:
${rawText.slice(0, 10000)}`;

  const r = await fetch(LOVABLE_AI_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${lovableApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You output strict JSON only. No markdown, no commentary.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!r.ok) {
    console.error('LLM extract failed', r.status, await r.text().catch(() => ''));
    return [];
  }
  const d = await r.json();
  const text: string = d?.choices?.[0]?.message?.content ?? '';
  const cleaned = text.replace(/^```json\s*|\s*```$/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    const offers = Array.isArray(parsed?.offers) ? parsed.offers : [];
    return offers
      .filter((o: any) => o?.title && o?.value_label)
      .slice(0, 6) as ExtractedOffer[];
  } catch (e) {
    console.error('JSON parse failed', e, cleaned.slice(0, 200));
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (!FIRECRAWL_API_KEY || !LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing FIRECRAWL_API_KEY or LOVABLE_API_KEY' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  // Determine target users: caller (if authed) or all users when run by cron
  const body = await req.json().catch(() => ({} as any));
  const triggeredBy: string = body?.triggered_by ?? 'manual';

  let targetUserIds: string[] = [];
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (userData?.user?.id) targetUserIds = [userData.user.id];
  }
  if (targetUserIds.length === 0) {
    const { data: users } = await supabase.from('pp_memberships').select('user_id').eq('is_active', true);
    targetUserIds = Array.from(new Set((users ?? []).map((u: any) => u.user_id)));
  }

  // Create run record
  const { data: runRow } = await supabase
    .from('pp_scrape_runs')
    .insert({ triggered_by: triggeredBy, user_id: targetUserIds.length === 1 ? targetUserIds[0] : null, status: 'running' })
    .select('id')
    .single();
  const runId = runRow!.id as string;

  let sourcesTotal = 0;
  let sourcesSucceeded = 0;
  let sourcesFailed = 0;
  let offersFound = 0;
  let perksCreated = 0;

  try {
    // Load all active sources once
    const { data: sources } = await supabase
      .from('pp_offer_sources')
      .select('*')
      .eq('is_active', true);
    const sourceList = sources ?? [];

    for (const userId of targetUserIds) {
      const { data: memberships } = await supabase
        .from('pp_memberships')
        .select('id, slug, name')
        .eq('user_id', userId)
        .eq('is_active', true);

      for (const m of memberships ?? []) {
        const matching = sourceList.filter((s: any) => s.membership_slug === m.slug);
        for (const src of matching) {
          sourcesTotal++;
          let raw: string | null = null;
          let label = src.label ?? src.kind;
          try {
            if (src.kind === 'program_site' && src.url) raw = await firecrawlScrape(src.url, FIRECRAWL_API_KEY);
            else if (src.kind === 'search_query' && src.query) raw = await firecrawlSearch(src.query, FIRECRAWL_API_KEY);
            else if (src.kind === 'rss_feed' && src.url) raw = await fetchRssText(src.url);

            if (!raw || raw.trim().length < 100) {
              sourcesFailed++;
              continue;
            }
            const offers = await extractOffersWithLLM(m.name, label, raw, LOVABLE_API_KEY);
            sourcesSucceeded++;
            offersFound += offers.length;

            for (const o of offers) {
              const fp = fingerprint(o);
              // Upsert into scraped offers (dedupe via unique index)
              const { data: scraped, error: upsertErr } = await supabase
                .from('pp_scraped_offers')
                .upsert(
                  {
                    source_id: src.id,
                    membership_id: m.id,
                    user_id: userId,
                    membership_slug: m.slug,
                    title: o.title,
                    value_label: o.value_label,
                    category: o.category ?? 'other',
                    venue: o.venue ?? null,
                    how_to_redeem: o.how_to_redeem ?? null,
                    source_url: o.source_url ?? src.url ?? null,
                    perk_tags: o.perk_tags ?? [],
                    fingerprint: fp,
                    status: 'new',
                  },
                  { onConflict: 'user_id,membership_id,fingerprint', ignoreDuplicates: false },
                )
                .select('id, status, perk_id')
                .single();
              if (upsertErr || !scraped) continue;
              if (scraped.status === 'applied' && scraped.perk_id) continue; // already applied

              // Auto-create the perk
              const { data: newPerk, error: perkErr } = await supabase
                .from('pp_perks')
                .insert({
                  membership_id: m.id,
                  user_id: userId,
                  title: o.title,
                  value_label: o.value_label,
                  category: o.category ?? 'other',
                  venue: o.venue ?? null,
                  how_to_redeem: o.how_to_redeem ?? null,
                  perk_tags: o.perk_tags ?? [],
                  is_active: true,
                  sort_order: 100,
                })
                .select('id')
                .single();
              if (!perkErr && newPerk) {
                perksCreated++;
                await supabase
                  .from('pp_scraped_offers')
                  .update({ status: 'applied', perk_id: newPerk.id })
                  .eq('id', scraped.id);
              }
            }
            await supabase.from('pp_offer_sources').update({ last_run_at: new Date().toISOString() }).eq('id', src.id);
          } catch (e) {
            sourcesFailed++;
            console.error('source error', src.id, e);
          }
        }
      }
    }

    await supabase
      .from('pp_scrape_runs')
      .update({
        status: 'complete',
        sources_total: sourcesTotal,
        sources_succeeded: sourcesSucceeded,
        sources_failed: sourcesFailed,
        offers_found: offersFound,
        perks_created: perksCreated,
        finished_at: new Date().toISOString(),
      })
      .eq('id', runId);

    return new Response(
      JSON.stringify({
        ok: true,
        run_id: runId,
        sources_total: sourcesTotal,
        sources_succeeded: sourcesSucceeded,
        sources_failed: sourcesFailed,
        offers_found: offersFound,
        perks_created: perksCreated,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    await supabase
      .from('pp_scrape_runs')
      .update({
        status: 'failed',
        error_message: e instanceof Error ? e.message : 'unknown',
        finished_at: new Date().toISOString(),
      })
      .eq('id', runId);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
