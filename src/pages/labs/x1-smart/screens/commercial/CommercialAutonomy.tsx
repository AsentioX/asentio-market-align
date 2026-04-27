import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, Power, Brain, Shield, Thermometer, Leaf, Sun, Target, Zap } from 'lucide-react';
import { COM_RULES, COM_GOALS, type ComRule, type ComRuleCategory, type ComGoal } from '../../commercialData';
import { toast } from 'sonner';
import { useAutonomy, AUTONOMY_LEVELS } from '../../AutonomyContext';

const CATEGORY_META: Record<ComRuleCategory, { label: string; icon: any; gradient: string; tint: string }> = {
  security:    { label: 'Security',                       icon: Shield,      gradient: 'from-rose-400 to-red-500',   tint: 'text-rose-700' },
  environment: { label: 'Environment · HVAC + Lighting',  icon: Thermometer, gradient: 'from-cyan-400 to-blue-500',  tint: 'text-cyan-700' },
};

const CATEGORY_ORDER: ComRuleCategory[] = ['security', 'environment'];

const GOAL_ICON: Record<ComGoal['icon'], any> = { shield: Shield, sun: Sun, leaf: Leaf, sparkles: Sparkles };
const IMPACT_META = {
  security:    { label: '🛡 Security',    cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  energy:      { label: '⚡ Energy',      cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  convenience: { label: '✨ Convenience', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
} as const;

const CommercialAutonomy = () => {
  const [rules, setRules] = useState<ComRule[]>(COM_RULES);
  const [goals, setGoals] = useState<ComGoal[]>(COM_GOALS);
  const [view, setView] = useState<'goals' | 'rules'>('goals');
  const { level, setLevel } = useAutonomy();

  const toggle = (id: string) => {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    const r = rules.find((x) => x.id === id);
    if (r) toast.success(r.active ? 'Policy paused' : 'Policy activated', { description: r.name });
  };
  const accept = (id: string) => {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, active: true, suggested: false } : r)));
    toast.success('Suggestion accepted', { description: 'X1 will now run this automatically.' });
  };
  const toggleGeneratedRule = (goalId: string, idx: number) => {
    setGoals((gs) => gs.map((g) => {
      if (g.id !== goalId) return g;
      const next = [...g.generatedRules];
      next[idx] = { ...next[idx], enabled: !next[idx].enabled };
      toast.success(next[idx].enabled ? 'Policy enabled' : 'Policy paused', { description: next[idx].label });
      return { ...g, generatedRules: next };
    }));
  };

  const policies = rules.filter((r) => !r.suggested);
  const activeCount = policies.filter((r) => r.active).length;
  const suggested = rules.filter((r) => r.suggested);

  const grouped = useMemo(() => {
    const map = new Map<ComRuleCategory, ComRule[]>();
    CATEGORY_ORDER.forEach((c) => map.set(c, []));
    policies.forEach((r) => map.get(r.category)?.push(r));
    return map;
  }, [policies]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold mb-2">Autonomy · outcomes & policies</h2>
        <p className="text-[17px] text-stone-700 leading-snug">Set the <span className="text-stone-900 font-semibold">operational outcomes</span> — X1 generates and tunes the policies.</p>
      </div>

      {/* Autonomy level selector */}
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-violet-700" />
          <div className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold">Autonomy level</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {AUTONOMY_LEVELS.map((l) => {
            const active = l.value === level;
            return (
              <button
                key={l.value}
                onClick={() => { setLevel(l.value); toast.success(`Autonomy → ${l.label}`); }}
                className={`text-left rounded-xl border-2 p-3 transition-all ${
                  active ? 'border-violet-500 bg-white ring-2 ring-violet-200' : 'border-stone-200 bg-white/60 hover:border-stone-400'
                }`}
              >
                <div className={`text-sm font-bold ${active ? 'text-violet-700' : 'text-stone-700'}`}>{l.label}</div>
                <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">{l.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200">
        <ViewBtn active={view === 'goals'} onClick={() => setView('goals')} icon={Target} label="Goals" />
        <ViewBtn active={view === 'rules'} onClick={() => setView('rules')} icon={Zap} label="All policies" />
      </div>

      {view === 'goals' && (
        <div className="space-y-4">
          {goals.map((g) => {
            const Icon = GOAL_ICON[g.icon];
            const enabled = g.generatedRules.filter((r) => r.enabled).length;
            return (
              <motion.div key={g.id} layout className="rounded-3xl border border-black/[0.06] bg-white shadow-sm overflow-hidden">
                <div className="p-5 border-b border-black/[0.06] flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md shrink-0">
                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold">Goal</div>
                    <h3 className="text-[17px] font-bold text-stone-900 leading-tight mt-0.5">{g.title}</h3>
                    <p className="text-[13px] text-stone-600 mt-1 leading-relaxed">{g.description}</p>
                    <div className="text-[11px] text-stone-500 mt-2">
                      <span className="font-semibold text-violet-700">{enabled} of {g.generatedRules.length}</span> generated policies active · Based on {g.basedOn}
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  {g.generatedRules.map((rule, i) => (
                    <div key={i} className={`rounded-xl border p-3 transition-all ${rule.enabled ? 'border-violet-200 bg-violet-50/40' : 'border-stone-200 bg-white opacity-70'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-semibold text-stone-900">{rule.label}</div>
                          <div className="text-[12px] text-stone-600 mt-1 leading-snug">{rule.reasoning}</div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {rule.impact.map((imp) => (
                              <span key={imp} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${IMPACT_META[imp].cls}`}>
                                {IMPACT_META[imp].label}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleGeneratedRule(g.id, i)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${rule.enabled ? 'bg-violet-600' : 'bg-stone-300'}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${rule.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${rule.confidence * 100}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-violet-700">{Math.round(rule.confidence * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          <button className="w-full rounded-2xl border-2 border-dashed border-stone-300 hover:border-violet-400 hover:bg-violet-50/30 p-5 text-stone-500 hover:text-violet-700 font-semibold transition-colors inline-flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> New goal
          </button>
        </div>
      )}

      {view === 'rules' && (
        <>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold">
                <Power className="w-3 h-3" /> Policies · {activeCount} of {policies.length} active
              </div>
              <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-indigo-600 hover:text-indigo-800">
                <Plus className="w-3.5 h-3.5" /> New policy
              </button>
            </div>

            <div className="space-y-6">
              {CATEGORY_ORDER.map((cat) => {
                const list = grouped.get(cat) || [];
                if (list.length === 0) return null;
                const meta = CATEGORY_META[cat];
                const CatIcon = meta.icon;
                const catActive = list.filter((r) => r.active).length;
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-sm`}>
                        <CatIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <div className={`text-[11px] uppercase tracking-[0.16em] font-bold ${meta.tint}`}>{meta.label}</div>
                      <span className="text-[11px] text-stone-400 bg-stone-100 rounded-full px-2 py-0.5 font-medium">{catActive}/{list.length}</span>
                    </div>
                    <div className="space-y-2">
                      {list.map((r) => <RuleCard key={r.id} rule={r} onToggle={() => toggle(r.id)} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {suggested.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold mb-3">
                <Sparkles className="w-3 h-3" /> AI-suggested policies · ready to enable
              </div>
              <div className="space-y-2">
                {suggested.map((r) => (
                  <SuggestedRuleCard key={r.id} rule={r} onAccept={() => accept(r.id)} onDismiss={() => setRules((rs) => rs.filter((x) => x.id !== r.id))} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ViewBtn = ({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
      active ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
    }`}
  >
    <Icon className="w-3.5 h-3.5" /> {label}
  </button>
);

const RuleCard = ({ rule, onToggle }: { rule: ComRule; onToggle: () => void }) => (
  <motion.div layout className={`rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm transition-opacity ${rule.active ? '' : 'opacity-60'}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-stone-900 mb-2">{rule.name}</div>
        <div className="space-y-1 font-mono text-[12px] leading-relaxed">
          <div className="text-indigo-700"><span className="font-bold">IF</span> {rule.ifClause.replace(/^IF /, '')}</div>
          <div className="text-emerald-700"><span className="font-bold">THEN</span> {rule.thenClause.replace(/^THEN /, '')}</div>
        </div>
      </div>
      <button onClick={onToggle} className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${rule.active ? 'bg-indigo-600' : 'bg-stone-300'}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${rule.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  </motion.div>
);

const SuggestedRuleCard = ({ rule, onAccept, onDismiss }: { rule: ComRule; onAccept: () => void; onDismiss: () => void }) => {
  const meta = CATEGORY_META[rule.category];
  return (
    <motion.div layout className="rounded-2xl border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50/50 to-indigo-50/30 p-4">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">Suggested</span>
          <span className={`text-[10px] uppercase tracking-wider font-bold ${meta.tint} bg-white px-2 py-0.5 rounded-full border border-stone-200`}>{meta.label}</span>
          {rule.confidence && <span className="text-[11px] text-violet-700 font-semibold">{Math.round(rule.confidence * 100)}% confident</span>}
        </div>
        <div className="text-sm font-semibold text-stone-900 mb-2">{rule.name}</div>
        <div className="space-y-1 font-mono text-[12px] leading-relaxed">
          <div className="text-indigo-700"><span className="font-bold">IF</span> {rule.ifClause.replace(/^IF /, '')}</div>
          <div className="text-emerald-700"><span className="font-bold">THEN</span> {rule.thenClause.replace(/^THEN /, '')}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onAccept} className="flex-1 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[13px] font-semibold py-2 shadow-md shadow-violet-500/30 hover:shadow-lg transition-shadow">Enable</button>
        <button onClick={onDismiss} className="px-4 rounded-xl border border-stone-200 bg-white text-stone-600 text-[13px] font-semibold hover:bg-stone-50">Dismiss</button>
      </div>
    </motion.div>
  );
};

export default CommercialAutonomy;
