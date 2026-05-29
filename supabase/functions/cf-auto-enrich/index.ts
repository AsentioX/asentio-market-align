// Background auto-enrichment loop. On each invocation:
//  1. Checks the singleton cf_auto_enrich_state row — bails if is_running = false.
//  2. Runs one discovery batch (contractors missing a website) via cf-discover-websites.
//  3. Runs one extraction batch (contractors with a website but missing email) via cf-extract-emails.
//  4. Updates counters / heartbeat, then self-invokes (fire-and-forget) so the loop continues
//     until either no work remains or an admin flips is_running back to false from the UI.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

async function invokeChild(fn: string, body: unknown) {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'Content-Type': 'application/json',
      // Mark these internal calls so the child functions skip their admin-auth gate.
      'x-cf-internal': 'auto-enrich',
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let data: any = {};
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: r.ok, status: r.status, data };
}

function selfInvoke() {
  // Fire-and-forget — we don't await so the current invocation can return promptly.
  fetch(`${SUPABASE_URL}/functions/v1/cf-auto-enrich`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'Content-Type': 'application/json',
      'x-cf-internal': 'auto-enrich-chain',
    },
    body: JSON.stringify({ chained: true }),
  }).catch(() => { /* ignore */ });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const isInternal = req.headers.get('x-cf-internal')?.startsWith('auto-enrich') === true;

  // Manual (UI) calls must be from an admin. Chained internal calls skip this.
  if (!isInternal) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!userData?.user) {
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
  }

  const body = await req.json().catch(() => ({} as any));
  const action: 'start' | 'stop' | 'tick' = body?.action ?? (body?.chained ? 'tick' : 'tick');

  // Load current state
  const { data: state } = await supabase
    .from('cf_auto_enrich_state')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (!state) {
    return new Response(JSON.stringify({ error: 'state row missing' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // START — turn the flag on and kick off the first tick
  if (action === 'start') {
    const discoveryBatch = Math.min(Math.max(Number(body?.discoveryBatch ?? state.discovery_batch ?? 25), 1), 100);
    const extractionBatch = Math.min(Math.max(Number(body?.extractionBatch ?? state.extraction_batch ?? 25), 1), 100);
    await supabase.from('cf_auto_enrich_state').update({
      is_running: true,
      phase: 'discovering',
      discovery_batch: discoveryBatch,
      extraction_batch: extractionBatch,
      websites_found: 0,
      emails_found: 0,
      ticks: 0,
      message: 'Starting…',
      started_at: new Date().toISOString(),
      last_tick_at: new Date().toISOString(),
      finished_at: null,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    selfInvoke();
    return new Response(JSON.stringify({ ok: true, started: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // STOP — flip the flag off; the next tick (if any) will bail.
  if (action === 'stop') {
    await supabase.from('cf_auto_enrich_state').update({
      is_running: false,
      phase: 'idle',
      message: 'Stopped by user',
      finished_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    return new Response(JSON.stringify({ ok: true, stopped: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // TICK — only run if the job is still flagged as running
  if (!state.is_running) {
    return new Response(JSON.stringify({ ok: true, skipped: 'not running' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let websitesThisTick = 0;
  let emailsThisTick = 0;
  let phase = state.phase;
  let message = '';

  // --- Discovery step: pick contractors with no website
  const { count: missingWebsiteCount } = await supabase
    .from('cf_contractors')
    .select('*', { count: 'exact', head: true })
    .or('website.is.null,website.eq.');

  if ((missingWebsiteCount ?? 0) > 0) {
    phase = 'discovering';
    const r = await invokeChild('cf-discover-websites', { limit: state.discovery_batch });
    if (r.ok) {
      websitesThisTick = Number(r.data?.websites_found ?? 0);
      message = `Discovery: +${websitesThisTick} websites (${missingWebsiteCount} remaining)`;
    } else {
      message = `Discovery error (${r.status}): ${String(r.data?.error ?? '').slice(0, 120)}`;
    }
  }

  // --- Extraction step: pick contractors with website but no email yet
  const { count: pendingExtractionCount } = await supabase
    .from('cf_contractors')
    .select('*', { count: 'exact', head: true })
    .not('website', 'is', null)
    .neq('website', '')
    .is('email', null)
    .eq('email_extraction_status', 'pending');

  if ((pendingExtractionCount ?? 0) > 0) {
    phase = 'extracting';
    const r = await invokeChild('cf-extract-emails', { limit: state.extraction_batch, onlyMissing: true });
    if (r.ok) {
      emailsThisTick = Number(r.data?.emails_found ?? 0);
      message = `${message ? message + ' · ' : ''}Extraction: +${emailsThisTick} emails (${pendingExtractionCount} pending)`;
    } else {
      message = `${message ? message + ' · ' : ''}Extraction error (${r.status}): ${String(r.data?.error ?? '').slice(0, 120)}`;
    }
  }

  const moreWork = (missingWebsiteCount ?? 0) > 0 || (pendingExtractionCount ?? 0) > 0;

  await supabase.from('cf_auto_enrich_state').update({
    phase: moreWork ? phase : 'complete',
    is_running: moreWork ? true : false,
    websites_found: (state.websites_found ?? 0) + websitesThisTick,
    emails_found: (state.emails_found ?? 0) + emailsThisTick,
    ticks: (state.ticks ?? 0) + 1,
    message: moreWork ? (message || 'Working…') : 'All caught up — no contractors left to enrich',
    last_tick_at: new Date().toISOString(),
    finished_at: moreWork ? null : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', 1);

  // Chain to next tick (background) only if there's still work AND nothing was done this tick
  // means we'd loop forever — so also require we actually made progress OR there's pending work.
  if (moreWork) {
    selfInvoke();
  }

  return new Response(
    JSON.stringify({
      ok: true,
      tick: (state.ticks ?? 0) + 1,
      websites_this_tick: websitesThisTick,
      emails_this_tick: emailsThisTick,
      missing_website_remaining: missingWebsiteCount,
      pending_extraction_remaining: pendingExtractionCount,
      more_work: moreWork,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
