import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, Briefcase, Home, PartyPopper, Tag, MapPin, MapPinOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Perk, Pillar, PerkCategory, Membership } from '@/hooks/usePerkPath';
import PerkCard from './PerkCard';

type SortKey = 'recent' | 'az' | 'membership';

interface GeoLike {
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';
  request: () => void;
  clear: () => void;
}

interface Props {
  perks: Perk[];
  memberships: Membership[];
  onPerkTap: (perk: Perk) => void;
  geo?: GeoLike;
}

const PILLAR_OPTIONS: { value: Pillar; label: string; icon: typeof Home; tone: string }[] = [
  { value: 'work', label: 'Work', icon: Briefcase, tone: 'violet' },
  { value: 'home', label: 'Home', icon: Home, tone: 'emerald' },
  { value: 'play', label: 'Play', icon: PartyPopper, tone: 'amber' },
];

const CATEGORY_OPTIONS: PerkCategory[] = ['auto', 'dining', 'travel', 'shopping', 'health', 'entertainment', 'services', 'other'];

const BrowseList = ({ perks, memberships, onPerkTap, geo }: Props) => {
  const [showFilters, setShowFilters] = useState(false);
  const [pillars, setPillars] = useState<Set<Pillar>>(new Set());
  const [categories, setCategories] = useState<Set<PerkCategory>>(new Set());
  const [membershipIds, setMembershipIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortKey>('recent');

  const togglePillar = (p: Pillar) => {
    setPillars(prev => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n; });
  };
  const toggleCategory = (c: PerkCategory) => {
    setCategories(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });
  };
  const toggleMembership = (id: string) => {
    setMembershipIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const clearAll = () => { setPillars(new Set()); setCategories(new Set()); setMembershipIds(new Set()); setSortBy('recent'); };

  const activeCount = pillars.size + categories.size + membershipIds.size + (sortBy !== 'recent' ? 1 : 0);

  const filtered = useMemo(() => {
    let list = perks.filter(p => {
      if (pillars.size && !pillars.has(p.membership?.pillar ?? 'home')) return false;
      if (categories.size && !categories.has(p.category)) return false;
      if (membershipIds.size && !membershipIds.has(p.membership_id)) return false;
      return true;
    });
    if (sortBy === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'membership') list = [...list].sort((a, b) => (a.membership?.name ?? '').localeCompare(b.membership?.name ?? ''));
    return list;
  }, [perks, pillars, categories, membershipIds, sortBy]);

  return (
    <section className="px-5 pt-4 pb-2">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">All Perks</h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{filtered.length} of {perks.length}</p>
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold transition-colors ${
            activeCount > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter{activeCount > 0 && ` · ${activeCount}`}
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4"
        >
          {/* Pillar */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Hub</p>
            <div className="flex gap-2">
              {PILLAR_OPTIONS.map(({ value, label, icon: Icon }) => {
                const active = pillars.has(value);
                return (
                  <button
                    key={value}
                    onClick={() => togglePillar(value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-all ${
                      active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map(c => {
                const active = categories.has(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className={`px-3 h-8 rounded-full text-[11px] font-bold capitalize transition-all ${
                      active ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Memberships */}
          {memberships.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Membership</p>
              <div className="flex flex-wrap gap-1.5">
                {memberships.map(m => {
                  const active = membershipIds.has(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMembership(m.id)}
                      className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-[11px] font-bold transition-all ${
                        active ? 'text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                      }`}
                      style={active ? { backgroundColor: m.brand_color } : undefined}
                    >
                      <span>{m.logo}</span>
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sort */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Sort</p>
            <div className="flex gap-2">
              {([
                { v: 'recent', l: 'Default' },
                { v: 'az', l: 'A → Z' },
                { v: 'membership', l: 'Membership' },
              ] as { v: SortKey; l: string }[]).map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setSortBy(v)}
                  className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all ${
                    sortBy === v ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="w-full h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Tag className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No perks match</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(perk => (
            <PerkCard
              key={perk.id}
              perk={{
                id: perk.id,
                membershipId: perk.membership_id,
                membershipName: perk.membership?.name ?? '',
                brandColor: perk.membership?.brand_color ?? '#10b981',
                title: perk.title,
                value: perk.value_label,
                category: (['auto', 'dining', 'travel', 'shopping', 'health'].includes(perk.category) ? perk.category : 'shopping') as 'auto' | 'dining' | 'travel' | 'shopping' | 'health',
                image: perk.image_url || `https://images.unsplash.com/photo-1554224155-1696413565d3?w=400&h=250&fit=crop`,
                distance: '—',
                venue: perk.venue ?? '',
                howToRedeem: perk.how_to_redeem ?? '',
              }}
              onTap={() => onPerkTap(perk)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BrowseList;
