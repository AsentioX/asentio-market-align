// CSLB ingest: streams an uploaded CSLB License Master CSV from the cf-ingest bucket
// and batch-upserts contractors into cf_contractors.
//
// This function is RESUMABLE & SELF-CHAINING. Each invocation processes a slice of
// the file (bounded by wall-time MAX_WALL_MS), persists the byte offset, and then
// re-invokes itself until EOF. This avoids edge-function wall-time limits when
// ingesting the full ~290k-row, ~77 MB CSLB master CSV.
//
// Initial call (from admin UI):
//   POST { storage_path: string }                 → 200 { run_id, status: 'started' }
// Internal resume call (function → function):
//   POST { run_id: string } with header x-internal-resume: 1
//                                                 → 200 { run_id, status: 'chunk_done' | 'complete' }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-resume',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const BATCH_SIZE = 250;
const MAX_WALL_MS = 5_000; // keep each invocation safely under edge CPU limits
const MAX_BYTES_PER_CHUNK = 768 * 1024;
const MAX_ROWS_PER_CHUNK = 2_000;

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

const tradeFor = (p: string | undefined) => (p && CLASS_LABELS[p]) || p || 'Other';

function storageObjectUrl(path: string): string {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return `${SUPABASE_URL}/storage/v1/object/cf-ingest/${encodedPath}`;
}

async function fetchStorageRange(storagePath: string, start: number, maxBytes: number) {
  const end = start + maxBytes - 1;
  const res = await fetch(storageObjectUrl(storagePath), {
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      Range: `bytes=${start}-${end}`,
    },
  });

  if (res.status === 416) {
    const contentRange = res.headers.get('content-range') || '';
    const total = Number(contentRange.match(/\*\/(\d+)/)?.[1] || start);
    return { text: '', fileSize: total, reachedEof: true };
  }

  if (!res.ok && res.status !== 206) {
    throw new Error(`Download failed: ${res.status} ${await res.text()}`);
  }

  const text = await res.text();
  const contentRange = res.headers.get('content-range') || '';
  const m = contentRange.match(/bytes (\d+)-(\d+)\/(\d+|\*)/);
  if (m && m[3] !== '*') {
    const rangeEnd = Number(m[2]);
    const fileSize = Number(m[3]);
    return { text, fileSize, reachedEof: rangeEnd + 1 >= fileSize };
  }

  const contentLength = Number(res.headers.get('content-length') || 0);
  return { text, fileSize: start + contentLength, reachedEof: res.status === 200 };
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

function buildHeaderIndexFromObj(obj: Record<string, number>): Map<string, number> {
  return new Map(Object.entries(obj));
}

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

