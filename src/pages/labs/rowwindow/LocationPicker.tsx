import { useMemo, useState } from 'react';
import { ChevronDown, MapPin, Navigation, Search, Star, X } from 'lucide-react';
import { ROW_LOCATIONS, RowLocation } from './locations';
import type { NearbyLocation } from './useRowLocation';

interface LocationPickerProps {
  location: RowLocation;
  favorites: RowLocation[];
  nearby: NearbyLocation[];
  isFavorite: boolean;
  gpsStatus: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';
  gpsError: string | null;
  onSelect: (id: string) => void;
  onToggleFavorite: (id?: string) => void;
  onUseGPS: () => void;
}

export const LocationPicker = ({
  location, favorites, nearby, isFavorite, gpsStatus, gpsError,
  onSelect, onToggleFavorite, onUseGPS,
}: LocationPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROW_LOCATIONS;
    return ROW_LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, RowLocation[]>();
    for (const loc of filtered) {
      const arr = map.get(loc.region) ?? [];
      arr.push(loc);
      map.set(loc.region, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-left transition"
        >
          <MapPin className="w-4 h-4 text-cyan-300 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-100 truncate">{location.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{location.region}</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
        </button>
        <button
          onClick={() => onToggleFavorite()}
          className={`p-2 rounded-lg border transition ${
            isFavorite
              ? 'border-amber-400/40 bg-amber-500/15 text-amber-300'
              : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-amber-300'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={onUseGPS}
          disabled={gpsStatus === 'requesting'}
          className="p-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition disabled:opacity-50"
          aria-label="Use my GPS location"
          title="Use my GPS location"
        >
          <Navigation className={`w-4 h-4 ${gpsStatus === 'requesting' ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {gpsError && (
        <div className="mt-2 text-[11px] text-rose-300/90">GPS: {gpsError}</div>
      )}

      {open && (
        <>
          {/* backdrop */}
          <button
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close picker"
          />
          <div className="absolute z-40 mt-2 left-0 right-0 max-h-[60vh] overflow-hidden rounded-xl border border-white/10 bg-[hsl(220_30%_10%)] shadow-2xl shadow-black/60">
            <div className="p-2 border-b border-white/5 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search locations…"
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none py-1"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[50vh]">
              {nearby.length > 0 && !query && (
                <div className="px-3 pt-3 pb-1">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/80 font-semibold flex items-center gap-1.5">
                    <Navigation className="w-3 h-3" /> Nearby
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    {nearby.map((loc) => (
                      <LocationRow
                        key={`near-${loc.id}`}
                        loc={loc}
                        active={loc.id === location.id}
                        favorite={favorites.some((f) => f.id === loc.id)}
                        distanceKm={loc.distanceKm}
                        onSelect={() => { onSelect(loc.id); setOpen(false); }}
                        onToggleFavorite={() => onToggleFavorite(loc.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {favorites.length > 0 && !query && (
                <div className="px-3 pt-3 pb-1">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300/80 font-semibold flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-current" /> Favorites
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    {favorites.map((loc) => (
                      <LocationRow
                        key={`fav-${loc.id}`}
                        loc={loc}
                        active={loc.id === location.id}
                        favorite
                        onSelect={() => { onSelect(loc.id); setOpen(false); }}
                        onToggleFavorite={() => onToggleFavorite(loc.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {grouped.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-400">No locations match "{query}".</div>
              )}

              {grouped.map(([region, locs]) => (
                <div key={region} className="px-3 pt-3 pb-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">{region}</div>
                  <div className="mt-1.5 space-y-0.5">
                    {locs.map((loc) => (
                      <LocationRow
                        key={loc.id}
                        loc={loc}
                        active={loc.id === location.id}
                        favorite={favorites.some((f) => f.id === loc.id)}
                        onSelect={() => { onSelect(loc.id); setOpen(false); }}
                        onToggleFavorite={() => onToggleFavorite(loc.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface LocationRowProps {
  loc: RowLocation;
  active: boolean;
  favorite: boolean;
  distanceKm?: number;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

const formatDistance = (km: number) => {
  const mi = km * 0.621371;
  if (mi < 10) return `${mi.toFixed(1)} mi`;
  return `${Math.round(mi)} mi`;
};

const LocationRow = ({ loc, active, favorite, distanceKm, onSelect, onToggleFavorite }: LocationRowProps) => (
  <div
    className={`flex items-center gap-2 rounded-lg transition ${
      active ? 'bg-cyan-500/15 border border-cyan-400/30' : 'border border-transparent hover:bg-white/[0.04]'
    }`}
  >
    <button onClick={onSelect} className="flex-1 flex items-center gap-2 px-2.5 py-2 text-left min-w-0">
      <MapPin className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-cyan-300' : 'text-slate-500'}`} />
      <span className={`text-sm truncate ${active ? 'text-cyan-100 font-medium' : 'text-slate-200'}`}>{loc.name}</span>
      {typeof distanceKm === 'number' && (
        <span className="ml-auto text-[11px] tabular-nums text-cyan-300/70 shrink-0">{formatDistance(distanceKm)}</span>
      )}
    </button>
    <button
      onClick={onToggleFavorite}
      className={`p-1.5 mr-1 rounded transition ${
        favorite ? 'text-amber-300' : 'text-slate-500 hover:text-amber-300'
      }`}
      aria-label={favorite ? 'Unfavorite' : 'Favorite'}
    >
      <Star className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} />
    </button>
  </div>
);
