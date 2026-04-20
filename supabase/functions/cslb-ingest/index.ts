// CSLB ingest: parses an uploaded CSLB License Master CSV/ZIP from the cf-ingest bucket
// and batch-upserts contractors into cf_contractors.
//
// POST body: { storage_path: string, run_id?: string }
// Auth: caller must be an admin (validated against profiles table).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { unzipSync, strFromU8 } from 'https://esm.sh/fflate@0.8.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Map CSLB primary classification code -> friendly trade name
const CLASS_LABELS: Record<string, string> = {
  'A': 'General Engineering',
  'B': 'General Contractor',
  'B-2': 'Residential Remodeling',
  'C-2': 'Insulation / Acoustical',
  'C-4': 'Boiler / Hot Water Heating',
  'C-5': 'Framing / Rough Carpentry',
  'C-6': 'Cabinet Installer',
  'C-7': 'Low Voltage Systems',
  'C-8': 'Concrete',
  'C-9': 'Drywall',
  'C-10': 'Electrician',
  'C-11': 'Elevator',
  'C-12': 'Earthwork / Paving',
  'C-13': 'Fencing',
  'C-15': 'Flooring Installer',
  'C-16': 'Fire Protection',
  'C-17': 'Glazing',
  'C-20': 'HVAC',
  'C-21': 'Building Moving / Demo',
  'C-22': 'Asbestos Abatement',
  'C-23': 'Ornamental Metals',
  'C-27': 'Landscaping',
  'C-28': 'Locksmith',
  'C-29': 'Masonry',
  'C-31': 'Construction Zone Traffic',
  'C-32': 'Parking / Highway Improvement',
  'C-33': 'Painter',
  'C-34': 'Pipeline',
  'C-35': 'Plastering',
  'C-36': 'Plumber',
  'C-38': 'Refrigeration',
  'C-39': 'Roofer',
  'C-42': 'Sanitation System',
  'C-43': 'Sheet Metal',
  'C-45': 'Sign',
  'C-46': 'Solar',
  'C-47': 'General Manufactured Housing',
  'C-49': 'Tree Service',
  'C-50': 'Reinforcing Steel',
  'C-51': 'Structural Steel',
  'C-53': 'Swimming Pool',
  'C-54': 'Tile Installer',
  'C-55': 'Water Conditioning',
  'C-57': 'Well Drilling',
  'C-60': 'Welding',
  'C-61': 'Limited Specialty',
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
  // CSLB dates are MM/DD/YYYY
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  // Already ISO?
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return null;
}

