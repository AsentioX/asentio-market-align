import { useState } from 'react';
import { MapPin, CreditCard, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { Perk } from './perkData';

interface Props {
  perk: Perk;
  onTap?: () => void;
}

const PerkCard = ({ perk, onTap }: Props) => {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    setFlipped(v => !v);
    onTap?.();
  };

  return (
    <div className="w-full" style={{ perspective: '1200px' }}>
      <div
        className="relative w-full transition-transform duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '280px',
        }}
      >
        {/* FRONT */}
        <button
          onClick={handleClick}
          aria-label={`View details for ${perk.title}`}
          className="absolute inset-0 w-full text-left rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="relative h-40 overflow-hidden">
            <img
              src={perk.image}
              alt={perk.title}
              className="w-full h-full object-cover bg-slate-100"
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = '1';
                  img.src = 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&h=375&fit=crop';
                }
              }}
            />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: perk.brandColor }}>
                {perk.membershipName}
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/90">
              <MapPin className="w-3 h-3" />
              <span className="text-[11px] font-medium">{perk.distance === '—' ? 'Nationwide' : perk.distance}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-1">{perk.title}</h3>
            <p className="text-xs text-slate-500">{perk.venue}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              {perk.value}
            </div>
          </div>
        </button>

        {/* BACK */}
        <div
          className="absolute inset-0 w-full rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-md flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          aria-hidden={!flipped}
        >
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: perk.brandColor }}>
                {perk.membershipName}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3" />
                {perk.distance === '—' ? 'Nationwide' : `${perk.distance} away`}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">{perk.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{perk.venue}</p>
          </div>
          <div className="px-5 flex-1 space-y-3 overflow-y-auto">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              {perk.value}
            </div>
            {perk.howToRedeem && (
              <div>
                <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-1">How to Redeem</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{perk.howToRedeem}</p>
              </div>
            )}
          </div>
          <div className="p-4 grid grid-cols-[1fr_auto] gap-2">
            <button
              onClick={() => toast.success('Member ID shown to cashier ✓')}
              className="h-11 rounded-2xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <CreditCard className="w-4 h-4" />
              Show Member ID
            </button>
            <button
              onClick={() => setFlipped(false)}
              aria-label="Flip card back"
              className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerkCard;
