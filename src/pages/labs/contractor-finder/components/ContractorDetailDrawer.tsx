import { useState, useEffect } from 'react';
import { Contractor } from '../types';
import { useCF } from '../useCFStore';
import { supabase } from '@/integrations/supabase/client';
import {
  X, Phone, Globe, Mail, MapPin, Calendar, Award, ShieldCheck, Star, ExternalLink,
  Sparkles, Loader2, Flag, RefreshCw, BookmarkPlus, Copy, Check
} from 'lucide-react';
import { ConfidenceMeter, LicenseStatusBadge, SourceBadgePill, relativeTime } from './Atoms';
import { formatTrade } from '../tradeLabels';
import { toast } from 'sonner';

interface AISummary {
  who_they_are: string;
  likely_jobs: string;
  size_assessment: string;
  digital_maturity: string;
  target_persona: string;
  adjacent_segments: string[];
}

export function ContractorDetailDrawer({ contractor, onClose }: { contractor: Contractor; onClose: () => void }) {
  const { segments, addToSegment, flagContractor, refreshContractor } = useCF();
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSegmentPicker, setShowSegmentPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSummary(null);
  }, [contractor.contractor_id]);

  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('contractor-ai', {
        body: { mode: 'summary', contractor },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setSummary((data as any).result);
    } catch (e: any) {
      toast.error('AI summary failed', { description: e?.message });
    } finally {
      setLoadingSummary(false);
    }
  };

  const copyContact = () => {
    const text = [contractor.company_name, contractor.email, contractor.phone, contractor.website, `${contractor.address}, ${contractor.city}, ${contractor.state} ${contractor.zip_code}`]
      .filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success('Contact copied');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[600px] h-full overflow-y-auto"
        style={{ background: 'hsl(var(--cf-bg))', boxShadow: '-12px 0 40px -12px rgba(0,0,0,0.2)' }}
      >
        {/* Hero */}
        <div className="relative p-6 pb-4" style={{ background: 'linear-gradient(135deg, hsl(var(--cf-primary)), hsl(var(--cf-purple)))' }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 text-white hover:bg-white/30">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold text-white">
              {contractor.company_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <h2 className="text-xl font-bold text-white">{contractor.company_name}</h2>
              {contractor.dba_name && <div className="text-xs text-white/80">DBA {contractor.dba_name}</div>}
              <div className="flex items-center gap-2 mt-2 text-xs text-white/90">
                <span className="font-semibold">{contractor.contractor_type}</span>
                <span>·</span>
                <span>{contractor.city}, {contractor.state}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {contractor.source_urls.map((s) => <SourceBadgePill key={s} source={s} />)}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status row */}
          <div className="flex items-center gap-3">
            <LicenseStatusBadge status={contractor.license_status} />
            <span className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              Last verified {relativeTime(contractor.last_verified_date)}
            </span>
          </div>

          {/* Confidence */}
          <Section title="Confidence Score">
            <ConfidenceMeter score={contractor.confidence_score} size="lg" />
            <p className="text-xs mt-2" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              Cross-referenced against {contractor.source_count} sources.
            </p>
          </Section>

          {/* AI summary */}
          <Section
            title="AI Profile Summary"
            icon={<Sparkles className="w-4 h-4" style={{ color: 'hsl(var(--cf-purple))' }} />}
            action={
              !summary && (
                <button
                  onClick={generateSummary}
                  disabled={loadingSummary}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md text-white"
                  style={{ background: 'hsl(var(--cf-purple))' }}
                >
                  {loadingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Generate'}
                </button>
              )
            }
          >
            {loadingSummary ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => <div key={i} className="h-3 rounded animate-pulse" style={{ background: 'hsl(var(--cf-surface-alt))' }} />)}
              </div>
            ) : summary ? (
              <div className="space-y-3 text-xs">
                <SummaryRow label="Who they are" value={summary.who_they_are} />
                <SummaryRow label="Likely jobs" value={summary.likely_jobs} />
                <SummaryRow label="Size" value={summary.size_assessment} />
                <SummaryRow label="Digital maturity" value={summary.digital_maturity} />
                <SummaryRow label="Target persona" value={summary.target_persona} />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--cf-text-subtle))' }}>Adjacent Segments</div>
                  <div className="flex flex-wrap gap-1">
                    {summary.adjacent_segments.map((s, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-purple-soft))', color: 'hsl(var(--cf-purple))' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>Click <strong>Generate</strong> to produce an AI assessment of this contractor.</p>
            )}
          </Section>

          {/* Contact */}
          <Section title="Contact" action={
            <button onClick={copyContact} className="text-xs font-medium flex items-center gap-1" style={{ color: 'hsl(var(--cf-primary))' }}>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy all'}
            </button>
          }>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <ContactRow icon={Phone} value={contractor.phone} />
              {contractor.email && (
                <ContactRow
                  icon={Mail}
                  value={contractor.email}
                  badge={contractor.email_verified ? 'Verified' : undefined}
                  href={`mailto:${contractor.email}`}
                />
              )}
              {contractor.website && <ContactRow icon={Globe} value={contractor.website} href={contractor.website} external />}
              <ContactRow icon={MapPin} value={`${contractor.address ? contractor.address + ', ' : ''}${contractor.city}, ${contractor.state} ${contractor.zip_code}`} />
            </div>
          </Section>

          {/* License */}
          <Section title="Licensing & Insurance">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <KV label="License #" value={contractor.license_number} />
              <KV label="Classification" value={formatTrade(contractor.license_classification) || contractor.license_classification || '—'} />
              <KV label="Issued" value={contractor.license_issue_date || '—'} />
              <KV label="Expires" value={contractor.license_expiration_date || '—'} />
              <KV label="Bond" value={contractor.bond_status} />
              <KV label="Insurance" value={contractor.insurance_status} />
            </div>
          </Section>

          {/* Business */}
          <Section title="Business Profile">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <KV label="Years in business" value={`${contractor.years_in_business}y`} />
              <KV label="Company size" value={contractor.estimated_company_size} />
              <KV label="Maturity" value={contractor.estimated_business_maturity} />
              <KV label="Commercial / Residential" value={contractor.commercial_residential} />
            </div>
            {contractor.review_rating && (
              <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                <Star className="w-3.5 h-3.5 fill-current" style={{ color: 'hsl(var(--cf-warning))' }} />
                <strong style={{ color: 'hsl(var(--cf-text))' }}>{contractor.review_rating}</strong>
                <span>· {contractor.review_count} reviews</span>
              </div>
            )}
            <div className="mt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--cf-text-subtle))' }}>Service area</div>
              <div className="flex flex-wrap gap-1">
                {contractor.service_area.map((a) => (
                  <span key={a} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-surface-alt))', color: 'hsl(var(--cf-text-muted))' }}>{a}</span>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--cf-text-subtle))' }}>Specialties</div>
              <div className="flex flex-wrap gap-1">
                {contractor.specialties.map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }}>{s}</span>
                ))}
              </div>
            </div>
          </Section>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 sticky bottom-0 pt-3" style={{ background: 'hsl(var(--cf-bg))' }}>
            <button
              onClick={() => setShowSegmentPicker(!showSegmentPicker)}
              className="text-xs font-semibold px-3 py-2.5 rounded-lg text-white flex items-center justify-center gap-1.5"
              style={{ background: 'hsl(var(--cf-primary))' }}
            >
              <BookmarkPlus className="w-3.5 h-3.5" /> Save to list
            </button>
            <button
              onClick={() => { refreshContractor(contractor.contractor_id); toast.success('Record refreshed'); }}
              className="text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center justify-center gap-1.5"
              style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={() => { flagContractor(contractor.contractor_id); toast.success('Flagged for review'); }}
              className="text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center justify-center gap-1.5"
              style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))', color: 'hsl(var(--cf-danger))' }}
            >
              <Flag className="w-3.5 h-3.5" /> Flag
            </button>
          </div>
          {showSegmentPicker && (
            <div className="rounded-lg p-3 space-y-1" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
              <div className="text-xs font-semibold mb-1">Add to segment:</div>
              {segments.length === 0 && <div className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>No segments yet — create one from Explore.</div>}
              {segments.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { addToSegment(s.id, contractor.contractor_id); toast.success(`Added to "${s.name}"`); setShowSegmentPicker(false); }}
                  className="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-[hsl(var(--cf-surface-alt))]"
                >
                  <span>{s.name}</span>
                  <span style={{ color: 'hsl(var(--cf-text-muted))' }}>{s.contractor_ids.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Section({ title, icon, action, children }: { title: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'hsl(var(--cf-text-subtle))' }}>
          {icon}
          {title}
        </h4>
        {action}
      </div>
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'hsl(var(--cf-text-subtle))' }}>{label}</div>
      <div className="text-xs font-medium">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'hsl(var(--cf-text-subtle))' }}>{label}</div>
      <div className="text-xs leading-relaxed">{value}</div>
    </div>
  );
}

function ContactRow({ icon: Icon, value, href, external, badge }: { icon: any; value: string; href?: string; external?: boolean; badge?: string }) {
  const inner = (
    <>
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(var(--cf-text-subtle))' }} />
      <span className="flex-1 truncate">{value}</span>
      {badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-success-soft))', color: 'hsl(var(--cf-success))' }}>✓ {badge}</span>}
      {external && <ExternalLink className="w-3 h-3 shrink-0" style={{ color: 'hsl(var(--cf-text-subtle))' }} />}
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs py-1 hover:text-[hsl(var(--cf-primary))]">{inner}</a>
  ) : (
    <div className="flex items-center gap-2 text-xs py-1">{inner}</div>
  );
}
