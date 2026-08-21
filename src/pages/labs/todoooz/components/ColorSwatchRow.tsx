import React from 'react';
import { Check } from 'lucide-react';
import { TDZ_THEMES } from '../lib/theme';
import { cn } from '@/lib/utils';

interface Props {
  value: string | null;
  onChange: (key: string | null) => void;
  allowInherit?: boolean;
  className?: string;
}

const ColorSwatchRow: React.FC<Props> = ({ value, onChange, allowInherit, className }) => (
  <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
    {allowInherit && (
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'h-6 rounded-full border px-2 text-[10px] uppercase tracking-wide transition',
          value === null ? 'border-white/60 text-white' : 'border-white/15 text-white/50 hover:text-white/80',
        )}
      >
        Inherit
      </button>
    )}
    {TDZ_THEMES.map((t) => (
      <button
        key={t.key}
        type="button"
        title={t.label}
        aria-label={t.label}
        onClick={() => onChange(t.key)}
        className={cn(
          'h-6 w-6 rounded-full border transition hover:scale-110',
          value === t.key ? 'border-white ring-2 ring-white/40' : 'border-white/20',
        )}
        style={{ background: `hsl(${t.hsl})` }}
      >
        {value === t.key && <Check className="mx-auto h-3.5 w-3.5 text-white drop-shadow" />}
      </button>
    ))}
  </div>
);

export default ColorSwatchRow;
