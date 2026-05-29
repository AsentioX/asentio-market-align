import { useEffect, useRef, useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, Award, Clock, Activity, ArrowDown, Upload, ExternalLink, FileText, Loader2, Globe, Mail, Link2, Play, Search, Zap, StopCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCF } from './useCFStore';
import { useToast } from '@/hooks/use-toast';

interface VerificationReport {
  ran_at?: string;
  csv_data_rows?: number;
  csv_parseable_rows?: number;
  csv_rows_missing_license?: number;
  db_row_count?: number;
  row_count_delta?: number;
  inserted_in_run?: number;
  failed_in_run?: number;
  checks?: { row_count_match?: boolean; no_missing_license_numbers?: boolean };
  passed?: boolean;
  skipped_samples?: { row: number; business_name: string | null }[];
  notes?: string | null;
  in_progress?: boolean;
}

interface IngestRun {
  id: string;
  source: string;
  file_name: string | null;
  status: string;
  total_rows: number;
  inserted_rows: number;
  failed_rows: number;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
  bytes_processed?: number | null;
  file_size?: number | null;
  storage_path?: string | null;
  skipped_rows?: number | null;
  verification?: VerificationReport | null;
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byCounty: { county: string; count: number }[];
  lastVerified: string | null;
}

interface EmailStats {
  withWebsite: number;
  withEmail: number;
  pending: number;
  failed: number;
  noEmail: number;
  missingWebsite: number;
}

interface ExtractionRun {
  id: string;
  status: string;
  total_targets: number;
  processed: number;
  succeeded: number;
  failed: number;
  emails_found: number;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
}