// Process one chunk of the file, starting at run.bytes_processed.
// Returns when EOF reached OR wall-time budget consumed.
async function processChunk(runId: string) {
  const started = Date.now();
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: run, error: runErr } = await admin
    .from('cf_ingest_runs').select('*').eq('id', runId).single();
  if (runErr || !run) throw new Error(`run not found: ${runErr?.message}`);
  if (run.status === 'cancelled') {
    console.log(`run ${runId} is cancelled — aborting chunk`);
    return { done: true, bytesProcessed: run.bytes_processed ?? 0, inserted: run.inserted_rows ?? 0, totalRows: run.total_rows ?? 0 };
  }

  const storage_path = run.storage_path as string;
  let bytesProcessed: number = Number(run.bytes_processed ?? 0);
  let inserted: number = Number(run.inserted_rows ?? 0);
  let failed: number = Number(run.failed_rows ?? 0);
  let totalRows: number = Number(run.total_rows ?? 0);
  let skippedRows: number = Number(run.skipped_rows ?? 0);
  let lastError = '';
  let headerIdx: Map<string, number> | null = run.headers_json
    ? buildHeaderIndexFromObj(run.headers_json as Record<string, number>)
    : null;

  const range = await fetchStorageRange(storage_path, bytesProcessed, MAX_BYTES_PER_CHUNK);
  const fileSize = range.fileSize;
  if (!run.file_size) {
    await admin.from('cf_ingest_runs').update({ file_size: fileSize }).eq('id', runId);
  }

  let buffer = '';
  let inQuotes = false;
  let lineStart = 0;
  let consumedInSlice = 0; // bytes from the start of the slice that have been "committed"
  let batch: ReturnType<typeof mapRow>[] = [];
  let reachedChunkLimit = false;
  let rowsThisChunk = 0;

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

  // Sample of CSV row numbers (1-indexed within data rows) that were skipped
  // because they had no license_number. Capped to avoid unbounded growth.
  const skippedSamples: { row: number; business_name: string | null }[] =
    Array.isArray((run.verification as { skipped_samples?: unknown })?.skipped_samples)
      ? ((run.verification as { skipped_samples: { row: number; business_name: string | null }[] }).skipped_samples)
      : [];
  const MAX_SKIPPED_SAMPLES = 50;

  const persistProgress = async (extraStatus?: string) => {
    const update: Record<string, unknown> = {
      bytes_processed: bytesProcessed,
      inserted_rows: inserted,
      failed_rows: failed,
      total_rows: totalRows,
      skipped_rows: skippedRows,
      error_message: lastError || null,
      // Persist the running skipped-sample buffer so a resumed run can keep building on it.
      verification: { in_progress: true, skipped_samples: skippedSamples },
    };
    if (extraStatus) update.status = extraStatus;
    await admin.from('cf_ingest_runs').update(update).eq('id', runId);
  };

  // Helper: byte length of a JS string in UTF-8 (for byte offset tracking after newline)
  const enc = new TextEncoder();

  const processBuffer = async (final = false) => {
    let i = 0;
    while (i < buffer.length) {
      const ch = buffer[i];
      if (ch === '"') {
        if (inQuotes && buffer[i + 1] === '"') { i += 2; continue; }
        inQuotes = !inQuotes;
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        const line = buffer.slice(lineStart, i);
        let lineEnd = i;
        if (ch === '\r' && buffer[i + 1] === '\n') lineEnd = i + 1;
        if (line.length) {
          if (!headerIdx) {
            const headerCells = parseLine(line);
            headerIdx = buildHeaderIndex(headerCells);
            // Persist headers as a plain object {normalized_key: index}
            const headerObj: Record<string, number> = {};
            headerIdx.forEach((v, k) => { headerObj[k] = v; });
            await admin.from('cf_ingest_runs').update({ headers_json: headerObj }).eq('id', runId);
          } else {
            const cells = parseLine(line);
            const rec = mapRow(cells, headerIdx);
            if (rec) {
              batch.push(rec);
              totalRows++;
              rowsThisChunk++;
              if (batch.length >= BATCH_SIZE) {
                await flush();
              }
            } else {
              // No license_number — flag for the verification report
              skippedRows++;
              if (skippedSamples.length < MAX_SKIPPED_SAMPLES) {
                const businessIdx = headerIdx.get('businessname');
                const bn = businessIdx !== undefined ? (cells[businessIdx] ?? null) : null;
                skippedSamples.push({
                  row: totalRows + skippedRows,
                  business_name: bn && bn.length ? bn : null,
                });
              }
            }
          }
        }
        // Advance committed byte cursor to just past the newline
        const committedSlice = buffer.slice(lineStart, lineEnd + 1);
        consumedInSlice += enc.encode(committedSlice).length;
        bytesProcessed = (run.bytes_processed ?? 0) + consumedInSlice;
        lineStart = lineEnd + 1;
        i = lineEnd + 1;

        // Checkpoint at line boundary so we can resume cleanly
        if (!final && (Date.now() - started > MAX_WALL_MS || rowsThisChunk >= MAX_ROWS_PER_CHUNK)) {
          reachedChunkLimit = true;
          // discard remainder of buffer; we'll resume from bytesProcessed next call
          buffer = '';
          lineStart = 0;
          await flush();
          await persistProgress();
          return;
        }
        continue;
      }
      i++;
    }
    // Drop committed portion of buffer to keep it bounded
    if (lineStart > 0) {
      buffer = buffer.slice(lineStart);
      lineStart = 0;
    }
    if (final && buffer.trim().length) {
      const remaining = buffer.replace(/\r?\n?$/, '');
      if (!headerIdx) headerIdx = buildHeaderIndex(parseLine(remaining));
      else {
        const cells = parseLine(remaining);
        const rec = mapRow(cells, headerIdx);
        if (rec) { batch.push(rec); totalRows++; }
        else {
          skippedRows++;
          if (skippedSamples.length < MAX_SKIPPED_SAMPLES) {
            const businessIdx = headerIdx.get('businessname');
            const bn = businessIdx !== undefined ? (cells[businessIdx] ?? null) : null;
            skippedSamples.push({
              row: totalRows + skippedRows,
              business_name: bn && bn.length ? bn : null,
            });
          }
        }
      }
      consumedInSlice += enc.encode(remaining).length;
      bytesProcessed = (run.bytes_processed ?? 0) + consumedInSlice;
      buffer = '';
    }
  };

  try {
    if (bytesProcessed === 0) {
      await admin.from('cf_ingest_runs').update({ status: 'inserting' }).eq('id', runId);
    }

    buffer += range.text;
    await processBuffer(range.reachedEof);
    if (reachedChunkLimit) {
      return { done: false, bytesProcessed, inserted, totalRows };
    }

    if (!range.reachedEof) {
      // Avoid processing a partial trailing row; resume from the last committed newline.
      await flush();
      await persistProgress();
      return { done: false, bytesProcessed, inserted, totalRows };
    }

    await flush();

    // ── Post-ingest verification report ──────────────────────────────────────
    // Compare the CSV's data-row count against the contractors table count
    // and surface any rows that were skipped because they were missing a
    // license_number.
    bytesProcessed = fileSize;

    const csvDataRows = totalRows + skippedRows;
    const { count: dbRowCount, error: countErr } = await admin
      .from('cf_contractors')
      .select('*', { count: 'exact', head: true });
    if (countErr) console.error('verification count failed', countErr.message);

    const dbCount = dbRowCount ?? 0;
    const rowCountDelta = dbCount - csvDataRows;
    const checks = {
      row_count_match: dbCount >= totalRows, // every parseable CSV row should have an upserted contractor
      no_missing_license_numbers: skippedRows === 0,
    };
    const verification = {
      ran_at: new Date().toISOString(),
      csv_data_rows: csvDataRows,
      csv_parseable_rows: totalRows,
      csv_rows_missing_license: skippedRows,
      db_row_count: dbCount,
      row_count_delta: rowCountDelta,
      inserted_in_run: inserted,
      failed_in_run: failed,
      checks,
      passed: checks.row_count_match && checks.no_missing_license_numbers,
      skipped_samples: skippedSamples,
      notes: countErr ? `db count failed: ${countErr.message}` : null,
    };

    const finalStatus = failed === totalRows && totalRows > 0 ? 'failed' : 'complete';
    await admin.from('cf_ingest_runs').update({
      status: finalStatus,
      bytes_processed: bytesProcessed,
      inserted_rows: inserted,
      failed_rows: failed,
      total_rows: totalRows,
      skipped_rows: skippedRows,
      error_message: lastError || null,
      verification,
      finished_at: new Date().toISOString(),
    }).eq('id', runId);
    return { done: true, bytesProcessed, inserted, totalRows };
  } catch (err) {
    console.error('processChunk error', err);
    await admin.from('cf_ingest_runs').update({
      status: 'failed',
      bytes_processed: bytesProcessed,
      inserted_rows: inserted,
      failed_rows: failed,
      total_rows: totalRows,
      error_message: err instanceof Error ? err.message : 'Unknown error',
      finished_at: new Date().toISOString(),
    }).eq('id', runId);
    throw err;
  }
}

