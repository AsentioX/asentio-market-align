import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Shield, Activity, X, Clock, Briefcase, MapPin, AlertTriangle, Sparkles, Brain, ShieldCheck, ShieldQuestion, ShieldAlert, Workflow, Video } from 'lucide-react';
import { COM_PEOPLE, type ComPerson, type ComRole, type ComRisk, type ComTrust } from '../../commercialData';
import { PERSON_HEADSHOTS } from '../../peopleHeadshots';
import CameraModal from '../CameraModal';

const PRESENCE_META = {
  'on-site': { label: 'On-site', dot: 'bg-emerald-500', text: 'text-emerald-700', soft: 'bg-emerald-50 border-emerald-200' },
  'off-site': { label: 'Off-site', dot: 'bg-stone-400', text: 'text-stone-500', soft: 'bg-stone-50 border-stone-200' },
  'approaching': { label: 'Approaching', dot: 'bg-amber-500 animate-pulse', text: 'text-amber-700', soft: 'bg-amber-50 border-amber-200' },
  'unauthorized': { label: 'Unauthorized', dot: 'bg-rose-500 animate-pulse', text: 'text-rose-700', soft: 'bg-rose-50 border-rose-200' },
} as const;

const ROLE_LABEL: Record<ComRole, string> = {
  employee: 'Employee', contractor: 'Contractor', vendor: 'Vendor', visitor: 'Visitor',
};
const ROLE_BADGE: Record<ComRole, string> = {
  employee: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  contractor: 'bg-violet-50 text-violet-700 border-violet-200',
  vendor: 'bg-amber-50 text-amber-700 border-amber-200',
  visitor: 'bg-pink-50 text-pink-700 border-pink-200',
};
const RISK_META: Record<ComRisk, { label: string; cls: string }> = {
  low: { label: 'Low risk', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  medium: { label: 'Med risk', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'High risk', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const TRUST_META: Record<ComTrust, { label: string; cls: string; icon: any }> = {
  trusted:    { label: 'Trusted',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ShieldCheck },
  familiar:   { label: 'Familiar',   cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',    icon: Shield },
  unknown:    { label: 'Unknown',    cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: ShieldQuestion },
  suspicious: { label: 'Suspicious', cls: 'bg-rose-50 text-rose-700 border-rose-200',           icon: ShieldAlert },
};

const ROLE_FILTERS: ('all' | ComRole)[] = ['all', 'employee', 'contractor', 'vendor', 'visitor'];
const RISK_FILTERS: ('all' | ComRisk)[] = ['all', 'low', 'medium', 'high'];

const CommercialPeople = () => {
  const [selected, setSelected] = useState<ComPerson | null>(null);
  const [cameraFor, setCameraFor] = useState<ComPerson | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | ComRole>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | ComRisk>('all');

  const filtered = useMemo(() => {
    return COM_PEOPLE.filter((p) => {
      if (roleFilter !== 'all' && p.role !== roleFilter) return false;
      if (riskFilter !== 'all' && p.risk !== riskFilter) return false;
      return true;
    });
  }, [roleFilter, riskFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold mb-2">Workforce identity · access control</h2>
        <p className="text-[17px] text-stone-700 leading-snug">{COM_PEOPLE.length} people across roles — managed by <span className="text-stone-900 font-semibold">role, schedule, and zone</span>.</p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-3 shadow-sm space-y-2">
        <FilterRow label="Role" icon={Briefcase} options={ROLE_FILTERS} value={roleFilter} onChange={setRoleFilter as any} renderLabel={(v) => v === 'all' ? 'All' : ROLE_LABEL[v as ComRole]} />
        <FilterRow label="Risk" icon={AlertTriangle} options={RISK_FILTERS} value={riskFilter} onChange={setRiskFilter as any} renderLabel={(v) => v === 'all' ? 'All' : RISK_META[v as ComRisk].label} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((p) => {
          const pres = PRESENCE_META[p.presence];
          const trust = TRUST_META[p.trust];
          const TrustIcon = trust.icon;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`group relative text-left rounded-2xl border bg-white hover:shadow-md p-4 transition-all shadow-sm ${
                p.presence === 'unauthorized' ? 'border-rose-300 hover:border-rose-500' : 'border-black/[0.06] hover:border-black/12'
              }`}
            >
              <span className={`absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${trust.cls}`}>
                <TrustIcon className="w-2.5 h-2.5" />
                {trust.label}
              </span>
              <div className="flex items-start gap-4 pr-20">
                <div className="relative flex-shrink-0">
                  {PERSON_HEADSHOTS[p.id] ? (
                    <img src={PERSON_HEADSHOTS[p.id]} alt={p.name} loading="lazy" className="w-12 h-12 rounded-xl object-cover shadow-md" width={48} height={48} />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.avatarColor} flex items-center justify-center font-bold text-white text-base shadow-md`}>
                      {p.initials}
                    </div>
                  )}
                  <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${pres.dot} ring-[3px] ring-white`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-stone-900 truncate">{p.name}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${ROLE_BADGE[p.role]}`}>{ROLE_LABEL[p.role]}</span>
                  </div>
                  <div className="text-[12px] text-stone-600 mt-0.5 truncate">{p.title}</div>
                  {p.intent && (
                    <div className="flex items-center gap-1.5 mt-1 text-[12px] text-violet-700">
                      <Sparkles className="w-3 h-3" />
                      <span className="font-medium truncate">{p.intent}</span>
                      {p.intentConfidence !== undefined && (
                        <span className="text-stone-400">· {Math.round(p.intentConfidence * 100)}%</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pres.soft} ${pres.text}`}>{pres.label}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${RISK_META[p.risk].cls}`}>{RISK_META[p.risk].label}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-stone-500">
                    <MapPin className="w-3 h-3" /><span className="truncate">{p.realTimeLocation}</span>
                  </div>
                </div>
              </div>
              {/* Behavior strip */}
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px]">
                <BehaviorStat label="Visits" value={p.visitFrequency ?? '—'} />
                <BehaviorStat label="Typical" value={p.typicalTimes ?? '—'} />
                <BehaviorStat label="Anomalies" value={`${p.anomalies?.length ?? 0}`} alert={(p.anomalies?.length ?? 0) > 0} />
              </div>
              {/* Card actions */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); setCameraFor(p); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setCameraFor(p); } }}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    p.presence === 'on-site' || p.presence === 'approaching' || p.presence === 'unauthorized'
                      ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Video className="w-3 h-3" />
                  {p.presence === 'on-site' || p.presence === 'approaching' || p.presence === 'unauthorized' ? 'View live' : 'View recorded'}
                </span>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <PersonDrawer
            person={selected}
            onClose={() => setSelected(null)}
            onViewCamera={() => setCameraFor(selected)}
          />
        )}
      </AnimatePresence>

      <CameraModal
        open={!!cameraFor}
        onClose={() => setCameraFor(null)}
        personName={cameraFor?.name ?? ''}
        personInitials={cameraFor?.initials ?? ''}
        location={cameraFor?.realTimeLocation ?? 'Unknown zone'}
        isLive={cameraFor?.presence === 'on-site' || cameraFor?.presence === 'approaching' || cameraFor?.presence === 'unauthorized'}
        headshot={cameraFor ? PERSON_HEADSHOTS[cameraFor.id] : undefined}
      />
    </div>
  );
};

const BehaviorStat = ({ label, value, alert }: { label: string; value: string; alert?: boolean }) => (
  <div className={`rounded-lg border px-2 py-1.5 ${alert ? 'border-amber-200 bg-amber-50' : 'border-stone-200 bg-stone-50/60'}`}>
    <div className={`uppercase tracking-wider font-bold ${alert ? 'text-amber-700' : 'text-stone-500'}`}>{label}</div>
    <div className={`text-[11px] mt-0.5 leading-snug font-semibold truncate ${alert ? 'text-amber-900' : 'text-stone-800'}`}>{value}</div>
  </div>
);

const FilterRow = ({ label, icon: Icon, options, value, onChange, renderLabel }: { label: string; icon: any; options: readonly string[]; value: string; onChange: (v: string) => void; renderLabel: (v: string) => string }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-stone-500 font-bold w-16">
      <Icon className="w-3 h-3" /> {label}
    </div>
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
            value === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
          }`}
        >
          {renderLabel(opt)}
        </button>
      ))}
    </div>
  </div>
);

const PersonDrawer = ({ person, onClose }: { person: ComPerson; onClose: () => void }) => {
  const pres = PRESENCE_META[person.presence];
  const trust = TRUST_META[person.trust];
  const TrustIcon = trust.icon;
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed top-0 right-0 bottom-0 w-full sm:max-w-md z-50 bg-[#fafaf7] border-l border-black/10 overflow-y-auto"
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-5 py-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">Workforce profile</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-6">
          <div className={`relative rounded-3xl bg-gradient-to-br ${person.avatarColor} p-6 overflow-hidden shadow-lg`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-2xl -translate-y-10 translate-x-10" />
            <div className="relative flex items-center gap-4">
              <div className="relative">
                {PERSON_HEADSHOTS[person.id] ? (
                  <img src={PERSON_HEADSHOTS[person.id]} alt={person.name} loading="lazy" className="w-20 h-20 rounded-2xl object-cover border border-white/30" width={80} height={80} />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center font-bold text-white text-2xl border border-white/30">{person.initials}</div>
                )}
                <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${pres.dot} ring-[3px] ring-white`} />
              </div>
              <div className="text-white">
                <div className="text-[11px] uppercase tracking-[0.18em] font-semibold opacity-90">{ROLE_LABEL[person.role]}</div>
                <h3 className="text-2xl font-bold tracking-tight mt-0.5">{person.name}</h3>
                <div className="text-sm font-medium opacity-90 mt-1">{person.title}</div>
              </div>
            </div>
          </div>

          {/* Trust + intent */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-2xl border p-3 ${trust.cls}`}>
              <div className="text-[10px] uppercase tracking-wider font-bold opacity-80 inline-flex items-center gap-1">
                <TrustIcon className="w-3 h-3" /> Trust
              </div>
              <div className="text-sm font-bold mt-0.5">{trust.label}</div>
            </div>
            {person.intent && (
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-3">
                <div className="text-[10px] uppercase tracking-wider font-bold text-violet-700 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Intent
                  {person.intentConfidence !== undefined && (
                    <span className="text-violet-500 font-normal">{Math.round(person.intentConfidence * 100)}%</span>
                  )}
                </div>
                <div className="text-sm text-violet-900 font-semibold mt-0.5 leading-snug">{person.intent}</div>
              </div>
            )}
          </div>

          {/* Access summary */}
          <div className="grid grid-cols-2 gap-2">
            <SummaryCell label="Access level" value={person.accessLevel} />
            <SummaryCell label="Risk" value={RISK_META[person.risk].label} />
            <SummaryCell label="Schedule" value={person.schedule} />
            {person.badge && <SummaryCell label="Badge" value={person.badge} />}
          </div>

          {person.expiresAt && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">Auto-expires</div>
                <div className="text-sm text-stone-900 font-semibold">{person.expiresAt}</div>
              </div>
            </div>
          )}

          {person.anomalies && person.anomalies.length > 0 && (
            <Section icon={AlertTriangle} title="Anomalies X1 noticed" tint="text-amber-700">
              <ul className="space-y-1.5">
                {person.anomalies.map((a, i) => (
                  <li key={i} className="text-sm text-amber-900 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 leading-snug">{a}</li>
                ))}
              </ul>
            </Section>
          )}

          {person.whyXiActed && person.whyXiActed.length > 0 && (
            <Section icon={Brain} title="Why X1 acted" tint="text-violet-700">
              <ul className="space-y-2">
                {person.whyXiActed.map((w, i) => (
                  <li key={i} className="rounded-xl bg-white border border-violet-100 px-3 py-2.5">
                    <div className="text-[11px] text-stone-500 font-medium">{w.time}</div>
                    <div className="text-sm text-stone-900 font-semibold mt-0.5">{w.action}</div>
                    <div className="text-[12px] text-violet-700 mt-1 leading-snug">{w.reason}</div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {person.linkedAutomations && person.linkedAutomations.length > 0 && (
            <Section icon={Workflow} title="Linked policies">
              <ul className="space-y-1.5">
                {person.linkedAutomations.map((a) => (
                  <li key={a.id} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 font-medium flex items-center justify-between">
                    <span>{a.label}</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section icon={Shield} title="Authorized zones">
            <div className="flex flex-wrap gap-1.5">
              {person.zones.map((z) => (
                <span key={z} className="text-[11px] px-2.5 py-1 rounded-full border border-stone-200 bg-white text-stone-700 font-medium">{z}</span>
              ))}
            </div>
          </Section>

          <Section icon={MapPin} title="Real-time location">
            <div className="rounded-xl bg-white border border-stone-200 px-4 py-3 text-sm text-stone-800 font-medium">{person.realTimeLocation}</div>
          </Section>

          <Section icon={Activity} title="Audit log">
            <ul className="space-y-3">
              {person.recentEvents.map((e, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-[11px] text-stone-400 w-20 flex-shrink-0 pt-0.5 font-medium">{e.time}</span>
                  <div className="flex-1">
                    <span className="text-stone-700 leading-snug">{e.action}</span>
                    {e.zone && <span className="block text-[11px] text-stone-400 mt-0.5">{e.zone}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </motion.div>
    </>
  );
};

const SummaryCell = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-stone-200 bg-white px-3 py-2.5">
    <div className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">{label}</div>
    <div className="text-sm text-stone-900 font-semibold capitalize mt-0.5">{value}</div>
  </div>
);

const Section = ({ icon: Icon, title, tint, children }: { icon: any; title: string; tint?: string; children: React.ReactNode }) => (
  <div>
    <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-bold mb-3 ${tint ?? 'text-stone-500'}`}><Icon className="w-3 h-3" /><span>{title}</span></div>
    {children}
  </div>
);

export default CommercialPeople;
