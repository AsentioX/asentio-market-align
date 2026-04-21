import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Shield, Activity, X, Clock, Briefcase, MapPin, AlertTriangle, Filter } from 'lucide-react';
import { COM_PEOPLE, type ComPerson, type ComRole, type ComRisk } from '../../commercialData';
import { PERSON_HEADSHOTS } from '../../peopleHeadshots';

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

const ROLE_FILTERS: ('all' | ComRole)[] = ['all', 'employee', 'contractor', 'vendor', 'visitor'];
const RISK_FILTERS: ('all' | ComRisk)[] = ['all', 'low', 'medium', 'high'];

const CommercialPeople = () => {
  const [selected, setSelected] = useState<ComPerson | null>(null);
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
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`group text-left rounded-2xl border bg-white hover:shadow-md p-4 transition-all flex items-start gap-4 shadow-sm ${
                p.presence === 'unauthorized' ? 'border-rose-300 hover:border-rose-500' : 'border-black/[0.06] hover:border-black/12'
              }`}
            >
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
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pres.soft} ${pres.text}`}>{pres.label}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${RISK_META[p.risk].cls}`}>{RISK_META[p.risk].label}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-stone-500">
                  <MapPin className="w-3 h-3" /><span className="truncate">{p.realTimeLocation}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors flex-shrink-0 mt-1" />
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && <PersonDrawer person={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
};

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

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3"><Icon className="w-3 h-3" /><span>{title}</span></div>
    {children}
  </div>
);

export default CommercialPeople;
