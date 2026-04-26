import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import type { Perk, Venue } from '@/hooks/usePerkPath';
import { distanceKm } from '@/hooks/useGeolocation';

interface Props {
  coords: { lat: number; lng: number } | null;
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';
  perks: Perk[];
  venues: Venue[];
  onRequest: () => void;
  onPerkTap: (perk: Perk) => void;
}

const NearbyNow = ({ coords, status, perks, venues, onRequest, onPerkTap }: Props) => {
  const nearbyMatches = useMemo(() => {
    if (!coords) return [];
    const venuesWithDistance = venues
      .filter(v => v.latitude !== null && v.longitude !== null)
      .map(v => ({ venue: v, km: distanceKm(coords, { lat: v.latitude as number, lng: v.longitude as number }) }))
      .filter(x => x.km <= 25)
      .sort((a, b) => a.km - b.km)
      .slice(0, 5);

    return venuesWithDistance
      .map(({ venue, km }) => {
        // Pick best perk for this venue: prefer venue.brand match, then tag overlap
        const brand = (venue.brand ?? '').toLowerCase();
        const candidates = perks
          .map(p => {
            let score = 0;
            const venueText = (p.venue ?? '').toLowerCase();
            if (brand && venueText.includes(brand)) score += 10;
            if (brand && p.title.toLowerCase().includes(brand)) score += 5;
            const tagOverlap = p.perk_tags.filter(t => venue.perk_tags.includes(t)).length;
            score += tagOverlap * 2;
            // Prefer lifestyle perks per spec
            if (p.membership?.category === 'lifestyle') score += 3;
            return { perk: p, score };
          })
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score);

        if (candidates.length === 0) return null;
        return { venue, km, perk: candidates[0].perk };
      })
      .filter((x): x is { venue: Venue; km: number; perk: Perk } => x !== null);
  }, [coords, venues, perks]);

  if (status === 'unavailable') return null;

  if (status === 'idle' || status === 'denied') {
    return (
      <div className="px-5 py-3">
        <button
          onClick={onRequest}
          className="w-full rounded-2xl bg-slate-50 border border-slate-100 p-4 text-left hover:bg-slate-100 transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">Nearby Now</p>
            <p className="text-[11px] text-slate-500">
              {status === 'denied' ? 'Location blocked. Enable in your browser to see lifestyle perks around you.' : 'Surface lifestyle perks at venues around you.'}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">{status === 'denied' ? 'Retry' : 'Enable'}</span>
        </button>
      </div>
    );
  }

  if (status === 'requesting') {
    return (
      <div className="px-5 py-3">
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          <p className="text-xs text-slate-500">Finding perks near you…</p>
        </div>
      </div>
    );
  }

  if (nearbyMatches.length === 0) {
    return (
      <div className="px-5 py-3">
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
          <p className="text-xs font-semibold text-slate-700 mb-0.5 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-rose-600" />
            Nearby Now
          </p>
          <p className="text-[11px] text-slate-500">No partner venues within 25 km. Try a major city for more matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-3">
      <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
        <Navigation className="w-4 h-4 text-rose-600" />
        Nearby Now
      </h2>
      <div className="space-y-2">
        {nearbyMatches.slice(0, 3).map(({ venue, km, perk }) => (
          <button
            key={venue.id}
            onClick={() => onPerkTap(perk)}
            className="w-full rounded-2xl bg-white border border-slate-100 p-3 hover:border-rose-200 hover:shadow-sm transition-all text-left flex items-center gap-3 active:scale-[0.99]"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
              style={{ backgroundColor: (perk.membership?.brand_color ?? '#10b981') + '20' }}
            >
              {perk.membership?.logo ?? '✨'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{perk.title}</p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                <MapPin className="w-2.5 h-2.5 shrink-0" />
                {venue.name} · {km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 bg-emerald-50 text-emerald-700">
              {perk.value_label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NearbyNow;
