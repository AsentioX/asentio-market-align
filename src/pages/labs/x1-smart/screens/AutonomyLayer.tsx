import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Sparkles, Zap, Brain, Shield, Undo2 } from 'lucide-react';
import { AUTONOMY_LEVELS, type AutonomyMode } from '../x1Data';
import { toast } from 'sonner';

const ICONS = { manual: Eye, assisted: Sparkles, autonomous: Zap } as const;

const RECENT_DECISIONS = [
  { time: '4m ago', action: 'Unlocked door for Jon (face match)', confidence: 0.99, mode: 'autonomous' as const },
  { time: '34m ago', action: 'Unlocked door for FedEx, then relocked', confidence: 0.96, mode: 'autonomous' as const },
  { time: '2h ago', action: 'Suggested Vacation Mode for Tahoe rental', confidence: 0.94, mode: 'assisted' as const },
  { time: '5h ago', action: 'Held action — face match below threshold (0.62)', confidence: 0.62, mode: 'manual' as const },
];

const AutonomyLayer = () => {
  const [mode, setMode] = useState<AutonomyMode>('assisted');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 font-medium mb-1">Autonomy & control</h2>
        <p className="text-[15px] text-white/70">Decide how much X1 acts on your behalf — and see why every decision was made.</p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {AUTONOMY_LEVELS.map((level) => {
          const Icon = ICONS[level.value];
          const active = mode === level.value;
          return (
            <button
              key={level.value}
              onClick={() => {
                setMode(level.value);
                toast.success(`Autonomy → ${level.label}`, { description: level.description });
              }}
              className={`text-left rounded-2xl border backdrop-blur-sm p-5 transition-all ${
                active
                  ? 'border-cyan-400/40 bg-cyan-400/[0.04] shadow-[0_0_32px_-10px_rgba(34,211,238,0.5)]'
                  : 'border-white/[0.06] bg-white/[0.025] hover:border-white/12'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  active ? 'bg-cyan-400/15 text-cyan-300' : 'bg-white/[0.04] text-white/55'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                {active && (
                  <motion.span
                    layoutId="autonomy-active"
                    className="text-[10px] uppercase tracking-wider font-semibold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30"
                  >
                    Active
                  </motion.span>
                )}
              </div>
              <div className="text-base font-semibold text-white">{level.label}</div>
              <div className="text-[12px] text-white/50 mt-1 leading-relaxed">{level.description}</div>
            </button>
          );
        })}
      </div>

      {/* Confidence threshold */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium text-white">Confidence threshold for auto-action</div>
            <div className="text-[12px] text-white/45 mt-0.5">Below this, X1 will ask before acting.</div>
          </div>
          <div className="text-2xl font-semibold tracking-tight text-cyan-300">85%</div>
        </div>
        <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-[85%] bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full" />
          <div className="absolute top-1/2 left-[85%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-cyan-400/40 ring-2 ring-cyan-400/30" />
        </div>
        <div className="flex justify-between text-[10px] text-white/35 mt-1.5">
          <span>Cautious · ask more</span>
          <span>Trusting · act more</span>
        </div>
      </div>

      {/* Decision log with reasoning */}
      <div>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold mb-3">
          <Brain className="w-3 h-3" /> Recent decisions · transparent reasoning
        </div>
        <div className="space-y-2">
          {RECENT_DECISIONS.map((d, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 flex items-center gap-3.5">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/85 leading-snug">{d.action}</div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-white/40">
                  <span>{d.time}</span>
                  <span className="text-white/20">·</span>
                  <span className="capitalize">{d.mode} mode</span>
                  <span className="text-white/20">·</span>
                  <span className={d.confidence >= 0.85 ? 'text-cyan-300' : d.confidence >= 0.7 ? 'text-amber-300' : 'text-white/50'}>
                    {Math.round(d.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
              <button
                onClick={() => toast.success('Override saved', { description: 'X1 will adjust future behavior.' })}
                className="flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                <Undo2 className="w-3 h-3" /> Override
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trust card */}
      <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.05] to-transparent p-5 flex items-start gap-3">
        <Shield className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-medium text-white">Every decision is reversible.</div>
          <div className="text-[12px] text-white/55 mt-1 leading-relaxed">
            X1 logs every action with full reasoning. Override once and the system updates its model — no rules to write.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomyLayer;
