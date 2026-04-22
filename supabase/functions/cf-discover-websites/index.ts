// Stage 2.5: Discover contractor websites via Firecrawl Search.
// For each contractor missing a website, runs a targeted web search,
// filters out directory/junk domains, and saves the best matching domain.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2';

// Domains we should never save as a contractor's "website" — they're directories,
// review sites, social profiles, marketplaces, government records, etc.
const DIRECTORY_DOMAINS = new Set([
  'yelp.com', 'm.yelp.com',
  'bbb.org',
  'houzz.com',
  'yellowpages.com', 'yp.com',
  'buildzoom.com',
  'angi.com', 'angieslist.com',
  'thumbtack.com',
  'homeadvisor.com',
  'porch.com',
  'nextdoor.com',
  'facebook.com', 'm.facebook.com', 'business.facebook.com',
  'instagram.com',
  'linkedin.com',
  'twitter.com', 'x.com',
  'youtube.com',
  'tiktok.com',
  'pinterest.com',
  'mapquest.com',
  'manta.com',
  'bizapedia.com',
  'opencorporates.com',
  'dnb.com',
  'zoominfo.com',
  'crunchbase.com',
  'glassdoor.com',
  'indeed.com',
  'ziprecruiter.com',
  'cslb.ca.gov', 'ca.gov',
  'wikipedia.org',
  'reddit.com',
  'quora.com',
  'amazon.com',
  'ebay.com',
  'craigslist.org',
  'google.com', 'maps.google.com',
  'apple.com', 'maps.apple.com',
  'bing.com',
  'sba.gov',
  'irs.gov',
  'usa.gov',
]);

const DIRECTORY_SUFFIXES = ['.gov', '.gov.us'];

function rootDomain(host: string): string {
  // Normalize to bare host (strip www.) and lowercase
  return host.replace(/^www\./i, '').toLowerCase();
}

function isDirectoryDomain(host: string): boolean {
  const h = rootDomain(host);
  if (DIRECTORY_DOMAINS.has(h)) return true;
  if (DIRECTORY_SUFFIXES.some((s) => h.endsWith(s))) return true;
  return false;
}

function safeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    return u;
  } catch {
    return null;
  }
}

interface SearchResult {
  url: string;
  title?: string;
  description?: string;
}

