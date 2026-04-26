import { useState, useMemo } from 'react';
import { Sparkles, ShoppingBag, DollarSign, MapPin, TrendingUp, Trophy, Check } from 'lucide-react';
import { usePerkPath, type PerkCategory } from '@/hooks/usePerkPath';
import { rankPurchaseOptions } from './purchaseEngine';

const CATEGORIES: Array<{ key: PerkCategory | 'any'; label: string; emoji: string }> = [
  { key: 'any',          label: 'Any',          emoji: '✨' },
  { key: 'dining',       label: 'Dining',       emoji: '🍽️' },
  { key: 'travel',       label: 'Travel',       emoji: '✈️' },
  { key: 'shopping',     label: 'Shopping',     emoji: '🛍️' },
  { key: 'auto',         label: 'Auto / Gas',   emoji: '⛽' },
  { key: 'health',       label: 'Health',       emoji: '💊' },
  { key: 'entertainment',label: 'Entertainment',emoji: '🎬' },
  { key: 'services',     label: 'Services',     emoji: '🔧' },
];

const PurchaseView = () => {
  const { memberships, perks } = usePerkPath();
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<PerkCategory | 'any'>('any');
  const [amount, setAmount] = useState('');

  const ranked = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    if (!merchant.trim() && category === 'any' && amt === 0) return [];
    return rankPurchaseOptions(perks, memberships, { merchant, category, amount: amt });
  }, [perks, memberships, merchant, category, amount]);

  const winner = ranked.find(r => r.matchScore > 0) ?? null;
  const others = ranked.filter(r => r.membershipId !== winner?.membershipId);
  const amt = parseFloat(amount) || 0;

  return (
    <div className="px-5 py-5 space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Smart Purchase</h2>
        <p className="text-sm text-slate-500 mt-1">Tell us what you're buying. We'll pick the best card.</p>
      </div>

      {/* Inputs */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 space-y-4">
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
            <ShoppingBag className="w-3.5 h-3.5" /> Merchant or item
          </label>
          <input
            value={merchant}
            onChange={e => setMerchant(e.target.value)}
            placeholder="e.g. Hertz, Apple, hotel, gas"
            maxLength={80}
            className="w-full h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <MapPin className="w-3.5 h-3.5" /> Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  category === c.key
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Amount (optional, for savings estimate)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
            <input
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              inputMode="decimal"
              maxLength={10}
              className="w-full h-11 pl-8 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Empty state */}
      {ranked.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-8 text-center rounded-3xl bg-slate-50/60">
          <div className="w-14 h-14 rounded-3xl bg-emerald-50 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">Ready when you are</p>
          <p className="text-xs text-slate-500">Enter a merchant or pick a category to see your best card.</p>
        </div>
      )}

      {/* Winner */}
      {winner && winner.matchScore > 0 && (
        <div className="rounded-3xl overflow-hidden shadow-lg" style={{ background: `linear-gradient(135deg, ${winner.brandColor}, ${winner.brandColor}dd)` }}>
          <div className="p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Best Choice</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                {winner.category} · {winner.pillar}
              </span>
            </div>

            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">{winner.logo}</div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold truncate">{winner.membershipName}</p>
                {winner.bestPerk && (
                  <p className="text-sm opacity-90 truncate">{winner.bestPerk.title}</p>
                )}
              </div>
            </div>

            {amt > 0 && winner.estimatedSavings > 0 ? (
              <div className="mt-2 pt-3 border-t border-white/20">
                <p className="text-[11px] uppercase tracking-wider opacity-75">Estimated savings</p>
                <p className="text-3xl font-extrabold">${winner.estimatedSavings.toFixed(2)}</p>
                <p className="text-xs opacity-80 mt-0.5">{winner.reason}</p>
              </div>
            ) : (
              <div className="mt-2 pt-3 border-t border-white/20">
                <p className="text-sm font-semibold">{winner.reason}</p>
              </div>
            )}

            {winner.bestPerk?.how_to_redeem && (
              <div className="mt-3 p-3 rounded-2xl bg-white/15 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wider font-bold opacity-80 mb-1">How to redeem</p>
                <p className="text-xs leading-relaxed">{winner.bestPerk.how_to_redeem}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison */}
      {others.length > 0 && winner && winner.matchScore > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Other Options</h3>
          </div>
          <div className="space-y-2">
            {others.map(opt => (
              <div
                key={opt.membershipId}
                className={`rounded-2xl border p-4 ${
                  opt.matchScore > 0 ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50/50 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{opt.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-900 truncate">{opt.membershipName}</p>
                      {amt > 0 && opt.estimatedSavings > 0 && (
                        <span className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                          ${opt.estimatedSavings.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {opt.bestPerk ? (
                      <>
                        <p className="text-xs text-slate-600 truncate">{opt.bestPerk.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{opt.reason}</p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No matching perk for this purchase</p>
                    )}
                  </div>
                  {opt.matchScore > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                      {opt.category === 'financial' ? 'Card' : 'Member'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stacking tip */}
      {winner && winner.matchScore > 0 && others.some(o => o.matchScore > 0 && o.category !== winner.category) && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900 mb-1">💡 Stack tip</p>
              <p className="text-xs text-emerald-800/90 leading-relaxed">
                Pay with your <strong>{winner.membershipName}</strong> card, then show your{' '}
                {others.filter(o => o.matchScore > 0 && o.category === 'lifestyle').slice(0, 1).map(o => (
                  <strong key={o.membershipId}>{o.membershipName}</strong>
                ))}{' '}
                membership for an additional discount when applicable.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseView;
