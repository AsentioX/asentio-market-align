import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { PerkCategory, RewardRates, RewardsCurrency } from '@/hooks/usePerkPath';
import { getRewardProfile } from './cardRewards';

interface Props {
  name: string;
  tier: string | null;
  rewardRates: RewardRates;
  baseRate: number;
  pointsValueCents: number;
  rewardsCurrency: RewardsCurrency;
  onChange: (patch: {
    reward_rates?: RewardRates;
    base_rate?: number;
    points_value_cents?: number;
    rewards_currency?: RewardsCurrency;
  }) => void;
}

const CATEGORY_LABELS: Array<{ key: PerkCategory; label: string; emoji: string }> = [
  { key: 'travel',        label: 'Travel',        emoji: '✈️' },
  { key: 'dining',        label: 'Dining',        emoji: '🍽️' },
  { key: 'shopping',      label: 'Shopping',      emoji: '🛍️' },
  { key: 'auto',          label: 'Auto / Gas',    emoji: '⛽' },
  { key: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { key: 'health',        label: 'Health',        emoji: '💊' },
  { key: 'services',      label: 'Services',      emoji: '🔧' },
];

const RewardsEditor = ({
  name,
  tier,
  rewardRates,
  baseRate,
  pointsValueCents,
  rewardsCurrency,
  onChange,
}: Props) => {
  const [seeded, setSeeded] = useState(false);

  const profileSuggestion = getRewardProfile(name, tier);
  const unit = rewardsCurrency === 'cashback' ? '%' : 'x';

  const setRate = (cat: PerkCategory, raw: string) => {
    const next = { ...rewardRates };
    const n = parseFloat(raw);
    if (!raw || Number.isNaN(n) || n <= 0) {
      delete next[cat];
    } else {
      next[cat] = n;
    }
    onChange({ reward_rates: next });
  };

  const applySuggestion = () => {
    if (!profileSuggestion) return;
    onChange({
      reward_rates: profileSuggestion.rewardRates,
      base_rate: profileSuggestion.baseRate,
      points_value_cents: profileSuggestion.pointsValueCents,
      rewards_currency: profileSuggestion.currency,
    });
    setSeeded(true);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Card Rewards</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tells PerkPath which card to recommend.</p>
        </div>
        {profileSuggestion && (
          <button
            type="button"
            onClick={applySuggestion}
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"
          >
            <Wand2 className="w-3 h-3" /> {seeded ? 'Re-seeded' : 'Auto-fill'}
          </button>
        )}
      </div>

      {/* Currency toggle */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100">
        {(['cashback', 'points'] as const).map(c => (
          <button
            key={c}
            type="button"
            onClick={() => onChange({ rewards_currency: c })}
            className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-colors ${
              rewardsCurrency === c ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {c === 'cashback' ? 'Cash back (%)' : 'Points / Miles (x)'}
          </button>
        ))}
      </div>

      {/* Per-category rates */}
      <div className="space-y-1.5">
        {CATEGORY_LABELS.map(c => (
          <div key={c.key} className="flex items-center gap-2">
            <span className="text-base w-5 text-center">{c.emoji}</span>
            <span className="flex-1 text-xs font-medium text-slate-700">{c.label}</span>
            <div className="relative w-20">
              <Input
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                max={rewardsCurrency === 'cashback' ? 10 : 20}
                value={rewardRates[c.key] ?? ''}
                onChange={e => setRate(c.key, e.target.value)}
                placeholder="—"
                className="h-8 text-xs pr-6 rounded-lg bg-slate-50 border-slate-200"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold pointer-events-none">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Base rate + points value */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div>
          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
            Everything else
          </label>
          <div className="relative">
            <Input
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              value={baseRate}
              onChange={e => onChange({ base_rate: parseFloat(e.target.value) || 0 })}
              className="h-9 text-xs pr-6 rounded-lg bg-slate-50 border-slate-200"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold pointer-events-none">{unit}</span>
          </div>
        </div>
        {rewardsCurrency === 'points' && (
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
              Point value
            </label>
            <div className="relative">
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0.1"
                max="3"
                value={pointsValueCents}
                onChange={e => onChange({ points_value_cents: parseFloat(e.target.value) || 1 })}
                className="h-9 text-xs pr-7 rounded-lg bg-slate-50 border-slate-200"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold pointer-events-none">¢</span>
            </div>
          </div>
        )}
      </div>

      {profileSuggestion && !seeded && (
        <div className="flex items-start gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
          <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>We have known rates for this card. Tap <strong>Auto-fill</strong> to apply them.</span>
        </div>
      )}
    </div>
  );
};

export default RewardsEditor;