async function firecrawlSearch(query: string, apiKey: string): Promise<SearchResult[]> {
  const r = await fetch(`${FIRECRAWL_V2}/search`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      limit: 8,
      lang: 'en',
      country: 'us',
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Firecrawl search ${r.status}: ${t.slice(0, 200)}`);
  }
  const data = await r.json();
  // v2 may return results in `data` (array) or `web.results`
  const list: any[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.web?.results)
      ? data.web.results
      : Array.isArray(data?.results)
        ? data.results
        : [];
  return list
    .map((x) => ({
      url: x.url ?? x.link ?? '',
      title: x.title ?? '',
      description: x.description ?? x.snippet ?? '',
    }))
    .filter((x) => !!x.url);
}

// Score how likely a search result is to be the contractor's actual website
function scoreCandidate(
  result: SearchResult,
  business: { name: string; city: string | null; phone: string | null },
): number {
  const u = safeUrl(result.url);
  if (!u) return -1;
  const host = rootDomain(u.hostname);
  if (isDirectoryDomain(host)) return -1;

  let score = 0;
  // Tokens from business name (strip common suffixes)
  const tokens = business.name
    .toLowerCase()
    .replace(/\b(inc|llc|corp|corporation|company|co|construction|builders|services|service|the|and|&)\b/g, ' ')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);

  const hostNoTld = host.split('.').slice(0, -1).join('.');
  for (const t of tokens) {
    if (hostNoTld.includes(t)) score += 5;
  }

  // Title / description signals
  const blob = `${result.title ?? ''} ${result.description ?? ''}`.toLowerCase();
  if (business.city && blob.includes(business.city.toLowerCase())) score += 2;
  if (business.phone) {
    const digits = business.phone.replace(/\D/g, '').slice(-10);
    if (digits && blob.includes(digits)) score += 4;
  }

  // Penalize obvious portfolio/dev hosts
  if (/\.(wixsite|webflow|squarespace|godaddysites|weebly|carrd)\./.test(host)) score -= 1;
  // Slight bonus for HTTPS / short hosts
  if (u.protocol === 'https:') score += 1;
  if (host.split('.').length <= 2) score += 1;

  return score;
}

interface Contractor {
  id: string;
  business_name: string;
  city: string | null;
  county: string | null;
  state: string | null;
  phone: string | null;
  license_number: string;
}

async function discoverForContractor(
  c: Contractor,
  apiKey: string,
): Promise<{ website: string | null; reason: string | null }> {
  // Build a focused search query
  const cityState = [c.city, c.state ?? 'CA'].filter(Boolean).join(', ');
  const query = `"${c.business_name}" ${cityState} contractor`.slice(0, 200);

  let results: SearchResult[];
  try {
    results = await firecrawlSearch(query, apiKey);
  } catch (e) {
    return { website: null, reason: e instanceof Error ? e.message.slice(0, 200) : 'search-failed' };
  }
  if (!results.length) return { website: null, reason: 'no-results' };

  const ranked = results
    .map((r) => ({ r, score: scoreCandidate(r, { name: c.business_name, city: c.city, phone: c.phone }) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) return { website: null, reason: 'no-non-directory-match' };
  const best = ranked[0];
  // Require a minimum confidence — at least one name token + one other signal,
  // or a strong name match
  if (best.score < 5) return { website: null, reason: 'low-confidence' };

  const u = safeUrl(best.r.url)!;
  // Save the bare origin (no path) so Stage 3 crawls homepage + /contact cleanly
  return { website: u.origin, reason: null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: 'FIRECRAWL_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body?.limit ?? 25), 1), 200);
    const contractorIds: string[] | undefined = Array.isArray(body?.contractorIds)
      ? body.contractorIds.slice(0, 200)
      : undefined;

    // Fetch contractors missing a website
    let q = supabase
      .from('cf_contractors')
      .select('id, business_name, city, county, state, phone, license_number')
      .or('website.is.null,website.eq.')
      .limit(limit);
    if (contractorIds) q = q.in('id', contractorIds);

    const { data: targets, error: tErr } = await q;
    if (tErr) throw tErr;

    if (!targets || targets.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, message: 'No contractors missing a website', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Track this batch in cf_extraction_runs (source = 'website-discovery')
    const { data: runRow, error: runErr } = await supabase
      .from('cf_extraction_runs')
      .insert({
        source: 'website-discovery',
        status: 'running',
        total_targets: targets.length,
      })
      .select('id')
      .single();
    if (runErr) throw runErr;
    const runId = runRow.id;

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    for (const c of targets as Contractor[]) {
      processed++;
      try {
        const r = await discoverForContractor(c, FIRECRAWL_API_KEY);
        if (r.website) {
          succeeded++;
          await supabase
            .from('cf_contractors')
            .update({
              website: r.website,
              email_extraction_status: 'pending',
            })
            .eq('id', c.id);
        } else {
          failed++;
          // Don't overwrite anything — just record the attempt in the run summary
        }
      } catch (e) {
        failed++;
        console.error('discover error', c.license_number, e);
      }

      if (processed % 5 === 0 || processed === targets.length) {
        await supabase
          .from('cf_extraction_runs')
          .update({ processed, succeeded, failed, emails_found: succeeded })
          .eq('id', runId);
      }
    }

    await supabase
      .from('cf_extraction_runs')
      .update({
        status: 'complete',
        processed,
        succeeded,
        failed,
        emails_found: succeeded,
        finished_at: new Date().toISOString(),
      })
      .eq('id', runId);

    return new Response(
      JSON.stringify({
        ok: true,
        run_id: runId,
        processed,
        succeeded,
        failed,
        websites_found: succeeded,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('cf-discover-websites error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