// Fire-and-forget self-invoke for the next chunk
async function scheduleResume(runId: string) {
  const url = `${SUPABASE_URL}/functions/v1/cslb-ingest`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'x-internal-resume': '1',
      },
      body: JSON.stringify({ run_id: runId }),
    });
  } catch (e) {
    console.error('scheduleResume failed', e);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const isInternalResume = req.headers.get('x-internal-resume') === '1';
    const body = await req.json().catch(() => ({}));

    // ---- Internal resume path: process next chunk, then re-chain if needed ----
    if (isInternalResume) {
      const authHeader = req.headers.get('Authorization') || '';
      if (!authHeader.includes(SERVICE_KEY)) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const run_id: string | undefined = body.run_id;
      if (!run_id) {
        return new Response(JSON.stringify({ error: 'run_id required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // @ts-ignore EdgeRuntime available in Supabase edge
      EdgeRuntime.waitUntil((async () => {
        try {
          const res = await processChunk(run_id);
          if (!res.done) await scheduleResume(run_id);
        } catch (e) {
          console.error('resume processChunk failed', e);
        }
      })());
      return new Response(JSON.stringify({ run_id, status: 'chunk_started' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- Initial admin-triggered path ----
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

    // Support two modes from the admin UI:
    //   1) { storage_path } → create new run and start
    //   2) { resume_run_id } → resume an existing run that was previously interrupted
    const storage_path: string | undefined = body.storage_path;
    const resume_run_id: string | undefined = body.resume_run_id;

    let runId: string;
    if (resume_run_id) {
      runId = resume_run_id;
      await admin.from('cf_ingest_runs')
        .update({ status: 'inserting', error_message: null, finished_at: null })
        .eq('id', runId);
    } else {
      if (!storage_path) {
        return new Response(JSON.stringify({ error: 'storage_path or resume_run_id required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: run, error: runErr } = await admin
        .from('cf_ingest_runs')
        .insert({
          source: 'CSLB',
          file_name: storage_path,
          storage_path,
          status: 'parsing',
          created_by: userId,
          bytes_processed: 0,
        })
        .select('id').single();
      if (runErr || !run) throw new Error(runErr?.message || 'failed to create run');
      runId = run.id;
    }

    // @ts-ignore EdgeRuntime available in Supabase edge
    EdgeRuntime.waitUntil((async () => {
      try {
        const res = await processChunk(runId);
        if (!res.done) await scheduleResume(runId);
      } catch (e) {
        console.error('initial processChunk failed', e);
      }
    })());

    return new Response(
      JSON.stringify({ run_id: runId, status: 'started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('cslb-ingest error', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
