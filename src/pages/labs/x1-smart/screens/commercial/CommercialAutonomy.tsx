import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, Power, Brain } from 'lucide-react';
import { COM_RULES, type ComRule } from '../../commercialData';
import { toast } from 'sonner';

const CommercialAutonomy = () => {
  const [rules, setRules] = useState<ComRule[]>(COM_RULES);

  const toggle = (id: string) => {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    const r = rules.find((x) => x.id === id);
    if (r) toast.success(r.active ? 'Policy paused' : 'Policy activated', { description: r.name });
  };

  const accept = (id: string) => {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, active: true, suggested: false } : r)));
    toast.success('Suggestion accepted', { description: 'X1 will now run this automatically.' });
  };

  const policies = rules.filter((r) => !r.suggested);
  const activeCount = policies.filter((r) => r.active).length;
  const suggested = rules.filter((r) => r.suggested);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold mb-2">Autonomy · operational policies</h2>
        <p className="text-[17px] text-stone-700 leading-snug">Site policies follow <span className="text-stone-900 font-semibold">IF (role + condition + zone) THEN (action)</span>.</p>
      </div>

      <div className="relative rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-white p-5 flex items-start gap-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-300/40 to-fuchsia-300/30 rounded-full blur-3xl -translate-y-12 translate-x-12" />
        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
          <Brain className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className="relative flex-1">
          <div className="text-base font-semibold text-stone-900">X1 is learning operational patterns</div>
          <div className="text-[13px] text-stone-600 mt-1 leading-relaxed">
            <span className="font-semibold text-violet-700">47 patterns</span> identified across 3 sites · <span className="font-semibold text-violet-700">{suggested.length} new policies</span> ready to review.
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold">
            <Power className="w-3 h-3" /> Active policies · {active.length}
          </div>
          <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-indigo-600 hover:text-indigo-800">
            <Plus className="w-3.5 h-3.5" /> New policy
          </button>
        </div>
        <div className="space-y-2">
          {active.map((r) => <RuleCard key={r.id} rule={r} onToggle={() => toggle(r.id)} />)}
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
    </div>
  );
};

const RuleCard = ({ rule, onToggle }: { rule: ComRule; onToggle: () => void }) => (
  <motion.div layout className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
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

const SuggestedRuleCard = ({ rule, onAccept, onDismiss }: { rule: ComRule; onAccept: () => void; onDismiss: () => void }) => (
  <motion.div layout className="rounded-2xl border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50/50 to-indigo-50/30 p-4">
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">Suggested</span>
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

export default CommercialAutonomy;
