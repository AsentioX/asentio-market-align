import { MapPin } from 'lucide-react';
import type { Perk } from './perkData';

interface Props {
  perk: Perk;
  onTap: () => void;
}

const PerkCard = ({ perk, onTap }: Props) => (
  <button onClick={onTap} className="w-full text-left rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] transition-transform">
    <div className="relative h-40 overflow-hidden">
      <img src={perk.image} alt={perk.title} className="w-full h-full object-cover" loading="lazy" />
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
);

export default PerkCard;
