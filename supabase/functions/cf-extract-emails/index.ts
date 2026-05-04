// Stage 3: Website email extraction via Firecrawl.
// Crawls homepage + /contact for each contractor's website and extracts emails.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SKIP_DOMAINS = ['example.com', 'sentry.io', 'wixpress.com', 'sentry-next.wixpress.com', 'wix.com', 'godaddy.com', 'squarespace.com', 'cloudflare.com'];
const SKIP_PREFIXES = ['noreply', 'no-reply', 'donotreply', 'do-not-reply', 'mailer-daemon', 'postmaster'];

function normalizeUrl(raw: string): string | null {
  if (!raw) return null;
  let s = raw.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    return u.origin;
  } catch {
    return null;
  }
}

function pickEmails(text: string): string[] {
  const matches = text.match(EMAIL_RE) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches) {
    const e = m.toLowerCase();
    if (seen.has(e)) continue;
    const [local, domain] = e.split('@');
    if (!local || !domain) continue;
    if (SKIP_DOMAINS.includes(domain)) continue;
    if (SKIP_PREFIXES.some((p) => local.startsWith(p))) continue;
    if (e.length > 100) continue;
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(e)) continue;
    seen.add(e);
    out.push(e);
  }
  return out;
}

async function scrapeUrl(url: string, apiKey: string): Promise<string> {
  const r = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      onlyMainContent: false,
      timeout: 25000,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Firecrawl ${r.status}: ${t.slice(0, 200)}`);
  }
  const data = await r.json();
  // v2 SDK-style: fields at root; v2 REST may wrap in .data
  const md = data?.markdown ?? data?.data?.markdown ?? '';
  const html = data?.html ?? data?.data?.html ?? '';
  return `${md}\n${html}`;
}

async function extractForContractor(
  contractor: { id: string; website: string | null; business_name: string },
  apiKey: string,
): Promise<{ email: string | null; extras: string[]; source: string | null; error: string | null }> {
  const origin = normalizeUrl(contractor.website ?? '');
  if (!origin) return { email: null, extras: [], source: null, error: 'no-website' };

  const targets = [origin, `${origin}/contact`];
  const collected: { url: string; emails: string[] }[] = [];
  let lastErr: string | null = null;

  for (const target of targets) {
    try {
      const blob = await scrapeUrl(target, apiKey);
      const emails = pickEmails(blob);
      collected.push({ url: target, emails });
    } catch (e) {
      lastErr = e instanceof Error ? e.message : 'scrape failed';
    }
  }

  // Prefer contact page email; fall back to homepage
  const contactEmails = collected.find((c) => c.url.endsWith('/contact'))?.emails ?? [];
  const homeEmails = collected.find((c) => c.url === origin)?.emails ?? [];
  const all = Array.from(new Set([...contactEmails, ...homeEmails]));

  if (all.length === 0) {
    return {
      email: null,
      extras: [],
      source: null,
      error: lastErr ?? 'no-emails-found',
    };
  }

  const primary = all[0];
  const extras = all.slice(1);
  const source = contactEmails.length > 0 ? `${origin}/contact` : origin;
  return { email: primary, extras, source, error: null };
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

    // Require admin auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).maybeSingle();
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body?.limit ?? 25), 1), 250);
    const onlyMissing = body?.onlyMissing !== false;
    const contractorIds: string[] | undefined = Array.isArray(body?.contractorIds)
      ? body.contractorIds.slice(0, 250)
      : undefined;

    // Fetch targets
    let q = supabase
      .from('cf_contractors')
      .select('id, business_name, website')
      .not('website', 'is', null)
      .neq('website', '')
      .limit(limit);
    if (contractorIds) q = q.in('id', contractorIds);
    if (onlyMissing && !contractorIds) q = q.is('email', null).eq('email_extraction_status', 'pending');

    const { data: targets, error: tErr } = await q;
    if (tErr) throw tErr;

    if (!targets || targets.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: 'No targets to process', processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create run row
    const { data: runRow, error: runErr } = await supabase
      .from('cf_extraction_runs')
      .insert({
        source: 'firecrawl',
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
    let emailsFound = 0;

    // Process sequentially to be polite to Firecrawl rate limits
    for (const c of targets) {
      processed++;
      try {
        const r = await extractForContractor(c, FIRECRAWL_API_KEY);
        if (r.email) {
          succeeded++;
          emailsFound++;
          await supabase
            .from('cf_contractors')
            .update({
              email: r.email,
              extra_emails: r.extras,
              email_source: r.source,
              email_extraction_status: 'success',
              email_extracted_at: new Date().toISOString(),
              email_extraction_error: null,
            })
            .eq('id', c.id);
        } else {
          failed++;
          await supabase
            .from('cf_contractors')
            .update({
              email_extraction_status: r.error === 'no-emails-found' ? 'no_email_found' : 'failed',
              email_extracted_at: new Date().toISOString(),
              email_extraction_error: r.error,
            })
            .eq('id', c.id);
        }
      } catch (e) {
        failed++;
        await supabase
          .from('cf_contractors')
          .update({
            email_extraction_status: 'failed',
            email_extracted_at: new Date().toISOString(),
            email_extraction_error: e instanceof Error ? e.message.slice(0, 500) : 'error',
          })
          .eq('id', c.id);
      }

      // Update run progress every 5 contractors
      if (processed % 5 === 0 || processed === targets.length) {
        await supabase
          .from('cf_extraction_runs')
          .update({ processed, succeeded, failed, emails_found: emailsFound })
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
        emails_found: emailsFound,
        finished_at: new Date().toISOString(),
      })
      .eq('id', runId);

    return new Response(
      JSON.stringify({ ok: true, run_id: runId, processed, succeeded, failed, emails_found: emailsFound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('cf-extract-emails error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