export default function Pipeline() {
  const { toast } = useToast();
  const { reloadFromDb, dataSource } = useCF();
  const [runs, setRuns] = useState<IngestRun[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [extractionRuns, setExtractionRuns] = useState<ExtractionRun[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [websiteCsvUploading, setWebsiteCsvUploading] = useState(false);
  const [extractionRunning, setExtractionRunning] = useState(false);
  const [batchLimit, setBatchLimit] = useState(25);
  const [discoveryRunning, setDiscoveryRunning] = useState(false);
  const [discoveryLimit, setDiscoveryLimit] = useState(25);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const websiteCsvRef = useRef<HTMLInputElement>(null);

  // Auto-enrichment background job state (singleton row in cf_auto_enrich_state)
  interface AutoEnrichState {
    is_running: boolean;
    phase: string;
    discovery_batch: number;
    extraction_batch: number;
    websites_found: number;
    emails_found: number;
    ticks: number;
    message: string | null;
    started_at: string | null;
    last_tick_at: string | null;
    finished_at: string | null;
  }
  const [autoState, setAutoState] = useState<AutoEnrichState | null>(null);
  const [autoBusy, setAutoBusy] = useState(false);
  const [autoDiscoveryBatch, setAutoDiscoveryBatch] = useState(25);
  const [autoExtractionBatch, setAutoExtractionBatch] = useState(25);

  const loadAutoState = async () => {
    const { data } = await supabase
      .from('cf_auto_enrich_state')
      .select('is_running, phase, discovery_batch, extraction_batch, websites_found, emails_found, ticks, message, started_at, last_tick_at, finished_at')
      .eq('id', 1)
      .maybeSingle();
    if (data) {
      setAutoState(data as AutoEnrichState);
      setAutoDiscoveryBatch(data.discovery_batch);
      setAutoExtractionBatch(data.extraction_batch);
    }
  };

  const startAutoEnrich = async () => {
    if (!isAuthed) {
      toast({ title: 'Sign in required', description: 'Admin sign-in required.', variant: 'destructive' });
      return;
    }
    setAutoBusy(true);
    try {
      const { error } = await supabase.functions.invoke('cf-auto-enrich', {
        body: { action: 'start', discoveryBatch: autoDiscoveryBatch, extractionBatch: autoExtractionBatch },
      });
      if (error) throw error;
      toast({ title: 'Auto-enrichment started', description: 'Discovery + extraction will run in the background until every contractor is processed or you stop it.' });
      await loadAutoState();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Failed to start', description: msg, variant: 'destructive' });
    } finally {
      setAutoBusy(false);
    }
  };

  const stopAutoEnrich = async () => {
    setAutoBusy(true);
    try {
      const { error } = await supabase.functions.invoke('cf-auto-enrich', { body: { action: 'stop' } });
      if (error) throw error;
      toast({ title: 'Auto-enrichment stopping', description: 'The job will halt after the current tick.' });
      await loadAutoState();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Failed to stop', description: msg, variant: 'destructive' });
    } finally {
      setAutoBusy(false);
    }
  };

  const loadRuns = async () => {
    const { data } = await supabase
      .from('cf_ingest_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10);
    if (data) setRuns(data as IngestRun[]);
  };

  const loadStats = async () => {
    const { count } = await supabase.from('cf_contractors').select('*', { count: 'exact', head: true });
    const { data: byStatusData } = await supabase
      .from('cf_contractors')
      .select('license_status')
      .limit(10000);
    const byStatus: Record<string, number> = {};
    byStatusData?.forEach((r) => {
      const s = r.license_status || 'Unknown';
      byStatus[s] = (byStatus[s] ?? 0) + 1;
    });
    const { data: byCountyData } = await supabase
      .from('cf_contractors')
      .select('county')
      .not('county', 'is', null)
      .limit(10000);
    const counts: Record<string, number> = {};
    byCountyData?.forEach((r) => {
      if (r.county) counts[r.county] = (counts[r.county] ?? 0) + 1;
    });
    const byCounty = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([county, c]) => ({ county, count: c }));
    const { data: latest } = await supabase
      .from('cf_contractors')
      .select('last_verified_date')
      .order('last_verified_date', { ascending: false })
      .limit(1);
    setStats({
      total: count ?? 0,
      byStatus,
      byCounty,
      lastVerified: latest?.[0]?.last_verified_date ?? null,
    });
  };

  const loadEmailStats = async () => {
    const [
      { count: withWebsite },
      { count: withEmail },
      { count: pending },
      { count: failed },
      { count: noEmail },
      { count: total },
    ] = await Promise.all([
      supabase.from('cf_contractors').select('*', { count: 'exact', head: true }).not('website', 'is', null).neq('website', ''),
      supabase.from('cf_contractors').select('*', { count: 'exact', head: true }).not('email', 'is', null),
      supabase.from('cf_contractors').select('*', { count: 'exact', head: true }).eq('email_extraction_status', 'pending').not('website', 'is', null).neq('website', ''),
      supabase.from('cf_contractors').select('*', { count: 'exact', head: true }).eq('email_extraction_status', 'failed'),
      supabase.from('cf_contractors').select('*', { count: 'exact', head: true }).eq('email_extraction_status', 'no_email_found'),
      supabase.from('cf_contractors').select('*', { count: 'exact', head: true }),
    ]);
    setEmailStats({
      withWebsite: withWebsite ?? 0,
      withEmail: withEmail ?? 0,
      pending: pending ?? 0,
      failed: failed ?? 0,
      noEmail: noEmail ?? 0,
      missingWebsite: Math.max(0, (total ?? 0) - (withWebsite ?? 0)),
    });
  };

  const loadExtractionRuns = async () => {
    const { data } = await supabase
      .from('cf_extraction_runs')
      .select('id, status, total_targets, processed, succeeded, failed, emails_found, started_at, finished_at, error_message')
      .order('started_at', { ascending: false })
      .limit(5);
    if (data) setExtractionRuns(data as ExtractionRun[]);
  };

  useEffect(() => {
    loadRuns();
    loadStats();
    loadEmailStats();
    loadExtractionRuns();
    loadAutoState();
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setIsAuthed(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Poll auto-enrich state + email stats while the background job is running
  useEffect(() => {
    if (!autoState?.is_running) return;
    const interval = setInterval(() => {
      loadAutoState();
      loadEmailStats();
    }, 4000);
    return () => clearInterval(interval);
  }, [autoState?.is_running]);

  // Poll the most recent run while it's processing
  useEffect(() => {
    const active = runs.find((r) => r.status === 'parsing' || r.status === 'inserting' || r.status === 'pending');
    if (!active) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('cf_ingest_runs').select('*').eq('id', active.id).single();
      if (data) {
        setRuns((prev) => prev.map((r) => (r.id === data.id ? (data as IngestRun) : r)));
        if (data.status === 'complete' || data.status === 'failed') {
          loadStats();
          reloadFromDb();
        }
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [runs, reloadFromDb]);

  const handleUpload = async (file: File) => {
    if (!isAuthed) {
      toast({ title: 'Sign in required', description: 'Please log in as an admin to upload files.', variant: 'destructive' });
      return;
    }
    setIsUploading(true);
    try {
      const path = `cslb/${Date.now()}-${file.name}`;
      setUploadProgress('Uploading file…');
      const { error: upErr } = await supabase.storage.from('cf-ingest').upload(path, file, {
        contentType: file.type || 'application/octet-stream',
      });
      if (upErr) throw upErr;

      setUploadProgress('Triggering ingestion…');
      const { data, error } = await supabase.functions.invoke('cslb-ingest', {
        body: { storage_path: path },
      });
      if (error) throw error;

      toast({
        title: 'Ingestion complete',
        description: `Inserted/updated ${data?.inserted ?? 0} of ${data?.total ?? 0} contractors.`,
      });
      await Promise.all([loadRuns(), loadStats(), reloadFromDb()]);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Upload failed', description: err.message ?? 'Unknown error', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Resume an existing ingest run that was interrupted (e.g. by edge wall-time limit).
  // The function will pick up at bytes_processed and self-chain until EOF.
  const resumeRun = async (runId: string) => {
    if (!isAuthed) {
      toast({ title: 'Sign in required', description: 'Admin sign-in required.', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.functions.invoke('cslb-ingest', {
        body: { resume_run_id: runId },
      });
      if (error) throw error;
      toast({ title: 'Resuming ingest', description: 'Picking up where the previous run left off…' });
      await loadRuns();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Resume failed', description: msg, variant: 'destructive' });
    }
  };

  // Mark a run as cancelled so the self-chaining edge function bails on its next tick.
  const stopRun = async (runId: string) => {
    if (!isAuthed) {
      toast({ title: 'Sign in required', description: 'Admin sign-in required.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('cf_ingest_runs')
      .update({ status: 'cancelled', error_message: 'Stopped by user', finished_at: new Date().toISOString() })
      .eq('id', runId);
    if (error) {
      toast({ title: 'Stop failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Run stopped', description: 'The ingest run has been cancelled.' });
    await loadRuns();
  };

  // Delete an ingest run record entirely (does NOT remove already-inserted contractors).
  const deleteRun = async (runId: string) => {
    if (!isAuthed) {
      toast({ title: 'Sign in required', description: 'Admin sign-in required.', variant: 'destructive' });
      return;
    }
    if (!confirm('Delete this ingest run record? Contractors already inserted will remain in the database.')) return;
    const { error } = await supabase.from('cf_ingest_runs').delete().eq('id', runId);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Run deleted' });
    await loadRuns();
  };

  // Stage 3 — bulk-attach websites via CSV (license_number,website)
  const handleWebsiteCsv = async (file: File) => {
    if (!isAuthed) {
      toast({ title: 'Sign in required', description: 'Admin sign-in required.', variant: 'destructive' });
      return;
    }
    setWebsiteCsvUploading(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const startIdx = /license/i.test(lines[0] ?? '') ? 1 : 0;
      const rows = lines.slice(startIdx).map((l) => {
        const parts = l.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        return { license_number: parts[0], website: parts[1] };
      }).filter((r) => r.license_number && r.website);

      let updated = 0;
      for (const r of rows) {
        const { error } = await supabase
          .from('cf_contractors')
          .update({ website: r.website, email_extraction_status: 'pending' })
          .eq('license_number', r.license_number);
        if (!error) updated++;
      }
      toast({ title: 'Websites attached', description: `Updated ${updated.toLocaleString()} of ${rows.length.toLocaleString()} rows.` });
      await Promise.all([loadEmailStats(), reloadFromDb()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'CSV upload failed', description: msg, variant: 'destructive' });
    } finally {
      setWebsiteCsvUploading(false);
      if (websiteCsvRef.current) websiteCsvRef.current.value = '';
    }
  };

  const runDiscovery = async () => {
    if (!isAuthed) {
      toast({ title: 'Sign in required', description: 'Admin sign-in required.', variant: 'destructive' });
      return;
    }
    setDiscoveryRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('cf-discover-websites', {
        body: { limit: discoveryLimit },
      });
      if (error) throw error;
      toast({
        title: 'Website discovery complete',
        description: `Processed ${data?.processed ?? 0} · Found ${data?.websites_found ?? 0} website${(data?.websites_found ?? 0) === 1 ? '' : 's'}.`,
      });
      await Promise.all([loadEmailStats(), loadExtractionRuns(), reloadFromDb()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Discovery failed', description: msg, variant: 'destructive' });
    } finally {
      setDiscoveryRunning(false);
    }
  };

  const runExtraction = async () => {
    if (!isAuthed) {
      toast({ title: 'Sign in required', description: 'Admin sign-in required.', variant: 'destructive' });
      return;
    }
    setExtractionRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('cf-extract-emails', {
        body: { limit: batchLimit, onlyMissing: true },
      });
      if (error) throw error;
      toast({
        title: 'Extraction complete',
        description: `Processed ${data?.processed ?? 0} · Found ${data?.emails_found ?? 0} email${(data?.emails_found ?? 0) === 1 ? '' : 's'}.`,
      });
      await Promise.all([loadEmailStats(), loadExtractionRuns(), reloadFromDb()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Extraction failed', description: msg, variant: 'destructive' });
    } finally {
      setExtractionRunning(false);
    }
  };

  const fmtTime = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4" style={{ color: 'hsl(var(--cf-primary))' }} />
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'hsl(var(--cf-primary))' }}>
              Data Operations
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Data Pipeline & Provenance</h1>
          <p className="text-sm" style={{ color: 'hsl(var(--cf-text-muted))' }}>
            Layered ingestion: official CSLB licensing source of truth → website email extraction (live) → enrichment & validation (planned).
          </p>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
          style={{
            background: dataSource === 'database' ? 'hsl(var(--cf-success-soft))' : 'hsl(var(--cf-warning-soft))',
            color: dataSource === 'database' ? 'hsl(var(--cf-success))' : 'hsl(var(--cf-warning))',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: dataSource === 'database' ? 'hsl(var(--cf-success))' : 'hsl(var(--cf-warning))' }} />
          {dataSource === 'database' ? 'Live data' : 'No data yet — upload CSLB file below'}
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="rounded-xl p-6" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
        <h3 className="font-semibold mb-5 text-sm">Pipeline Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {[
            { icon: Award, name: 'Official Source', sub: 'CSLB License Master', color: 'var(--cf-primary)', live: dataSource === 'database' },
            { icon: Search, name: 'Website Discovery', sub: 'Firecrawl search → bare domain', color: 'var(--cf-accent)', live: (emailStats?.withWebsite ?? 0) > 0 },
            { icon: Mail, name: 'Email Extraction', sub: 'Crawl homepage + /contact', color: 'var(--cf-purple)', live: (emailStats?.withEmail ?? 0) > 0 },
            { icon: CheckCircle2, name: 'Validation', sub: 'Email verify · dedupe · score', color: 'var(--cf-success)', live: false },
          ].map((stage, i) => (
            <div key={i} className="relative">
              <div
                className="rounded-lg p-4 h-full"
                style={{ background: `hsl(${stage.color} / 0.06)`, border: `1px solid hsl(${stage.color} / 0.2)` }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 text-white"
                  style={{ background: `hsl(${stage.color})` }}
                >
                  <stage.icon className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: `hsl(${stage.color})` }}>
                    Stage {i + 1}
                  </div>
                  {stage.live ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-success))', color: 'white' }}>LIVE</span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-text-subtle) / 0.15)', color: 'hsl(var(--cf-text-subtle))' }}>PLANNED</span>
                  )}
                </div>
                <div className="font-semibold text-sm">{stage.name}</div>
                <div className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>{stage.sub}</div>
              </div>
              {i < 3 && (
                <ArrowDown className="hidden md:block absolute top-1/2 -right-2.5 -translate-y-1/2 rotate-[-90deg] w-4 h-4" style={{ color: 'hsl(var(--cf-text-subtle))' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stage 2 — Website discovery via Firecrawl Search */}
      <div className="rounded-xl p-6" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Search className="w-4 h-4" style={{ color: 'hsl(var(--cf-accent))' }} />
              <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'hsl(var(--cf-accent))' }}>
                Stage 2 · Website Discovery
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-success))', color: 'white' }}>LIVE</span>
            </div>
            <h3 className="font-semibold text-base">Find each contractor's official website automatically</h3>
            <p className="text-xs mt-1 max-w-2xl" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              CSLB doesn't publish websites. We run a focused Firecrawl <code className="px-1 rounded" style={{ background: 'hsl(var(--cf-surface-alt))' }}>/search</code> per contractor (business name + city), filter out directory junk (Yelp, BBB, Houzz, Angi, social, gov), score the rest by name + phone match, and save the best bare domain so Stage 3 can crawl it.
            </p>
          </div>
        </div>

        {/* Discovery stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Missing website', value: emailStats?.missingWebsite ?? 0, color: 'var(--cf-warning)' },
            { label: 'Website attached', value: emailStats?.withWebsite ?? 0, color: 'var(--cf-primary)' },
            { label: 'Coverage', value: emailStats ? Math.round(((emailStats.withWebsite) / Math.max(1, emailStats.withWebsite + emailStats.missingWebsite)) * 100) : 0, suffix: '%', color: 'var(--cf-accent)' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg p-3" style={{ background: 'hsl(var(--cf-surface-alt))' }}>
              <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'hsl(var(--cf-text-subtle))' }}>{s.label}</div>
              <div className="text-xl font-bold tabular-nums" style={{ color: `hsl(${s.color})` }}>
                {s.value.toLocaleString()}{s.suffix ?? ''}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg p-4" style={{ background: 'hsl(var(--cf-surface-alt))', border: '1px dashed hsl(var(--cf-border))' }}>
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4" style={{ color: 'hsl(var(--cf-accent))' }} />
            <h4 className="font-semibold text-sm">Discover websites for contractors missing one</h4>
          </div>
          <p className="text-xs mb-3" style={{ color: 'hsl(var(--cf-text-muted))' }}>
            ~1 Firecrawl search credit per contractor · ~2–4s each · directory domains automatically rejected.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold" style={{ color: 'hsl(var(--cf-text-muted))' }}>Batch size</label>
            <select
              value={discoveryLimit}
              onChange={(e) => setDiscoveryLimit(Number(e.target.value))}
              disabled={discoveryRunning}
              className="text-xs px-2 py-1 rounded-md"
              style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
            >
              {[10, 25, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <button
              onClick={runDiscovery}
              disabled={!isAuthed || discoveryRunning || (emailStats?.missingWebsite ?? 0) === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white shadow-sm disabled:opacity-50"
              style={{ background: 'hsl(var(--cf-accent))' }}
            >
              {discoveryRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching {discoveryLimit}…</> : <><Search className="w-3.5 h-3.5" /> Run discovery batch</>}
            </button>
            {(emailStats?.missingWebsite ?? 0) === 0 && (emailStats?.withWebsite ?? 0) > 0 && (
              <span className="text-[11px]" style={{ color: 'hsl(var(--cf-success))' }}>
                ✓ Every contractor has a website attached.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stage 3 — Website email extraction */}
      <div className="rounded-xl p-6" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4" style={{ color: 'hsl(var(--cf-purple))' }} />
              <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'hsl(var(--cf-purple))' }}>
                Stage 3 · Website Email Extraction
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-success))', color: 'white' }}>LIVE</span>
            </div>
            <h3 className="font-semibold text-base">Crawl contractor websites for public contact emails</h3>
            <p className="text-xs mt-1 max-w-2xl" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              CSLB doesn't publish websites or emails. Attach websites first (CSV: <code className="px-1 rounded" style={{ background: 'hsl(var(--cf-surface-alt))' }}>license_number,website</code>), then run a batch — Firecrawl scrapes <strong>homepage + /contact</strong> and we extract emails with deduplication. We never scrape paywalled or hidden pages.
            </p>
          </div>
        </div>

        {/* Email pipeline stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
          {[
            { label: 'With website', value: emailStats?.withWebsite ?? 0, color: 'var(--cf-primary)' },
            { label: 'Email found', value: emailStats?.withEmail ?? 0, color: 'var(--cf-success)' },
            { label: 'Pending crawl', value: emailStats?.pending ?? 0, color: 'var(--cf-text-subtle)' },
            { label: 'No email on site', value: emailStats?.noEmail ?? 0, color: 'var(--cf-warning)' },
            { label: 'Failed', value: emailStats?.failed ?? 0, color: 'var(--cf-danger, var(--cf-warning))' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg p-3" style={{ background: 'hsl(var(--cf-surface-alt))' }}>
              <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'hsl(var(--cf-text-subtle))' }}>{s.label}</div>
              <div className="text-xl font-bold tabular-nums" style={{ color: `hsl(${s.color})` }}>{s.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Attach websites */}
          <div className="rounded-lg p-4" style={{ background: 'hsl(var(--cf-surface-alt))', border: '1px dashed hsl(var(--cf-border))' }}>
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="w-4 h-4" style={{ color: 'hsl(var(--cf-primary))' }} />
              <h4 className="font-semibold text-sm">Bulk attach websites (CSV) — optional</h4>
            </div>
            <p className="text-xs mb-3" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              Use this to import a hand-curated or vendor-enriched list. Stage 2 auto-discovery covers the rest. Two columns: <code>license_number,website</code>.
            </p>
            <input
              ref={websiteCsvRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={websiteCsvUploading || !isAuthed}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleWebsiteCsv(f);
              }}
            />
            <button
              onClick={() => websiteCsvRef.current?.click()}
              disabled={!isAuthed || websiteCsvUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white shadow-sm disabled:opacity-50"
              style={{ background: 'hsl(var(--cf-primary))' }}
            >
              {websiteCsvUploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</> : <><Upload className="w-3.5 h-3.5" /> Upload websites CSV</>}
            </button>
          </div>

          {/* Run extraction */}
          <div className="rounded-lg p-4" style={{ background: 'hsl(var(--cf-surface-alt))', border: '1px dashed hsl(var(--cf-border))' }}>
            <div className="flex items-center gap-2 mb-1">
              <Play className="w-4 h-4" style={{ color: 'hsl(var(--cf-purple))' }} />
              <h4 className="font-semibold text-sm">2. Run a crawl batch</h4>
            </div>
            <p className="text-xs mb-3" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              Processes contractors that have a website but no email yet. Polite, sequential — ~3–8s per contractor.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs font-semibold" style={{ color: 'hsl(var(--cf-text-muted))' }}>Batch size</label>
              <select
                value={batchLimit}
                onChange={(e) => setBatchLimit(Number(e.target.value))}
                disabled={extractionRunning}
                className="text-xs px-2 py-1 rounded-md"
                style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
              >
                {[10, 25, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <button
                onClick={runExtraction}
                disabled={!isAuthed || extractionRunning || (emailStats?.pending ?? 0) === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                style={{ background: 'hsl(var(--cf-purple))' }}
              >
                {extractionRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Crawling {batchLimit}…</> : <><Play className="w-3.5 h-3.5" /> Run batch</>}
              </button>
            </div>
            {(emailStats?.pending ?? 0) === 0 && (emailStats?.withWebsite ?? 0) === 0 && (
              <div className="text-[11px] mt-2" style={{ color: 'hsl(var(--cf-warning))' }}>
                No websites attached yet — upload a CSV first.
              </div>
            )}
          </div>
        </div>

        {/* Recent extraction runs */}
        {extractionRuns.length > 0 && (
          <div className="mt-5">
            <h4 className="text-xs uppercase font-semibold tracking-wide mb-2" style={{ color: 'hsl(var(--cf-text-subtle))' }}>Recent crawl batches</h4>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid hsl(var(--cf-border))' }}>
              <table className="w-full text-xs">
                <thead style={{ background: 'hsl(var(--cf-surface-alt))', color: 'hsl(var(--cf-text-subtle))' }}>
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Status</th>
                    <th className="text-right px-3 py-2 font-semibold">Targets</th>
                    <th className="text-right px-3 py-2 font-semibold">Processed</th>
                    <th className="text-right px-3 py-2 font-semibold">Emails found</th>
                    <th className="text-right px-3 py-2 font-semibold">Failed</th>
                    <th className="text-left px-3 py-2 font-semibold">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {extractionRuns.map((r) => (
                    <tr key={r.id} className="border-t" style={{ borderColor: 'hsl(var(--cf-border))' }}>
                      <td className="px-3 py-2"><RunStatusPill status={r.status === 'complete' ? 'complete' : r.status === 'failed' ? 'failed' : 'parsing'} /></td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.total_targets.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.processed.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold" style={{ color: 'hsl(var(--cf-success))' }}>{r.emails_found.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right tabular-nums" style={{ color: r.failed ? 'hsl(var(--cf-warning))' : 'inherit' }}>{r.failed.toLocaleString()}</td>
                      <td className="px-3 py-2" style={{ color: 'hsl(var(--cf-text-muted))' }}>{fmtTime(r.started_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Upload + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload */}
        <div className="rounded-xl p-6 lg:col-span-2" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
          <div className="flex items-center gap-2 mb-1">
            <Upload className="w-4 h-4" style={{ color: 'hsl(var(--cf-primary))' }} />
            <h3 className="font-semibold text-sm">CSLB License Master Upload</h3>
          </div>
          <p className="text-xs mb-4" style={{ color: 'hsl(var(--cf-text-muted))' }}>
            CSLB blocks automated downloads, so uploads are manual. Download the License Master ZIP (or CSV), then upload it here. We'll parse, dedupe by license #, and upsert into the live database.
          </p>

          <a
            href="https://www.cslb.ca.gov/onlineservices/dataportal/ContractorList"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold mb-4"
            style={{ color: 'hsl(var(--cf-primary))' }}
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open CSLB Public Data Portal
          </a>

          <div
            className="rounded-lg p-6 text-center"
            style={{
              border: `2px dashed hsl(var(--cf-border))`,
              background: 'hsl(var(--cf-surface-alt))',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.csv"
              className="hidden"
              disabled={isUploading || !isAuthed}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'hsl(var(--cf-primary))' }} />
                <div className="text-sm font-semibold">{uploadProgress || 'Processing…'}</div>
                <div className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                  Large files (~290k records) may take 1–3 minutes. Don't close this page.
                </div>
              </div>
            ) : (
              <>
                <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--cf-text-subtle))' }} />
                <div className="text-sm font-semibold mb-1">Drop the License Master file here</div>
                <div className="text-xs mb-3" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                  Accepts .zip or .csv from cslb.ca.gov
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isAuthed}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                  style={{ background: 'hsl(var(--cf-primary))' }}
                >
                  <Upload className="w-4 h-4" /> Choose file
                </button>
                {!isAuthed && (
                  <div className="text-xs mt-3" style={{ color: 'hsl(var(--cf-warning))' }}>
                    Admin sign-in required. <a href="/admin/login" className="underline">Log in</a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Live stats */}
        <div className="rounded-xl p-6" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4" style={{ color: 'hsl(var(--cf-primary))' }} />
            <h3 className="font-semibold text-sm">Live Database</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-bold tabular-nums">{stats?.total.toLocaleString() ?? '—'}</div>
              <div className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>Contractors in DB</div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold tracking-wide mb-1.5" style={{ color: 'hsl(var(--cf-text-subtle))' }}>License Status</div>
              <div className="space-y-1">
                {Object.entries(stats?.byStatus ?? {}).slice(0, 4).map(([s, n]) => (
                  <div key={s} className="flex justify-between text-xs">
                    <span>{s}</span>
                    <span className="tabular-nums font-semibold">{n.toLocaleString()}</span>
                  </div>
                ))}
                {!stats?.total && <div className="text-xs" style={{ color: 'hsl(var(--cf-text-subtle))' }}>No data yet</div>}
              </div>
            </div>
            <div className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              Last verified: <span className="font-semibold">{fmtTime(stats?.lastVerified ?? null)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top counties */}
      {!!stats?.byCounty.length && (
        <div className="rounded-xl p-6" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
          <h3 className="font-semibold text-sm mb-4">Top Counties (by record count)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {stats.byCounty.map((c) => (
              <div key={c.county} className="rounded-lg p-3" style={{ background: 'hsl(var(--cf-surface-alt))' }}>
                <div className="text-xs font-medium" style={{ color: 'hsl(var(--cf-text-muted))' }}>{c.county}</div>
                <div className="text-lg font-bold tabular-nums">{c.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post-ingest verification report (latest completed run) */}
      <VerificationPanel runs={runs} />

      {/* Ingestion runs */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid hsl(var(--cf-border))' }}>
          <h3 className="font-semibold text-sm">Ingestion History</h3>
          <button
            onClick={() => { loadRuns(); loadStats(); }}
            className="text-xs font-semibold px-2 py-1 rounded flex items-center gap-1"
            style={{ background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }}
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        {runs.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: 'hsl(var(--cf-text-subtle))' }}>
            No ingestion runs yet. Upload a CSLB file above to get started.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide" style={{ background: 'hsl(var(--cf-surface-alt))', color: 'hsl(var(--cf-text-subtle))' }}>
              <tr>
                <th className="text-left px-5 py-2.5 font-semibold">File</th>
                <th className="text-left px-3 py-2.5 font-semibold">Status</th>
                <th className="text-right px-3 py-2.5 font-semibold">Total</th>
                <th className="text-right px-3 py-2.5 font-semibold">Inserted</th>
                <th className="text-right px-3 py-2.5 font-semibold">Failed</th>
                <th className="text-left px-3 py-2.5 font-semibold">Started</th>
                <th className="text-left px-3 py-2.5 font-semibold">Duration</th>
                <th className="text-right px-3 py-2.5 font-semibold">Progress</th>
                <th className="text-right px-5 py-2.5 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => {
                const dur =
                  r.finished_at && r.started_at
                    ? `${Math.round((new Date(r.finished_at).getTime() - new Date(r.started_at).getTime()) / 1000)}s`
                    : r.status === 'parsing' || r.status === 'inserting' ? 'running…' : '—';
                const pct = r.file_size && r.file_size > 0
                  ? Math.min(100, Math.round(((r.bytes_processed ?? 0) / r.file_size) * 100))
                  : null;
                // A run is resumable if it failed or has been silently abandoned (still "inserting"
                // but no recent finished_at) and we have a storage_path to resume from.
                const canResume = !!r.storage_path && (
                  r.status === 'failed' ||
                  (r.status === 'inserting' && !r.finished_at &&
                    Date.now() - new Date(r.started_at).getTime() > 5 * 60 * 1000)
                );
                return (
                  <tr key={r.id} className="border-t" style={{ borderColor: 'hsl(var(--cf-border))' }}>
                    <td className="px-5 py-3 font-medium text-xs truncate max-w-[300px]">{r.file_name ?? '—'}</td>
                    <td className="px-3 py-3">
                      <RunStatusPill status={r.status} />
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.total_rows.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold" style={{ color: 'hsl(var(--cf-success))' }}>
                      {r.inserted_rows.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums" style={{ color: r.failed_rows ? 'hsl(var(--cf-warning))' : 'inherit' }}>
                      {r.failed_rows.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtTime(r.started_at)}</span>
                    </td>
                    <td className="px-3 py-3 text-xs tabular-nums" style={{ color: 'hsl(var(--cf-text-muted))' }}>{dur}</td>
                    <td className="px-3 py-3 text-xs tabular-nums text-right" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                      {pct !== null ? `${pct}%` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {canResume ? (
                          <button
                            onClick={() => resumeRun(r.id)}
                            className="text-xs font-semibold px-2 py-1 rounded inline-flex items-center gap-1"
                            style={{ background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }}
                          >
                            <RefreshCw className="w-3 h-3" /> Resume
                          </button>
                        ) : null}
                        {(r.status === 'parsing' || r.status === 'inserting' || r.status === 'pending') ? (
                          <button
                            onClick={() => stopRun(r.id)}
                            className="text-xs font-semibold px-2 py-1 rounded inline-flex items-center gap-1"
                            style={{ background: 'hsl(var(--cf-warning) / 0.15)', color: 'hsl(var(--cf-warning))' }}
                          >
                            Stop
                          </button>
                        ) : null}
                        <button
                          onClick={() => deleteRun(r.id)}
                          className="text-xs font-semibold px-2 py-1 rounded inline-flex items-center gap-1 opacity-70 hover:opacity-100"
                          style={{ background: 'hsl(var(--cf-surface-alt))', color: 'hsl(var(--cf-text-muted))' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function RunStatusPill({ status }: { status: string }) {
  const map: Record<string, { c: string; s: string; label: string; icon: any; spin?: boolean }> = {
    complete: { c: 'var(--cf-success)', s: 'var(--cf-success-soft)', label: 'Complete', icon: CheckCircle2 },
    failed: { c: 'var(--cf-warning)', s: 'var(--cf-warning-soft)', label: 'Failed', icon: AlertTriangle },
    parsing: { c: 'var(--cf-primary)', s: 'var(--cf-primary-soft)', label: 'Parsing', icon: Loader2, spin: true },
    inserting: { c: 'var(--cf-primary)', s: 'var(--cf-primary-soft)', label: 'Inserting', icon: Loader2, spin: true },
    pending: { c: 'var(--cf-text-subtle)', s: 'var(--cf-surface-alt)', label: 'Pending', icon: Clock },
  };
  const m = map[status] ?? map.pending;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `hsl(${m.s})`, color: `hsl(${m.c})` }}
    >
      <m.icon className={`w-3 h-3 ${m.spin ? 'animate-spin' : ''}`} /> {m.label}
    </span>
  );
}

function VerificationPanel({ runs }: { runs: IngestRun[] }) {
  // Pick the most recent run that produced a final report; fall back to any with partial verification.
  const run =
    runs.find((r) => r.status === 'complete' && r.verification && !r.verification.in_progress) ??
    runs.find((r) => !!r.verification);
  if (!run || !run.verification) return null;
  const v = run.verification;
  const passed = !!v.passed;
  const accent = passed ? 'var(--cf-success)' : 'var(--cf-warning)';
  const Icon = passed ? CheckCircle2 : AlertTriangle;
  const checkRow = (label: string, ok: boolean | undefined, detail: string) => (
    <div className="flex items-start gap-2 text-xs py-1.5">
      {ok ? (
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'hsl(var(--cf-success))' }} />
      ) : (
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'hsl(var(--cf-warning))' }} />
      )}
      <div>
        <div className="font-semibold">{label}</div>
        <div style={{ color: 'hsl(var(--cf-text-muted))' }}>{detail}</div>
      </div>
    </div>
  );
  return (
    <div className="rounded-xl p-6" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4" style={{ color: `hsl(${accent})` }} />
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: `hsl(${accent})` }}>
              Post-Ingest Verification
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: `hsl(${accent})`, color: 'white' }}
            >
              {v.in_progress ? 'IN PROGRESS' : passed ? 'PASSED' : 'ATTENTION'}
            </span>
          </div>
          <h3 className="font-semibold text-base">CSV ↔ database reconciliation</h3>
          <p className="text-xs mt-1" style={{ color: 'hsl(var(--cf-text-muted))' }}>
            Latest run · {run.file_name ?? '—'}
            {v.ran_at ? <> · ran {new Date(v.ran_at).toLocaleString()}</> : null}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Metric label="CSV data rows" value={v.csv_data_rows} />
        <Metric label="Contractors in DB" value={v.db_row_count} />
        <Metric
          label="Row count Δ (DB − CSV)"
          value={v.row_count_delta}
          tone={v.row_count_delta && v.row_count_delta < 0 ? 'warning' : 'default'}
        />
        <Metric
          label="Missing license_number"
          value={v.csv_rows_missing_license}
          tone={(v.csv_rows_missing_license ?? 0) > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg p-4" style={{ background: 'hsl(var(--cf-surface-alt))' }}>
          <div className="text-[11px] uppercase tracking-wide font-semibold mb-2" style={{ color: 'hsl(var(--cf-text-subtle))' }}>
            Checks
          </div>
          {checkRow(
            'Row count match',
            v.checks?.row_count_match,
            `Database holds ${v.db_row_count?.toLocaleString() ?? 0} contractor${(v.db_row_count ?? 0) === 1 ? '' : 's'} vs ${v.csv_parseable_rows?.toLocaleString() ?? 0} parseable CSV row${(v.csv_parseable_rows ?? 0) === 1 ? '' : 's'}.`,
          )}
          {checkRow(
            'No missing license numbers',
            v.checks?.no_missing_license_numbers,
            (v.csv_rows_missing_license ?? 0) === 0
              ? 'Every CSV row had a usable license_number.'
              : `${v.csv_rows_missing_license?.toLocaleString()} CSV row${v.csv_rows_missing_license === 1 ? '' : 's'} had no license_number and were skipped.`,
          )}
          {v.notes ? (
            <div className="text-[11px] mt-2" style={{ color: 'hsl(var(--cf-warning))' }}>
              {v.notes}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg p-4" style={{ background: 'hsl(var(--cf-surface-alt))' }}>
          <div className="text-[11px] uppercase tracking-wide font-semibold mb-2" style={{ color: 'hsl(var(--cf-text-subtle))' }}>
            Skipped rows (sample, up to 50)
          </div>
          {(v.skipped_samples?.length ?? 0) === 0 ? (
            <div className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              No skipped rows — every CSV row had a license_number.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto pr-1">
              <table className="w-full text-[11px]">
                <thead style={{ color: 'hsl(var(--cf-text-subtle))' }}>
                  <tr>
                    <th className="text-left font-semibold pb-1">CSV row</th>
                    <th className="text-left font-semibold pb-1">Business name (if any)</th>
                  </tr>
                </thead>
                <tbody>
                  {v.skipped_samples!.map((s, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: 'hsl(var(--cf-border))' }}>
                      <td className="py-1 tabular-nums">{s.row.toLocaleString()}</td>
                      <td className="py-1" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                        {s.business_name ?? <span className="italic">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number | undefined | null;
  tone?: 'default' | 'success' | 'warning';
}) {
  const color =
    tone === 'success' ? 'hsl(var(--cf-success))' : tone === 'warning' ? 'hsl(var(--cf-warning))' : 'inherit';
  return (
    <div className="rounded-lg p-3" style={{ background: 'hsl(var(--cf-surface-alt))' }}>
      <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'hsl(var(--cf-text-subtle))' }}>
        {label}
      </div>
      <div className="text-xl font-bold tabular-nums" style={{ color }}>
        {value === undefined || value === null ? '—' : value.toLocaleString()}
      </div>
    </div>
  );
}
