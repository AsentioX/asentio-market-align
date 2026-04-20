// CSLB ingest: streams an uploaded CSLB License Master CSV from the cf-ingest bucket
// and batch-upserts contractors into cf_contractors. Returns immediately with a run_id;
// the heavy work continues in the background via EdgeRuntime.waitUntil.
//
// POST body: { storage_path: string }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CLASS_LABELS: Record<string, string> = {
  'A': 'General Engineering', 'B': 'General Contractor', 'B-2': 'Residential Remodeling',
  'C-2': 'Insulation / Acoustical', 'C-4': 'Boiler / Hot Water Heating', 'C-5': 'Framing / Rough Carpentry',
  'C-6': 'Cabinet Installer', 'C-7': 'Low Voltage Systems', 'C-8': 'Concrete', 'C-9': 'Drywall',
  'C-10': 'Electrician', 'C-11': 'Elevator', 'C-12': 'Earthwork / Paving', 'C-13': 'Fencing',
  'C-15': 'Flooring Installer', 'C-16': 'Fire Protection', 'C-17': 'Glazing', 'C-20': 'HVAC',
  'C-21': 'Building Moving / Demo', 'C-22': 'Asbestos Abatement', 'C-23': 'Ornamental Metals',
  'C-27': 'Landscaping', 'C-28': 'Locksmith', 'C-29': 'Masonry', 'C-31': 'Construction Zone Traffic',
  'C-32': 'Parking / Highway Improvement', 'C-33': 'Painter', 'C-34': 'Pipeline', 'C-35': 'Plastering',
  'C-36': 'Plumber', 'C-38': 'Refrigeration', 'C-39': 'Roofer', 'C-42': 'Sanitation System',
  'C-43': 'Sheet Metal', 'C-45': 'Sign', 'C-46': 'Solar', 'C-47': 'General Manufactured Housing',
  'C-49': 'Tree Service', 'C-50': 'Reinforcing Steel', 'C-51': 'Structural Steel',
  'C-53': 'Swimming Pool', 'C-54': 'Tile Installer', 'C-55': 'Water Conditioning',
  'C-57': 'Well Drilling', 'C-60': 'Welding', 'C-61': 'Limited Specialty',
};

function tradeFor(primary: string | undefined): string {
  if (!primary) return 'Other';
  return CLASS_LABELS[primary] ?? primary;
}

function estimateSize(bondAmount: number | null, classCount: number): string {
  if (bondAmount && bondAmount >= 25000) return classCount >= 3 ? 'Mid-Sized' : 'Growing Local';
  if (classCount >= 4) return 'Multi-Location';
  if (classCount >= 2) return 'Growing Local';
  return 'Small Crew';
}

function parseDate(s: string | undefined): string | null {
  if (!s || !s.trim()) return null;
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return null;
}

