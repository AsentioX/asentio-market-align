import { useEffect, useRef, useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, Award, Clock, Activity, ArrowDown, Upload, ExternalLink, FileText, Loader2, Globe, Mail, Link2, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCF } from './useCFStore';
import { useToast } from '@/hooks/use-toast';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const websiteCsvRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    loadRuns();
    loadStats();
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setIsAuthed(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

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
            Layered ingestion: official CSLB licensing source of truth → enrichment (planned) → validation.
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
            { icon: Globe, name: 'Business Enrichment', sub: 'Google · Yelp · Houzz', color: 'var(--cf-accent)', live: false },
            { icon: Database, name: 'Website Extraction', sub: 'Crawl for contact emails', color: 'var(--cf-purple)', live: false },
            { icon: Mail, name: 'Validation', sub: 'Email verify · dedupe · score', color: 'var(--cf-success)', live: false },
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
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => {
                const dur =
                  r.finished_at && r.started_at
                    ? `${Math.round((new Date(r.finished_at).getTime() - new Date(r.started_at).getTime()) / 1000)}s`
                    : r.status === 'parsing' || r.status === 'inserting' ? 'running…' : '—';
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
