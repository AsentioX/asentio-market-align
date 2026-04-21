import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Smartphone, Shield, Activity, X, Clock, Zap } from 'lucide-react';
import { RES_PEOPLE, type ResPerson, type ResPresence } from '../../residentialData';
import { PERSON_HEADSHOTS } from '../../peopleHeadshots';

const PRESENCE_META: Record<ResPresence, { label: string; dot: string; text: string; soft: string }> = {
  home: { label: 'Home', dot: 'bg-emerald-500', text: 'text-emerald-700', soft: 'bg-emerald-50 border-emerald-200' },
  away: { label: 'Away', dot: 'bg-stone-400', text: 'text-stone-500', soft: 'bg-stone-50 border-stone-200' },
  approaching: { label: 'Approaching', dot: 'bg-amber-500 animate-pulse', text: 'text-amber-700', soft: 'bg-amber-50 border-amber-200' },
  unknown: { label: 'Unknown', dot: 'bg-rose-500 animate-pulse', text: 'text-rose-600', soft: 'bg-rose-50 border-rose-200' },
};

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner', family: 'Family', guest: 'Guest', vendor: 'Vendor', unknown: 'Unrecognized',
};

const ROLE_BADGE: Record<string, string> = {
  owner: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  family: 'bg-pink-50 text-pink-700 border-pink-200',
  guest: 'bg-violet-50 text-violet-700 border-violet-200',
  vendor: 'bg-amber-50 text-amber-700 border-amber-200',
  unknown: 'bg-rose-50 text-rose-700 border-rose-200',
};

const ResidentialPeople = () => {
  const [selected, setSelected] = useState<ResPerson | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold mb-2">Identity layer · who's home</h2>
        <p className="text-[17px] text-stone-700 leading-snug">Your home recognizes <span className="text-stone-900 font-semibold">{RES_PEOPLE.length} people</span> — by face, device, gait, and pattern.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {RES_PEOPLE.map((p) => {
          const pres = PRESENCE_META[p.presence];
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`group text-left rounded-2xl border bg-white hover:shadow-md p-4 transition-all flex items-center gap-4 shadow-sm ${
                p.role === 'unknown' ? 'border-rose-200 hover:border-rose-400' : 'border-black/[0.06] hover:border-black/12'
              }`}
            >
              <div className="relative flex-shrink-0">
                {HEADSHOTS[p.name] ? (
                  <img src={HEADSHOTS[p.name]} alt={p.name} className="w-14 h-14 rounded-2xl object-cover shadow-lg" width={56} height={56} />
                ) : (
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.avatarColor} flex items-center justify-center font-bold text-white text-base shadow-lg`}>
                    {p.initials}
                  </div>
                )}
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${pres.dot} ring-[3px] ring-white`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-semibold text-stone-900 truncate">{p.name}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${ROLE_BADGE[p.role]}`}>{ROLE_LABEL[p.role]}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pres.soft} ${pres.text}`}>
                    {pres.label}
                  </span>
                  <span className="text-[11px] text-stone-500 truncate">{p.lastLocation}</span>
                </div>
                {p.accessWindow && (
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-violet-700 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{p.accessWindow}</span>
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
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

const PersonDrawer = ({ person, onClose }: { person: ResPerson; onClose: () => void }) => {
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
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">Identity profile</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-6">
          <div className={`relative rounded-3xl bg-gradient-to-br ${person.avatarColor} p-6 overflow-hidden shadow-lg`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-2xl -translate-y-10 translate-x-10" />
            <div className="relative flex items-center gap-4">
              <div className="relative">
                {HEADSHOTS[person.name] ? (
                  <img src={HEADSHOTS[person.name]} alt={person.name} className="w-20 h-20 rounded-2xl object-cover border border-white/30" width={80} height={80} />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center font-bold text-white text-2xl border border-white/30">{person.initials}</div>
                )}
                <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${pres.dot} ring-[3px] ring-white`} />
              </div>
              <div className="text-white">
                <div className="text-[11px] uppercase tracking-[0.18em] font-semibold opacity-90">{ROLE_LABEL[person.role]}</div>
                <h3 className="text-2xl font-bold tracking-tight mt-0.5">{person.name}</h3>
                <div className="text-sm font-medium opacity-90 mt-1">{pres.label} · {person.lastLocation}</div>
              </div>
            </div>
          </div>

          {person.accessWindow && (
            <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-violet-600 flex-shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-violet-700 font-bold">Temporary access window</div>
                <div className="text-sm text-stone-900 font-semibold">{person.accessWindow}</div>
              </div>
            </div>
          )}

          <Section icon={Zap} title="Automation triggers tied to this person">
            <ul className="space-y-2">
              {person.triggers.map((t, i) => (
                <li key={i} className="text-sm text-stone-700 leading-snug rounded-xl bg-white border border-stone-200 px-3 py-2.5">{t}</li>
              ))}
            </ul>
          </Section>

          <Section icon={Shield} title="Access permissions">
            <div className="flex flex-wrap gap-1.5">
              {person.permissions.map((perm) => (
                <span key={perm} className="text-[11px] px-2.5 py-1 rounded-full border border-stone-200 bg-white text-stone-700 font-medium">{perm}</span>
              ))}
            </div>
          </Section>

          <Section icon={Activity} title="Activity history">
            <ul className="space-y-3">
              {person.recentActivity.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-[11px] text-stone-400 w-16 flex-shrink-0 pt-0.5 font-medium">{a.time}</span>
                  <span className="text-stone-700 leading-snug">{a.action}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Smartphone} title="Paired devices">
            <ul className="space-y-1.5">
              {person.devices.map((d) => (<li key={d} className="text-sm text-stone-700">{d}</li>))}
            </ul>
          </Section>

          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50/50 border border-violet-100 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold mb-2.5">Patterns X1 has learned</div>
            <ul className="space-y-2">
              {person.patterns.map((p) => (
                <li key={p} className="text-sm text-stone-700 flex gap-2"><span className="text-violet-500 mt-0.5">›</span><span>{p}</span></li>
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
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3"><Icon className="w-3 h-3" /><span>{title}</span></div>
    {children}
  </div>
);

export default ResidentialPeople;
