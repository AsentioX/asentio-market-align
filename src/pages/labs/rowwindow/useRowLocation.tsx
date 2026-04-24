import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_LOCATION, findNearestLocation, ROW_LOCATIONS, RowLocation } from './locations';

const STORAGE_KEY = 'rowwindow:location:v1';

interface PersistedState {
  selectedId: string;
  favoriteIds: string[];
}

interface RowLocationState {
  location: RowLocation;
  favorites: RowLocation[];
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

export function useRowLocation(): RowLocationState {
  const [state, setState] = useState<PersistedState>(() => load());
  const [gpsStatus, setGpsStatus] = useState<RowLocationState['gpsStatus']>('idle');
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const location = ROW_LOCATIONS.find((l) => l.id === state.selectedId) ?? DEFAULT_LOCATION;
  const favorites = state.favoriteIds
    .map((id) => ROW_LOCATIONS.find((l) => l.id === id))
    .filter((l): l is RowLocation => Boolean(l));
  const isFavorite = state.favoriteIds.includes(location.id);

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
        const nearest = findNearestLocation(pos.coords.latitude, pos.coords.longitude);
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

  return { location, favorites, isFavorite, gpsStatus, gpsError, selectLocation, toggleFavorite, useGPS };
}
