import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Sparkles, Zap, Brain, Shield, Undo2 } from 'lucide-react';
import { AUTONOMY_LEVELS, type AutonomyMode } from '../x1Data';
import { toast } from 'sonner';

const ICONS = { manual: Eye, assisted: Sparkles, autonomous: Zap } as const;
const COLORS = {
  manual: { bg: 'bg-stone-500', ring: 'ring-stone-500', light: 'bg-stone-100', border: 'border-stone-200' },
  assisted: { bg: 'bg-blue-500', ring: 'ring-blue-500', light: 'bg-blue-50', border: 'border-blue-200' },
  autonomous: { bg: 'bg-violet-500', ring: 'ring-violet-500', light: 'bg-violet-50', border: 'border-violet-200' },
} as const;

const RECENT_DECISIONS = [
  { time: '4m ago', action: 'Unlocked door for Jon (face match)', confidence: 0.99, mode: 'autonomous' as const },
  { time: '34m ago', action: 'Unlocked door for FedEx, then relocked', confidence: 0.96, mode: 'autonomous' as const },
  { time: '2h ago', action: 'Suggested Vacation Mode for Tahoe rental', confidence: 0.94, mode: 'assisted' as const },
  { time: '5h ago', action: 'Held action — face match below threshold (0.62)', confidence: 0.62, mode: 'manual' as const },
];

const AutonomyLayer = () => {
  const [mode, setMode] = useState<AutonomyMode>('assisted');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold mb-2">Autonomy & control</h2>
        <p className="text-[17px] text-stone-700 leading-snug">Decide how much X1 acts on your behalf — and see <span className="text-stone-900 font-semibold">why</span> every decision was made.</p>
      </div>

      {/* Mode selector — horizontal row of buttons */}
      <div className="flex gap-3">
        {AUTONOMY_LEVELS.map((level) => {
          const Icon = ICONS[level.value];
          const grad = GRADIENTS[level.value];
          const active = mode === level.value;
          return (
            <button
              key={level.value}
              onClick={() => {
                setMode(level.value);
                toast.success(`Autonomy → ${level.label}`, { description: level.description });
              }}
              className={`relative flex-1 text-left rounded-2xl border p-4 transition-all overflow-hidden ${
                active
                  ? 'border-stone-900 bg-white shadow-xl scale-[1.01]'
                  : 'border-black/[0.06] bg-white hover:border-black/15 hover:shadow-md shadow-sm'
              }`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${grad} opacity-12 rounded-full blur-2xl -translate-y-6 translate-x-6`} />

              <div className="relative flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[15px] font-bold text-stone-900 tracking-tight">{level.label}</div>
                    {active && (
                      <span className="text-[9px] uppercase tracking-wider font-bold text-violet-700 px-2 py-0.5 rounded-full bg-violet-100 border border-violet-200 flex-shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5 leading-snug truncate">{level.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confidence threshold */}
      <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-stone-900">Confidence threshold for auto-action</div>
            <div className="text-[12px] text-stone-500 mt-0.5">Below this, X1 will ask before acting.</div>
          </div>
          <div className="text-3xl font-bold tracking-tight bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">85%</div>
        </div>
        <div className="relative h-2.5 rounded-full bg-stone-100 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-[85%] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-full" />
          <div className="absolute top-1/2 left-[85%] -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg ring-2 ring-violet-500" />
        </div>
        <div className="flex justify-between text-[10px] text-stone-400 mt-2 font-medium uppercase tracking-wider">
          <span>Cautious · ask more</span>
          <span>Trusting · act more</span>
        </div>
      </div>

      {/* Decision log */}
      <div>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500 font-bold mb-3">
          <Brain className="w-3 h-3" /> Recent decisions · transparent reasoning
        </div>
        <div className="space-y-2">
          {RECENT_DECISIONS.map((d, i) => (
            <div key={i} className="rounded-2xl border border-black/[0.06] bg-white p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-1 self-stretch rounded-full ${
                d.confidence >= 0.85 ? 'bg-violet-500' : d.confidence >= 0.7 ? 'bg-amber-500' : 'bg-stone-300'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-stone-900 font-medium leading-snug">{d.action}</div>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-500 font-medium">
                  <span>{d.time}</span>
                  <span className="text-stone-300">·</span>
                  <span className="capitalize">{d.mode}</span>
                  <span className="text-stone-300">·</span>
                  <span className={
                    d.confidence >= 0.85 ? 'text-violet-600 font-semibold' :
                    d.confidence >= 0.7 ? 'text-amber-700 font-semibold' :
                    'text-stone-500'
                  }>
                    {Math.round(d.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
              <button
                onClick={() => toast.success('Override saved', { description: 'X1 will adjust future behavior.' })}
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] text-stone-600 hover:text-stone-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <Undo2 className="w-3 h-3" /> Override
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trust card */}
      <div className="relative rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-white p-6 flex items-start gap-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-300/40 to-fuchsia-300/30 rounded-full blur-3xl -translate-y-12 translate-x-12" />
        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
          <Shield className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className="relative">
          <div className="text-base font-semibold text-stone-900">Every decision is reversible.</div>
          <div className="text-[13px] text-stone-600 mt-1.5 leading-relaxed">
            X1 logs every action with full reasoning. Override once and the system updates its model — no rules to write.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomyLayer;
