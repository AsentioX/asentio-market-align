import { Briefcase, Home, PartyPopper } from 'lucide-react';
import type { Perk, Pillar } from '@/hooks/usePerkPath';
import PerkCard from './PerkCard';

const PILLAR_META: Record<Pillar, { label: string; icon: typeof Home; tone: string; bg: string; chip: string }> = {
  work: {
    label: 'Work',
    icon: Briefcase,
    tone: 'text-violet-700',
    bg: 'bg-violet-50',
    chip: 'bg-violet-100 text-violet-700',
  },
  home: {
    label: 'Home',
    icon: Home,
    tone: 'text-emerald-700',
    bg: 'bg-emerald-50',
    chip: 'bg-emerald-100 text-emerald-700',
  },
  play: {
    label: 'Play',
    icon: PartyPopper,
    tone: 'text-amber-700',
    bg: 'bg-amber-50',
    chip: 'bg-amber-100 text-amber-700',
  },
};

interface Props {
  pillar: Pillar;
  perks: Perk[];
  onPerkTap: (perk: Perk) => void;
}

const PillarSection = ({ pillar, perks, onPerkTap }: Props) => {
  const meta = PILLAR_META[pillar];
  const Icon = meta.icon;

  if (perks.length === 0) return null;

  return (
    <section className="px-5 pt-4 pb-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${meta.bg} ${meta.tone} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{meta.label}</h2>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${meta.chip}`}>
          {perks.length} perks
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
        {perks.map(perk => (
          <div key={perk.id} className="w-[260px] shrink-0">
            <PerkCard
              perk={{
                id: perk.id,
                membershipId: perk.membership_id,
                membershipName: perk.membership?.name ?? '',
                brandColor: perk.membership?.brand_color ?? '#10b981',
                title: perk.title,
                value: perk.value_label,
                category: (perk.category === 'auto' || perk.category === 'dining' || perk.category === 'travel' || perk.category === 'shopping' || perk.category === 'health' ? perk.category : 'shopping') as 'auto' | 'dining' | 'travel' | 'shopping' | 'health',
                image: perk.image_url || `https://images.unsplash.com/photo-1554224155-1696413565d3?w=400&h=250&fit=crop`,
                distance: '—',
                venue: perk.venue ?? '',
                howToRedeem: perk.how_to_redeem ?? '',
              }}
              onTap={() => onPerkTap(perk)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PillarSection;
