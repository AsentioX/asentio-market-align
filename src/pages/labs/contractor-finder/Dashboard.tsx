import { Link } from 'react-router-dom';
import { useCF } from './useCFStore';
import { useDashboardStats } from './useDashboardStats';
import { Users, MapPin, Building2, Mail, Globe, Phone, Award, ShieldCheck, TrendingUp, Bookmark, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { ConfidenceMeter, LicenseStatusBadge, relativeTime } from './components/Atoms';
import { tradeLabel } from './tradeLabels';

function StatCard({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string; sub?: string; accent: string }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--cf-text-subtle))' }}>
            {label}
          </div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          {sub && <div className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>{sub}</div>}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `hsl(${accent} / 0.1)`, color: `hsl(${accent})` }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function QualityBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'hsl(var(--cf-text-muted))' }}>{label}</span>
        <span className="font-semibold tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--cf-surface-alt))' }}>
        <div className="h-full" style={{ width: `${pct}%`, background: `hsl(${color})`, transition: 'width 0.6s' }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { contractors, segments } = useCF();

  const stats = useMemo(() => {
    const total = contractors.length;
    const byState: Record<string, number> = {};
    const byType: Record<string, number> = {};
    contractors.forEach((c) => {
      byState[c.state] = (byState[c.state] ?? 0) + 1;
      byType[c.contractor_type] = (byType[c.contractor_type] ?? 0) + 1;
    });
    const verifiedLicense = contractors.filter((c) => c.license_status === 'Active').length;
    const withWebsite = contractors.filter((c) => !!c.website).length;
    const withEmail = contractors.filter((c) => !!c.email).length;
    const withPhone = contractors.filter((c) => !!c.phone).length;
    const recent = contractors.filter((c) => Date.now() - new Date(c.last_verified_date).getTime() < 14 * 86400000).length;
    return {
      total,
      byState: Object.entries(byState).sort((a, b) => b[1] - a[1]),
      byType: Object.entries(byType).sort((a, b) => b[1] - a[1]),
      verifiedLicensePct: Math.round((verifiedLicense / total) * 100),
      websitePct: Math.round((withWebsite / total) * 100),
      emailPct: Math.round((withEmail / total) * 100),
      phonePct: Math.round((withPhone / total) * 100),
      recentPct: Math.round((recent / total) * 100),
    };
  }, [contractors]);

  const recentlyAdded = [...contractors]
    .sort((a, b) => new Date(b.last_verified_date).getTime() - new Date(a.last_verified_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4" style={{ color: 'hsl(var(--cf-primary))' }} />
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'hsl(var(--cf-primary))' }}>
              Overview
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Contractor Intelligence Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--cf-text-muted))' }}>
            Live database of licensed contractors across California. Build segments, qualify leads, export to outreach.
          </p>
        </div>
        <Link
          to="/labs/contractor-finder/explore"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
          style={{ background: 'hsl(var(--cf-primary))' }}
        >
          <Sparkles className="w-4 h-4" /> Explore Contractors
        </Link>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Contractors" value={stats.total.toLocaleString()} sub="Across CA" accent="var(--cf-primary)" />
        <StatCard icon={MapPin} label="States Covered" value={String(stats.byState.length)} sub={stats.byState[0]?.[0] ?? '—'} accent="var(--cf-accent)" />
        <StatCard icon={Building2} label="Trade Categories" value={String(stats.byType.length)} sub={stats.byType[0]?.[0] ?? '—'} accent="var(--cf-purple)" />
        <StatCard icon={Bookmark} label="Saved Segments" value={String(segments.length)} sub="Reusable lists" accent="var(--cf-success)" />
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality */}
        <div
          className="rounded-xl p-6 lg:col-span-1"
          style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="w-5 h-5" style={{ color: 'hsl(var(--cf-primary))' }} />
            <h3 className="font-semibold">List Quality</h3>
          </div>
          <div className="space-y-4">
            <QualityBar label="Verified active license" pct={stats.verifiedLicensePct} color="var(--cf-success)" />
            <QualityBar label="Has website" pct={stats.websitePct} color="var(--cf-primary)" />
            <QualityBar label="Has email" pct={stats.emailPct} color="var(--cf-accent)" />
            <QualityBar label="Has phone" pct={stats.phonePct} color="var(--cf-purple)" />
            <QualityBar label="Verified within 14 days" pct={stats.recentPct} color="var(--cf-warning)" />
          </div>
        </div>

        {/* Trades chart */}
        <div
          className="rounded-xl p-6 lg:col-span-2"
          style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5" style={{ color: 'hsl(var(--cf-primary))' }} />
            <h3 className="font-semibold">Contractors by Trade</h3>
          </div>
          <div className="space-y-3">
            {stats.byType.map(([type, count]) => {
              const max = stats.byType[0][1];
              const pct = (count / max) * 100;
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-44 text-xs font-medium truncate" title={tradeLabel(type)}>
                    <span className="font-mono">{type}</span>
                    {tradeLabel(type) !== type && (
                      <span style={{ color: 'hsl(var(--cf-text-muted))' }}> · {tradeLabel(type)}</span>
                    )}
                  </div>
                  <div className="flex-1 h-7 rounded-md relative overflow-hidden" style={{ background: 'hsl(var(--cf-surface-alt))' }}>
                    <div
                      className="h-full rounded-md flex items-center px-2 text-xs font-semibold text-white"
                      style={{ width: `${pct}%`, background: 'hsl(var(--cf-primary))' }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recently added + Saved segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-xl p-6"
          style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recently Verified</h3>
            <Link to="/labs/contractor-finder/explore" className="text-xs font-medium flex items-center gap-1" style={{ color: 'hsl(var(--cf-primary))' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentlyAdded.map((c) => (
              <Link
                key={c.contractor_id}
                to={`/labs/contractor-finder/explore?id=${c.contractor_id}`}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[hsl(var(--cf-surface-alt))]"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm"
                  style={{ background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }}
                >
                  {c.company_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{c.company_name}</div>
                  <div className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                    {c.contractor_type} · {c.city}, {c.state} · {relativeTime(c.last_verified_date)}
                  </div>
                </div>
                <LicenseStatusBadge status={c.license_status} />
                <div className="w-20"><ConfidenceMeter score={c.confidence_score} size="sm" /></div>
              </Link>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl p-6"
          style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Saved Segments</h3>
            <Link to="/labs/contractor-finder/segments" className="text-xs font-medium flex items-center gap-1" style={{ color: 'hsl(var(--cf-primary))' }}>
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {segments.slice(0, 5).map((s) => (
              <Link
                key={s.id}
                to={`/labs/contractor-finder/segments`}
                className="block p-3 rounded-lg transition-colors hover:bg-[hsl(var(--cf-surface-alt))]"
                style={{ border: '1px solid hsl(var(--cf-border))' }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{s.name}</div>
                  <span
                    className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded"
                    style={{ background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }}
                  >
                    {s.contractor_ids.length}
                  </span>
                </div>
                {s.notes && <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--cf-text-muted))' }}>{s.notes}</div>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
