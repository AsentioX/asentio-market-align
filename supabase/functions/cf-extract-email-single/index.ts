// Extract a contact email for a single contractor by scraping its website,
// then persist it to the cf_contractors row. Returns the discovered email.
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
    return new URL(s).origin;
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
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formats: ['markdown', 'html'], onlyMainContent: false, timeout: 25000 }),
  });
  if (!r.ok) throw new Error(`Firecrawl ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  const md = data?.markdown ?? data?.data?.markdown ?? '';
  const html = data?.html ?? data?.data?.html ?? '';
  return `${md}\n${html}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: 'FIRECRAWL_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    // Admin auth check
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
    const contractorId: string | undefined = body?.contractorId;
    const manualEmail: string | undefined = body?.email;
    const websiteOverride: string | undefined = body?.website;

    if (!contractorId || typeof contractorId !== 'string') {
      return new Response(JSON.stringify({ error: 'contractorId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Manual email path: validate & store
    if (manualEmail) {
      const trimmed = manualEmail.trim().toLowerCase();
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed) || trimmed.length > 100) {
        return new Response(JSON.stringify({ error: 'Invalid email' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { error: upErr } = await supabase
        .from('cf_contractors')
        .update({
          email: trimmed,
          email_source: 'manual',
          email_extraction_status: 'success',
          email_extracted_at: new Date().toISOString(),
          email_extraction_error: null,
        })
        .eq('id', contractorId);
      if (upErr) throw upErr;
      return new Response(JSON.stringify({ ok: true, email: trimmed, source: 'manual' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auto-extract path: look up website
    const { data: contractor, error: cErr } = await supabase
      .from('cf_contractors')
      .select('id, business_name, website')
      .eq('id', contractorId)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!contractor) {
      return new Response(JSON.stringify({ error: 'Contractor not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const origin = normalizeUrl(websiteOverride || contractor.website || '');
    if (!origin) {
      return new Response(JSON.stringify({ error: 'No website on file. Provide one or save an email manually.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Scrape homepage + /contact, prefer contact-page emails.
    const targets = [origin, `${origin}/contact`];
    const collected: { url: string; emails: string[] }[] = [];
    let lastErr: string | null = null;
    for (const t of targets) {
      try {
        const blob = await scrapeUrl(t, FIRECRAWL_API_KEY);
        collected.push({ url: t, emails: pickEmails(blob) });
      } catch (e) {
        lastErr = e instanceof Error ? e.message : 'scrape failed';
      }
    }
    const contactEmails = collected.find((c) => c.url.endsWith('/contact'))?.emails ?? [];
    const homeEmails = collected.find((c) => c.url === origin)?.emails ?? [];
    const all = Array.from(new Set([...contactEmails, ...homeEmails]));

    if (all.length === 0) {
      await supabase
        .from('cf_contractors')
        .update({
          email_extraction_status: lastErr ? 'failed' : 'no_email_found',
          email_extracted_at: new Date().toISOString(),
          email_extraction_error: lastErr ?? 'no-emails-found',
        })
        .eq('id', contractorId);
      return new Response(JSON.stringify({ ok: false, email: null, error: lastErr ?? 'no-emails-found' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const primary = all[0];
    const extras = all.slice(1);
    const source = contactEmails.length > 0 ? `${origin}/contact` : origin;

    // Save website override too, if it was provided & different
    const updatePayload: Record<string, unknown> = {
      email: primary,
      extra_emails: extras,
      email_source: source,
      email_extraction_status: 'success',
      email_extracted_at: new Date().toISOString(),
      email_extraction_error: null,
    };
    if (websiteOverride && websiteOverride !== contractor.website) {
      updatePayload.website = websiteOverride;
    }

    const { error: upErr } = await supabase
      .from('cf_contractors')
      .update(updatePayload)
      .eq('id', contractorId);
    if (upErr) throw upErr;

    return new Response(JSON.stringify({ ok: true, email: primary, extras, source }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('cf-extract-email-single error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