function parseNumber(s: string | undefined): number | null {
  if (!s || !s.trim()) return null;
  const n = Number(s.replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

// Build a normalized header lookup once
function buildHeaderIndex(headers: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headers.forEach((h, i) => {
    const k = h.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (!map.has(k)) map.set(k, i);
  });
  return map;
}

function getCell(row: string[], idx: Map<string, number>, ...keys: string[]): string {
  for (const k of keys) {
    const norm = k.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const i = idx.get(norm);
    if (i !== undefined && row[i] !== undefined) return row[i];
  }
  return '';
}

function mapRow(row: string[], idx: Map<string, number>) {
  const license_number = getCell(row, idx, 'LicenseNo', 'License Number', 'LicenseNumber');
  if (!license_number) return null;
  const classRaw = getCell(row, idx, 'Classifications(s)', 'Classifications', 'Classification');
  const classifications = classRaw ? classRaw.split(/[|,;]/).map((s) => s.trim()).filter(Boolean) : [];
  const primary = classifications[0];
  const bondAmount = parseNumber(getCell(row, idx, 'BondAmount', 'Bond Amount'));
  return {
    license_number,
    business_name: getCell(row, idx, 'BusinessName', 'Business Name') || 'Unknown',
    business_type: getCell(row, idx, 'BusinessType', 'Business Type') || null,
    address: getCell(row, idx, 'MailingAddress', 'Mailing Address', 'Address') || null,
    city: getCell(row, idx, 'City') || null,
    county: getCell(row, idx, 'County') || null,
    state: getCell(row, idx, 'State') || 'CA',
    zip_code: getCell(row, idx, 'ZipCode', 'Zip Code', 'Zip') || null,
    phone: getCell(row, idx, 'Phone', 'BusinessPhone') || null,
    license_status: getCell(row, idx, 'PrimaryStatus', 'LicenseStatus', 'License Status', 'Status') || null,
    issue_date: parseDate(getCell(row, idx, 'IssueDate', 'Issue Date')),
    reissue_date: parseDate(getCell(row, idx, 'ReissueDate', 'Reissue Date')),
    expiration_date: parseDate(getCell(row, idx, 'ExpirationDate', 'Expiration Date')),
    inactivation_date: parseDate(getCell(row, idx, 'InactivationDate', 'Inactivation Date')),
    reactivation_date: parseDate(getCell(row, idx, 'ReactivationDate', 'Reactivation Date')),
    classifications,
    primary_classification: primary || null,
    bond_company: getCell(row, idx, 'BondingCompanyName', 'Bonding Company') || null,
    bond_number: getCell(row, idx, 'BondNumber', 'Bond Number') || null,
    bond_amount: bondAmount,
    bond_effective_date: parseDate(getCell(row, idx, 'BondingEffectiveDate', 'Bond Effective Date', 'BondEffectiveDate')),
    bond_cancellation_date: parseDate(getCell(row, idx, 'BondingCancellationDate', 'BondCancellationDate')),
    wc_company: getCell(row, idx, 'WorkersCompInsuranceCompanyName', 'WC Company') || null,
    wc_policy_number: getCell(row, idx, 'WorkersCompInsurancePolicyNumber') || null,
    wc_effective_date: parseDate(getCell(row, idx, 'WorkersCompInsuranceEffectiveDate')),
    wc_cancellation_date: parseDate(getCell(row, idx, 'WorkersCompInsuranceExpirationDate', 'WorkersCompInsuranceCancellationDate')),
    contractor_type: tradeFor(primary),
    estimated_company_size: estimateSize(bondAmount, classifications.length),
    confidence_score: 80,
    source_count: 1,
    source_urls: ['Official License Source (CSLB)'],
    last_verified_date: new Date().toISOString(),
  };
}

// Streams the storage object, parses CSV row-by-row, batch-upserts, never holds full file in memory.
async function processFile(runId: string, storage_path: string) {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const BATCH_SIZE = 500;
  let inserted = 0;
  let failed = 0;
  let totalRows = 0;
  let lastError = '';
  let headerIdx: Map<string, number> | null = null;
  let batch: ReturnType<typeof mapRow>[] = [];

  const flush = async () => {
    if (!batch.length) return;
    const chunk = batch.filter(Boolean) as NonNullable<ReturnType<typeof mapRow>>[];
    batch = [];
    if (!chunk.length) return;
    const { error } = await admin
      .from('cf_contractors')
      .upsert(chunk, { onConflict: 'license_number', ignoreDuplicates: false });
    if (error) {
      failed += chunk.length;
      lastError = error.message;
      console.error('upsert error', error.message);
    } else {
      inserted += chunk.length;
    }
  };

  try {
    const { data: file, error: dlErr } = await admin.storage.from('cf-ingest').download(storage_path);
    if (dlErr || !file) throw new Error(`Download failed: ${dlErr?.message}`);

    if (storage_path.toLowerCase().endsWith('.zip')) {
      throw new Error('ZIP not supported in streaming mode — please upload the unzipped CSV.');
    }

    const reader = file.stream().pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    let inQuotes = false;
    let lineStart = 0;

    const processBuffer = async (final = false) => {
      let i = 0;
      while (i < buffer.length) {
        const ch = buffer[i];
        if (ch === '"') {
          if (inQuotes && buffer[i + 1] === '"') { i += 2; continue; }
          inQuotes = !inQuotes;
        } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
          const line = buffer.slice(lineStart, i);
          if (line.length) {
            if (!headerIdx) {
              headerIdx = buildHeaderIndex(parseLine(line));
            } else {
              const cells = parseLine(line);
              const rec = mapRow(cells, headerIdx);
              if (rec) {
                batch.push(rec);
                totalRows++;
                if (batch.length >= BATCH_SIZE) {
                  await flush();
                  await admin.from('cf_ingest_runs')
                    .update({ inserted_rows: inserted, failed_rows: failed, total_rows: totalRows })
                    .eq('id', runId);
                }
              }
            }
          }
          if (ch === '\r' && buffer[i + 1] === '\n') i++;
          lineStart = i + 1;
        }
        i++;
      }
      buffer = buffer.slice(lineStart);
      lineStart = 0;
      if (final && buffer.trim().length) {
        if (!headerIdx) headerIdx = buildHeaderIndex(parseLine(buffer));
        else {
          const rec = mapRow(parseLine(buffer), headerIdx);
          if (rec) { batch.push(rec); totalRows++; }
        }
        buffer = '';
      }
    };

    await admin.from('cf_ingest_runs').update({ status: 'inserting' }).eq('id', runId);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      await processBuffer(false);
    }
    await processBuffer(true);
    await flush();

    await admin.from('cf_ingest_runs').update({
      status: failed === totalRows && totalRows > 0 ? 'failed' : 'complete',
      inserted_rows: inserted,
      failed_rows: failed,
      total_rows: totalRows,
      error_message: lastError || null,
      finished_at: new Date().toISOString(),
    }).eq('id', runId);
  } catch (err) {
    console.error('processFile error', err);
    await admin.from('cf_ingest_runs').update({
      status: 'failed',
      inserted_rows: inserted,
      failed_rows: failed,
      total_rows: totalRows,
      error_message: err instanceof Error ? err.message : 'Unknown error',
      finished_at: new Date().toISOString(),
    }).eq('id', runId);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: profile } = await admin
      .from('profiles').select('role').eq('id', userId).maybeSingle();
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const storage_path: string | undefined = body.storage_path;
    if (!storage_path) {
      return new Response(JSON.stringify({ error: 'storage_path required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: run, error: runErr } = await admin
      .from('cf_ingest_runs')
      .insert({ source: 'CSLB', file_name: storage_path, status: 'parsing', created_by: userId })
      .select('id').single();
    if (runErr || !run) throw new Error(runErr?.message || 'failed to create run');

    // Run the heavy work in the background. Returns immediately.
    // @ts-ignore - EdgeRuntime is available in Supabase edge functions
    EdgeRuntime.waitUntil(processFile(run.id, storage_path));

    return new Response(
      JSON.stringify({ run_id: run.id, status: 'started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('cslb-ingest error', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