function parseNumber(s: string | undefined): number | null {
  if (!s || !s.trim()) return null;
  const n = Number(s.replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : null;
}

// Streaming CSV parser that handles quoted fields and CRLF
class CSVParser {
  private buffer = '';
  private headers: string[] = [];
  private headerParsed = false;

  feed(chunk: string): Record<string, string>[] {
    this.buffer += chunk;
    const rows: Record<string, string>[] = [];
    let i = 0;
    let lineStart = 0;
    let inQuotes = false;
    while (i < this.buffer.length) {
      const ch = this.buffer[i];
      if (ch === '"') {
        if (inQuotes && this.buffer[i + 1] === '"') {
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        const line = this.buffer.slice(lineStart, i);
        if (line) {
          if (!this.headerParsed) {
            this.headers = parseLine(line);
            this.headerParsed = true;
          } else {
            const cells = parseLine(line);
            const row: Record<string, string> = {};
            for (let h = 0; h < this.headers.length; h++) row[this.headers[h]] = cells[h] ?? '';
            rows.push(row);
          }
        }
        // skip CRLF
        if (ch === '\r' && this.buffer[i + 1] === '\n') i++;
        lineStart = i + 1;
      }
      i++;
    }
    this.buffer = this.buffer.slice(lineStart);
    return rows;
  }

  flush(): Record<string, string>[] {
    const rows: Record<string, string>[] = [];
    if (this.buffer.trim()) {
      if (!this.headerParsed) {
        this.headers = parseLine(this.buffer);
      } else {
        const cells = parseLine(this.buffer);
        const row: Record<string, string> = {};
        for (let h = 0; h < this.headers.length; h++) row[this.headers[h]] = cells[h] ?? '';
        rows.push(row);
      }
    }
    this.buffer = '';
    return rows;
  }

  getHeaders() {
    return this.headers;
  }
}

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

// Map a CSLB row to a contractor record
function mapRow(row: Record<string, string>) {
  // Headers in CSLB License Master vary slightly by year. Normalize lookup.
  const get = (...keys: string[]) => {
    for (const k of keys) {
      for (const actual of Object.keys(row)) {
        if (actual.replace(/[^a-z0-9]/gi, '').toLowerCase() === k.replace(/[^a-z0-9]/gi, '').toLowerCase()) {
          return row[actual];
        }
      }
    }
    return '';
  };

  const license_number = get('LicenseNo', 'License Number', 'LicenseNumber');
  if (!license_number) return null;

  const classRaw = get('Classifications(s)', 'Classifications', 'Classification');
  const classifications = classRaw
    ? classRaw.split(/[|,;]/).map((s) => s.trim()).filter(Boolean)
    : [];
  const primary = classifications[0];
  const bondAmount = parseNumber(get('BondAmount', 'Bond Amount'));

  return {
    license_number,
    business_name: get('BusinessName', 'Business Name') || 'Unknown',
    business_type: get('BusinessType', 'Business Type') || null,
    address: get('MailingAddress', 'Mailing Address', 'Address') || null,
    city: get('City') || null,
    county: get('County') || null,
    state: get('State') || 'CA',
    zip_code: get('ZipCode', 'Zip Code', 'Zip') || null,
    phone: get('Phone', 'BusinessPhone') || null,
    license_status: get('PrimaryStatus', 'LicenseStatus', 'License Status', 'Status') || null,
    issue_date: parseDate(get('IssueDate', 'Issue Date')),
    reissue_date: parseDate(get('ReissueDate', 'Reissue Date')),
    expiration_date: parseDate(get('ExpirationDate', 'Expiration Date')),
    inactivation_date: parseDate(get('InactivationDate', 'Inactivation Date')),
    reactivation_date: parseDate(get('ReactivationDate', 'Reactivation Date')),
    classifications,
    primary_classification: primary || null,
    bond_company: get('BondingCompanyName', 'Bonding Company') || null,
    bond_number: get('BondNumber', 'Bond Number') || null,
    bond_amount: bondAmount,
    bond_effective_date: parseDate(get('BondingEffectiveDate', 'Bond Effective Date', 'BondEffectiveDate')),
    bond_cancellation_date: parseDate(get('BondingCancellationDate', 'BondCancellationDate')),
    wc_company: get('WorkersCompInsuranceCompanyName', 'WC Company') || null,
    wc_policy_number: get('WorkersCompInsurancePolicyNumber') || null,
    wc_effective_date: parseDate(get('WorkersCompInsuranceEffectiveDate')),
    wc_cancellation_date: parseDate(get('WorkersCompInsuranceExpirationDate', 'WorkersCompInsuranceCancellationDate')),
    contractor_type: tradeFor(primary),
    estimated_company_size: estimateSize(bondAmount, classifications.length),
    confidence_score: 80,
    source_count: 1,
    source_urls: ['Official License Source (CSLB)'],
    last_verified_date: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const storage_path: string | undefined = body.storage_path;
    if (!storage_path) {
      return new Response(JSON.stringify({ error: 'storage_path required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a run record
    const { data: run, error: runErr } = await admin
      .from('cf_ingest_runs')
      .insert({
        source: 'CSLB',
        file_name: storage_path,
        status: 'parsing',
        created_by: userId,
      })
      .select('id')
      .single();
    if (runErr || !run) throw new Error(runErr?.message || 'failed to create run');
    const runId = run.id;

    // Download the file
    const { data: file, error: dlErr } = await admin.storage.from('cf-ingest').download(storage_path);
    if (dlErr || !file) throw new Error(`Download failed: ${dlErr?.message}`);

    let csvText: string;
    const buffer = new Uint8Array(await file.arrayBuffer());
    const isZip = storage_path.toLowerCase().endsWith('.zip') || (buffer[0] === 0x50 && buffer[1] === 0x4b);
    if (isZip) {
      const unzipped = unzipSync(buffer);
      // Find the largest .csv inside (License Master is usually the biggest)
      let bestName = '';
      let bestSize = 0;
      for (const [name, data] of Object.entries(unzipped)) {
        if (name.toLowerCase().endsWith('.csv') && data.length > bestSize) {
          bestName = name;
          bestSize = data.length;
        }
      }
      if (!bestName) throw new Error('No CSV found in ZIP');
      csvText = strFromU8(unzipped[bestName]);
    } else {
      csvText = new TextDecoder().decode(buffer);
    }

    // Parse + batch insert
    const parser = new CSVParser();
    const rows = parser.feed(csvText).concat(parser.flush());

    await admin.from('cf_ingest_runs').update({ status: 'inserting', total_rows: rows.length }).eq('id', runId);

    const BATCH_SIZE = 500;
    let inserted = 0;
    let failed = 0;
    let lastError = '';

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE).map(mapRow).filter(Boolean) as ReturnType<typeof mapRow>[];
      if (!chunk.length) continue;
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
      // Periodic progress update every ~5k rows
      if (i % (BATCH_SIZE * 10) === 0) {
        await admin
          .from('cf_ingest_runs')
          .update({ inserted_rows: inserted, failed_rows: failed })
          .eq('id', runId);
      }
    }

    await admin
      .from('cf_ingest_runs')
      .update({
        status: failed === rows.length ? 'failed' : 'complete',
        inserted_rows: inserted,
        failed_rows: failed,
        error_message: lastError || null,
        finished_at: new Date().toISOString(),
      })
      .eq('id', runId);

    return new Response(
      JSON.stringify({ run_id: runId, total: rows.length, inserted, failed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('cslb-ingest error', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
