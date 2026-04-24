import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCATION, findNearestLocation, haversineKm, ROW_LOCATIONS, RowLocation } from './locations';

const STORAGE_KEY = 'rowwindow:location:v1';
const COORDS_KEY = 'rowwindow:coords:v1';

interface PersistedState {
  selectedId: string;
  favoriteIds: string[];
}

export interface NearbyLocation extends RowLocation {
  distanceKm: number;
}

interface RowLocationState {
  location: RowLocation;
  favorites: RowLocation[];
  nearby: NearbyLocation[];
  isFavorite: boolean;
  gpsStatus: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';
  gpsError: string | null;
  selectLocation: (id: string) => void;
  toggleFavorite: (id?: string) => void;
  useGPS: () => void;
}

const load = (): PersistedState => {
  if (typeof window === 'undefined') return { selectedId: DEFAULT_LOCATION.id, favoriteIds: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { selectedId: DEFAULT_LOCATION.id, favoriteIds: [] };
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      selectedId: parsed.selectedId ?? DEFAULT_LOCATION.id,
      favoriteIds: parsed.favoriteIds ?? [],
    };
  } catch {
    return { selectedId: DEFAULT_LOCATION.id, favoriteIds: [] };
  }
};

const loadCoords = (): { lat: number; lng: number } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COORDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') return parsed;
  } catch {}
  return null;
};

export function useRowLocation(): RowLocationState {
  const [state, setState] = useState<PersistedState>(() => load());
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => loadCoords());
  const [gpsStatus, setGpsStatus] = useState<RowLocationState['gpsStatus']>('idle');
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    if (!coords) return;
    try {
      localStorage.setItem(COORDS_KEY, JSON.stringify(coords));
    } catch {}
  }, [coords]);

  const location = ROW_LOCATIONS.find((l) => l.id === state.selectedId) ?? DEFAULT_LOCATION;
  const favorites = state.favoriteIds
    .map((id) => ROW_LOCATIONS.find((l) => l.id === id))
    .filter((l): l is RowLocation => Boolean(l));
  const isFavorite = state.favoriteIds.includes(location.id);

  const nearby = useMemo<NearbyLocation[]>(() => {
    if (!coords) return [];
    return ROW_LOCATIONS
      .map((l) => ({ ...l, distanceKm: haversineKm(coords, l) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);
  }, [coords]);

  const selectLocation = useCallback((id: string) => {
    setState((p) => ({ ...p, selectedId: id }));
  }, []);

  const toggleFavorite = useCallback((id?: string) => {
    const targetId = id ?? location.id;
    setState((p) => ({
      ...p,
      favoriteIds: p.favoriteIds.includes(targetId)
        ? p.favoriteIds.filter((x) => x !== targetId)
        : [...p.favoriteIds, targetId],
    }));
  }, [location.id]);

  const useGPS = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unavailable');
      setGpsError('Geolocation is not available in this browser.');
      return;
    }
    setGpsStatus('requesting');
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        const nearest = findNearestLocation(lat, lng);
        setState((p) => ({ ...p, selectedId: nearest.id }));
        setGpsStatus('granted');
      },
      (err) => {
        setGpsStatus('denied');
        setGpsError(err.message || 'Location request denied.');
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }, []);

  return { location, favorites, nearby, isFavorite, gpsStatus, gpsError, selectLocation, toggleFavorite, useGPS };
}
}
