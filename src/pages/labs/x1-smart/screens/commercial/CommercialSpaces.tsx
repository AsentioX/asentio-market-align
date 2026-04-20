import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Warehouse, Store, Users, AlertTriangle, Sparkles, Activity, Shield } from 'lucide-react';
import { COM_SPACES, type ComSpace, type ComSpaceMode } from '../../commercialData';
import { toast } from 'sonner';

const TYPE_ICON = { office: Building2, warehouse: Warehouse, retail: Store } as const;
const TYPE_GRAD = {
  office: 'from-indigo-400 via-blue-500 to-cyan-500',
  warehouse: 'from-violet-500 via-purple-500 to-fuchsia-500',
  retail: 'from-emerald-400 via-teal-400 to-cyan-400',
} as const;

const STATE_META = {
  active: { dot: 'bg-indigo-500', label: 'Active', text: 'text-indigo-700', soft: 'bg-indigo-50', border: 'border-indigo-200' },
  secure: { dot: 'bg-emerald-500', label: 'Secure', text: 'text-emerald-700', soft: 'bg-emerald-50', border: 'border-emerald-200' },
  alert: { dot: 'bg-rose-500 animate-pulse', label: 'Alert', text: 'text-rose-700', soft: 'bg-rose-50', border: 'border-rose-200' },
} as const;

const MODES: { value: ComSpaceMode; label: string; description: string }[] = [
  { value: 'open', label: 'Open', description: 'Business hours · normal access policies active' },
  { value: 'closed', label: 'Closed', description: 'After-hours · perimeter armed · emergency only' },
  { value: 'after-hours', label: 'After-hours', description: 'Limited access · vendor windows respected' },
  { value: 'maintenance', label: 'Maintenance', description: 'Restricted zones unlocked for crew · audit on' },
  { value: 'emergency', label: 'Emergency', description: 'All doors unlock · alerts to all hands' },
];

const CommercialSpaces = () => {
  const [selected, setSelected] = useState<ComSpace>(COM_SPACES[0]);
  const [modeOverride, setModeOverride] = useState<Record<string, ComSpaceMode>>({});
  const currentMode = modeOverride[selected.id] ?? selected.mode;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold mb-2">Sites · operational modes</h2>
        <p className="text-[17px] text-stone-700 leading-snug">Each site runs an <span className="text-stone-900 font-semibold">operational mode</span>, not a list of devices.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {COM_SPACES.map((space) => {
          const Icon = TYPE_ICON[space.type];
          const state = STATE_META[space.state];
          const active = selected.id === space.id;
          const grad = TYPE_GRAD[space.type];
          const occPct = Math.round((space.occupancy / space.capacity) * 100);
          return (
            <button
              key={space.id}
              onClick={() => setSelected(space)}
              className={`relative text-left rounded-2xl border p-4 transition-all overflow-hidden ${
                active ? 'border-stone-900 shadow-lg bg-white' : 'border-black/[0.06] bg-white hover:border-black/15 hover:shadow-md shadow-sm'
              }`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${grad} opacity-20 rounded-full blur-2xl -translate-y-6 translate-x-6`} />
              <div className="relative flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${state.soft} ${state.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${state.dot}`} />
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${state.text}`}>{state.label}</span>
                </span>
              </div>
              <div className="relative text-sm font-semibold text-stone-900 leading-tight">{space.name}</div>
              <div className="relative flex items-center gap-3 mt-2 text-[11px] text-stone-500 font-medium flex-wrap">
                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{space.occupancy}/{space.capacity} ({occPct}%)</span>
                {space.issues > 0 && (
                  <span className="inline-flex items-center gap-1 text-rose-700"><AlertTriangle className="w-3 h-3" />{space.issues}</span>
                )}
              </div>
              <div className="relative mt-2 h-1 rounded-full bg-stone-100 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${grad}`} style={{ width: `${occPct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-black/[0.06] bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/[0.06] relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${TYPE_GRAD[selected.type]} opacity-10 rounded-full blur-3xl -translate-y-20 translate-x-20`} />
          <div className="relative mb-5">
            <h3 className="text-2xl font-bold tracking-tight text-stone-900">{selected.name}</h3>
            <div className="text-[12px] text-stone-500 mt-1 font-medium">
              {selected.occupancy} of {selected.capacity} on-site · {Math.round((selected.occupancy / selected.capacity) * 100)}% capacity
            </div>
          </div>

          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-2">Operational mode</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MODES.map((m) => {
                const active = currentMode === m.value;
                const isEmergency = m.value === 'emergency';
                return (
                  <button
                    key={m.value}
                    onClick={() => {
                      setModeOverride({ ...modeOverride, [selected.id]: m.value });
                      toast.success(`${selected.name} → ${m.label}`, { description: m.description });
                    }}
                    className={`text-left rounded-xl border-2 p-3 transition-all ${
                      active
                        ? isEmergency
                          ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200'
                          : 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <div className={`text-sm font-bold ${active ? (isEmergency ? 'text-rose-700' : 'text-indigo-700') : 'text-stone-700'}`}>{m.label}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-2 leading-snug">{m.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3">Access zones · live</div>
              <div className="space-y-2">
                {selected.zones.map((z) => (
                  <div key={z.name} className={`rounded-xl border p-3 flex items-center justify-between ${
                    z.activity === 'restricted' ? 'border-rose-200 bg-rose-50/40' :
                    z.activity === 'active' ? 'border-indigo-200 bg-indigo-50/40' : 'border-stone-200 bg-stone-50'
                  }`}>
                    <div>
                      <div className="text-sm font-semibold text-stone-900">{z.name}</div>
                      <div className="text-[11px] text-stone-500 capitalize mt-0.5">{z.activity}</div>
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700">
                      <Users className="w-3.5 h-3.5" /> {z.people}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Active policies
              </div>
              <div className="space-y-1.5">
                {selected.activePolicies.map((p) => (
                  <div key={p} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[13px] text-stone-700 font-medium">{p}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-700 font-bold mb-3 flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Real-time activity feed
              </div>
              <div className="space-y-2">
                {selected.liveActivity.map((a, i) => (
                  <div key={i} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-[13px]">
                    <div className="text-stone-800 font-medium">{a.action}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{a.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Suggested actions
              </div>
              <div className="space-y-2">
                {selected.suggestedActions.map((a) => (
                  <button key={a} onClick={() => toast.success('Action queued', { description: a })}
                    className="w-full text-left rounded-xl border border-stone-200 bg-white hover:bg-violet-50 hover:border-violet-300 px-4 py-2.5 text-sm text-stone-800 font-medium transition-all flex items-center justify-between group">
                    <span>{a}</span>
                    <span className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CommercialSpaces;
