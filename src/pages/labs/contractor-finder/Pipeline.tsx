import { Database, CheckCircle2, AlertTriangle, RefreshCw, Globe, Mail, Award, Clock, Activity, ArrowDown } from 'lucide-react';

interface SourceRow {
  name: string;
  type: 'License' | 'Business Profile' | 'Reviews' | 'Website Crawl' | 'Email Verify';
  status: 'healthy' | 'syncing' | 'warning';
  records: number;
  lastSync: string;
}

const sources: SourceRow[] = [
  { name: 'CSLB (California State License Board)', type: 'License', status: 'healthy', records: 287342, lastSync: '12 min ago' },
  { name: 'Google Business Profile API', type: 'Business Profile', status: 'healthy', records: 198410, lastSync: '34 min ago' },
  { name: 'Yelp Fusion', type: 'Reviews', status: 'healthy', records: 142890, lastSync: '1 hr ago' },
  { name: 'Houzz', type: 'Reviews', status: 'syncing', records: 38221, lastSync: 'Running…' },
  { name: 'Better Business Bureau', type: 'Business Profile', status: 'healthy', records: 67110, lastSync: '3 hrs ago' },
  { name: 'Company Website Crawler', type: 'Website Crawl', status: 'healthy', records: 142003, lastSync: '2 hrs ago' },
  { name: 'Email Verification (NeverBounce)', type: 'Email Verify', status: 'warning', records: 89211, lastSync: '6 hrs ago' },
];

const pipelineStages = [
  { name: 'Ingestion', completion: 100, status: 'complete', desc: 'Pull raw records from all sources' },
  { name: 'Normalization', completion: 98, status: 'complete', desc: 'Standardize addresses, phones, names' },
  { name: 'Deduplication', completion: 94, status: 'complete', desc: 'Merge by license #, domain, phone' },
  { name: 'Enrichment', completion: 87, status: 'in-progress', desc: 'Append website, reviews, service area' },
  { name: 'Email Extraction', completion: 71, status: 'in-progress', desc: 'Crawl websites for contact emails' },
  { name: 'Email Verification', completion: 64, status: 'in-progress', desc: 'Validate deliverability' },
  { name: 'Confidence Scoring', completion: 100, status: 'complete', desc: 'Cross-source agreement scoring' },
];

const failedRecords = [
  { id: 'r-7821', issue: 'License # mismatch across sources', source: 'CSLB ↔ Google', flagged: '2 hrs ago' },
  { id: 'r-7798', issue: 'Phone number invalid format', source: 'Website Crawl', flagged: '4 hrs ago' },
  { id: 'r-7765', issue: 'Email bounce on verification', source: 'NeverBounce', flagged: '6 hrs ago' },
  { id: 'r-7733', issue: 'Address could not geocode', source: 'Google Maps', flagged: '8 hrs ago' },
];

