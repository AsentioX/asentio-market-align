import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Smartphone, Shield, Activity, X } from 'lucide-react';
import { PEOPLE, type Person, type PresenceState } from '../x1Data';

const PRESENCE_META: Record<PresenceState, { label: string; dot: string; text: string }> = {
  home: { label: 'Home', dot: 'bg-emerald-400', text: 'text-emerald-300' },
  away: { label: 'Away', dot: 'bg-white/30', text: 'text-white/50' },
  approaching: { label: 'Approaching', dot: 'bg-amber-300 animate-pulse', text: 'text-amber-200' },
  unknown: { label: 'Unknown', dot: 'bg-red-400', text: 'text-red-300' },
};

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner', family: 'Family', employee: 'Employee', guest: 'Guest', vendor: 'Vendor', unknown: 'Unrecognized',
};

const PeopleLayer = () => {
  const [selected, setSelected] = useState<Person | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 font-medium mb-1">Identity layer</h2>
        <p className="text-[15px] text-white/70">X1 recognizes <span className="text-white">{PEOPLE.length} people</span> across your spaces — by face, device, gait, and behavior pattern.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PEOPLE.map((p) => {
          const pres = PRESENCE_META[p.presence];
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="group text-left rounded-2xl border border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/12 backdrop-blur-sm p-4 transition-all flex items-center gap-3.5"
            >
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${p.avatarColor} flex items-center justify-center font-semibold text-white text-sm shadow-lg`}>
                  {p.initials}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${pres.dot} ring-2 ring-[#0a0e14]`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-white truncate">{p.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-white/35">{ROLE_LABEL[p.role]}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[11px] font-medium ${pres.text}`}>{pres.label}</span>
                  <span className="text-[11px] text-white/30">·</span>
                  <span className="text-[11px] text-white/45 truncate">{p.lastSeen}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
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

const PersonDrawer = ({ person, onClose }: { person: Person; onClose: () => void }) => {
  const pres = PRESENCE_META[person.presence];
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed top-0 right-0 bottom-0 w-full sm:max-w-md z-50 bg-[#0d1220] border-l border-white/10 overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#0d1220]/95 backdrop-blur-xl border-b border-white/[0.06] px-5 py-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.18em] text-white/40">Identity profile</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-white/50">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${person.avatarColor} flex items-center justify-center font-semibold text-white text-lg shadow-xl`}>
                {person.initials}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${pres.dot} ring-2 ring-[#0d1220]`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{person.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] uppercase tracking-wider text-white/40">{ROLE_LABEL[person.role]}</span>
                <span className="text-white/20">·</span>
                <span className={`text-xs font-medium ${pres.text}`}>{pres.label}</span>
              </div>
              <div className="text-xs text-white/45 mt-0.5">{person.lastSeen}</div>
            </div>
          </div>

          <Section icon={Activity} title="Recent activity">
            <ul className="space-y-2.5">
              {person.recentActivity.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-[11px] text-white/35 w-14 flex-shrink-0 pt-0.5">{a.time}</span>
                  <span className="text-white/75 leading-snug">{a.action}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Shield} title="Access permissions">
            <div className="flex flex-wrap gap-1.5">
              {person.permissions.map((perm) => (
                <span key={perm} className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/70">
                  {perm}
                </span>
              ))}
            </div>
          </Section>

          <Section icon={Smartphone} title="Paired devices">
            <ul className="space-y-1.5">
              {person.devices.map((d) => (
                <li key={d} className="text-sm text-white/70">{d}</li>
              ))}
            </ul>
          </Section>

          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/80 font-semibold mb-2">Patterns X1 has learned</div>
            <ul className="space-y-1.5">
              {person.patterns.map((p) => (
                <li key={p} className="text-sm text-white/65 flex gap-2">
                  <span className="text-cyan-300/60 mt-0.5">›</span><span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold mb-2.5">
      <Icon className="w-3 h-3" />
      <span>{title}</span>
    </div>
    {children}
  </div>
);

export default PeopleLayer;
