import { CheckCircle2, AlertTriangle, Mail, Globe, Phone, Award } from 'lucide-react';
import { Contractor, SourceBadge } from '../types';

export const sourceBadgeMeta: Record<SourceBadge, { color: string; soft: string; short: string }> = {
  'Official License Source': { color: 'var(--cf-primary)', soft: 'var(--cf-primary-soft)', short: 'CSLB' },
  'Google Business': { color: 'var(--cf-success)', soft: 'var(--cf-success-soft)', short: 'Google' },
  Yelp: { color: 'var(--cf-danger)', soft: 'var(--cf-danger-soft)', short: 'Yelp' },
  Houzz: { color: 'var(--cf-purple)', soft: 'var(--cf-purple-soft)', short: 'Houzz' },
  BBB: { color: 'var(--cf-warning)', soft: 'var(--cf-warning-soft)', short: 'BBB' },
  'Company Website': { color: 'var(--cf-accent)', soft: 'var(--cf-primary-soft)', short: 'Website' },
  'Verified Email': { color: 'var(--cf-success)', soft: 'var(--cf-success-soft)', short: '✓ Email' },
};

export function SourceBadgePill({ source }: { source: SourceBadge }) {
  const m = sourceBadgeMeta[source] ?? {
    color: 'var(--cf-text-muted)',
    soft: 'var(--cf-surface-alt)',
    short: String(source ?? 'Source'),
  };
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
      style={{ background: `hsl(${m.soft})`, color: `hsl(${m.color})` }}
      title={source}
    >
      {m.short}
    </span>
  );
}

export function ConfidenceMeter({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = score >= 90 ? 'var(--cf-success)' : score >= 75 ? 'var(--cf-primary)' : score >= 60 ? 'var(--cf-warning)' : 'var(--cf-danger)';
  const h = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-2.5' : 'h-1.5';
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${h} rounded-full overflow-hidden`} style={{ background: 'hsl(var(--cf-surface-alt))' }}>
        <div className={h} style={{ width: `${score}%`, background: `hsl(${color})`, transition: 'width 0.5s' }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color: `hsl(${color})` }}>
        {score}
      </span>
    </div>
  );
}

export function LicenseStatusBadge({ status }: { status: Contractor['license_status'] }) {
  const map = {
    Active: { c: 'var(--cf-success)', s: 'var(--cf-success-soft)' },
    Inactive: { c: 'var(--cf-text-muted)', s: 'var(--cf-surface-alt)' },
    Expired: { c: 'var(--cf-danger)', s: 'var(--cf-danger-soft)' },
    Suspended: { c: 'var(--cf-danger)', s: 'var(--cf-danger-soft)' },
  } as const;
  const m = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `hsl(${m.s})`, color: `hsl(${m.c})` }}
    >
      {status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {status}
    </span>
  );
}

export function CompletenessIcons({ contractor }: { contractor: Contractor }) {
  const items = [
    { icon: Globe, on: !!contractor.website, label: 'Website' },
    { icon: Mail, on: !!contractor.email, label: 'Email' },
    { icon: Phone, on: !!contractor.phone, label: 'Phone' },
    { icon: Award, on: contractor.license_status === 'Active', label: 'Active License' },
  ];
  return (
    <div className="flex items-center gap-1">
      {items.map((it, i) => (
        <div
          key={i}
          title={`${it.label}: ${it.on ? 'yes' : 'no'}`}
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{
            background: it.on ? 'hsl(var(--cf-success-soft))' : 'hsl(var(--cf-surface-alt))',
            color: it.on ? 'hsl(var(--cf-success))' : 'hsl(var(--cf-text-subtle))',
          }}
        >
          <it.icon className="w-3 h-3" />
        </div>
      ))}
    </div>
  );
}

export function relativeTime(iso: string): string {
  if (!iso) return 'never';
  const d = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (d < 1) return 'today';
  if (d < 2) return 'yesterday';
  if (d < 30) return `${Math.floor(d)}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}