export default function Pipeline() {
  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4" style={{ color: 'hsl(var(--cf-primary))' }} />
          <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'hsl(var(--cf-primary))' }}>
            Data Operations
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Data Pipeline & Provenance</h1>
        <p className="text-sm" style={{ color: 'hsl(var(--cf-text-muted))' }}>
          Layered ingestion: official licensing source of truth → business enrichment → website extraction → verification.
        </p>
      </div>

      {/* Architecture diagram */}
      <div className="rounded-xl p-6" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
        <h3 className="font-semibold mb-5 text-sm">Pipeline Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {[
            { icon: Award, name: 'Official Source', sub: 'CSLB licensing truth', color: 'var(--cf-primary)' },
            { icon: Globe, name: 'Business Enrichment', sub: 'Google · Yelp · Houzz · BBB', color: 'var(--cf-accent)' },
            { icon: Database, name: 'Website Extraction', sub: 'Crawl for contact emails', color: 'var(--cf-purple)' },
            { icon: Mail, name: 'Validation', sub: 'Email verify · dedupe · score', color: 'var(--cf-success)' },
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
                <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: `hsl(${stage.color})` }}>
                  Stage {i + 1}
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

      {/* Sources */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid hsl(var(--cf-border))' }}>
          <h3 className="font-semibold text-sm">Data Sources</h3>
          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: 'hsl(var(--cf-success-soft))', color: 'hsl(var(--cf-success))' }}>
            {sources.filter((s) => s.status === 'healthy').length}/{sources.length} healthy
          </span>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wide" style={{ background: 'hsl(var(--cf-surface-alt))', color: 'hsl(var(--cf-text-subtle))' }}>
            <tr>
              <th className="text-left px-5 py-2.5 font-semibold">Source</th>
              <th className="text-left px-3 py-2.5 font-semibold">Type</th>
              <th className="text-left px-3 py-2.5 font-semibold">Status</th>
              <th className="text-right px-3 py-2.5 font-semibold">Records</th>
              <th className="text-left px-3 py-2.5 font-semibold">Last Sync</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.name} className="border-t" style={{ borderColor: 'hsl(var(--cf-border))' }}>
                <td className="px-5 py-3 font-medium">{s.name}</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>{s.type}</td>
                <td className="px-3 py-3">
                  <StatusPill status={s.status} />
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-medium">{s.records.toLocaleString()}</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {s.lastSync}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pipeline stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-5" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4" style={{ color: 'hsl(var(--cf-primary))' }} />
            <h3 className="font-semibold text-sm">Stage Completion</h3>
          </div>
          <div className="space-y-3">
            {pipelineStages.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-medium text-sm">{p.name}</span>
                    <span className="text-xs ml-2" style={{ color: 'hsl(var(--cf-text-muted))' }}>{p.desc}</span>
                  </div>
                  <span className="text-xs font-bold tabular-nums">{p.completion}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--cf-surface-alt))' }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${p.completion}%`,
                      background: p.status === 'complete' ? 'hsl(var(--cf-success))' : 'hsl(var(--cf-primary))',
                      transition: 'width 0.6s',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Failed records */}
        <div className="rounded-xl p-5" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" style={{ color: 'hsl(var(--cf-warning))' }} />
              <h3 className="font-semibold text-sm">Retry Queue</h3>
            </div>
            <button
              className="text-xs font-semibold px-2 py-1 rounded flex items-center gap-1"
              style={{ background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }}
            >
              <RefreshCw className="w-3 h-3" /> Retry all
            </button>
          </div>
          <div className="space-y-2">
            {failedRecords.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-2 p-3 rounded-lg" style={{ background: 'hsl(var(--cf-warning-soft))' }}>
                <div className="flex-1">
                  <div className="text-xs font-bold tabular-nums" style={{ color: 'hsl(var(--cf-warning))' }}>{r.id}</div>
                  <div className="text-sm font-medium">{r.issue}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--cf-text-muted))' }}>{r.source} · {r.flagged}</div>
                </div>
                <button className="text-xs font-semibold px-2 py-1 rounded text-white shrink-0" style={{ background: 'hsl(var(--cf-warning))' }}>
                  Retry
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: SourceRow['status'] }) {
  const map = {
    healthy: { c: 'var(--cf-success)', s: 'var(--cf-success-soft)', label: 'Healthy', icon: CheckCircle2 },
    syncing: { c: 'var(--cf-primary)', s: 'var(--cf-primary-soft)', label: 'Syncing', icon: RefreshCw },
    warning: { c: 'var(--cf-warning)', s: 'var(--cf-warning-soft)', label: 'Warning', icon: AlertTriangle },
  } as const;
  const m = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `hsl(${m.s})`, color: `hsl(${m.c})` }}
    >
      <m.icon className={`w-3 h-3 ${status === 'syncing' ? 'animate-spin' : ''}`} /> {m.label}
    </span>
  );
}
