import React from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Nudge } from '../lib/chiefOfStaff';

interface Props {
  nudges: Nudge[];
  ring: { done: number; total: number; pct: number };
  mode: string;
  open: boolean;
  onToggle: () => void;
  onJump: (cardId: string) => void;
}

const toneClass: Record<Nudge['tone'], string> = {
  urgent: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
  warn: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
  info: 'border-white/15 bg-white/5 text-white/70',
};

const ChiefOfStaff: React.FC<Props> = ({ nudges, ring, mode, open, onToggle, onJump }) => {
  if (!open) {
    return (
      <button
        onClick={onToggle}
        aria-label="Open Chief of Staff"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 text-white shadow-xl backdrop-blur-md hover:border-white/50"
      >
        <Bot className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[300px] rounded-2xl border border-white/15 bg-slate-900/85 p-4 shadow-2xl backdrop-blur-xl">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full',
              mode === 'personal' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-indigo-400/20 text-indigo-300',
            )}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Chief of Staff</div>
            <div className="text-[10px] uppercase tracking-wide text-white/40">{mode} mode</div>
          </div>
        </div>
        <button onClick={onToggle} aria-label="Close Chief of Staff" className="text-white/40 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div
          className="relative h-12 w-12 shrink-0 rounded-full"
          style={{
            background: `conic-gradient(hsl(158 64% 45%) ${ring.pct * 3.6}deg, hsl(0 0% 100% / 0.08) 0deg)`,
          }}
        >
          <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
            {ring.pct}%
          </div>
        </div>
        <div className="text-xs text-white/60">
          {ring.done} of {ring.total} tasks done today
        </div>
      </div>

      <div className="max-h-[260px] space-y-2 overflow-y-auto">
        {nudges.map((n) => (
          <button
            key={n.id}
            onClick={() => n.cardId && onJump(n.cardId)}
            className={cn('w-full rounded-lg border p-2.5 text-left text-xs transition hover:brightness-125', toneClass[n.tone])}
          >
            <div className="font-semibold">{n.title}</div>
            {n.detail && <div className="mt-0.5 text-[11px] opacity-80">{n.detail}</div>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChiefOfStaff;
