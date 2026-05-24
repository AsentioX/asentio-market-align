import { useCallback, useEffect, useMemo, useState } from 'react';

export interface Waypoint {
  id: string;
  lat: number;
  lon: number;
}

const STORAGE_KEY = 'rowwindow:waypoints:v1';

function load(): Waypoint[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function useWaypoints() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>(() => load());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(waypoints)); } catch {}
  }, [waypoints]);

  const addWaypoint = useCallback((lat: number, lon: number) => {
    setWaypoints((w) => [...w, { id: `wp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, lat, lon }]);
  }, []);

  const removeWaypoint = useCallback((id: string) => {
    setWaypoints((w) => w.filter((x) => x.id !== id));
  }, []);

  const updateWaypoint = useCallback((id: string, lat: number, lon: number) => {
    setWaypoints((w) => w.map((x) => (x.id === id ? { ...x, lat, lon } : x)));
  }, []);

  const clearWaypoints = useCallback(() => setWaypoints([]), []);

  const totalDistanceMeters = useMemo(() => {
    let d = 0;
    for (let i = 1; i < waypoints.length; i++) {
      d += haversineMeters(waypoints[i - 1].lat, waypoints[i - 1].lon, waypoints[i].lat, waypoints[i].lon);
    }
    return d;
  }, [waypoints]);

  return { waypoints, addWaypoint, removeWaypoint, updateWaypoint, clearWaypoints, totalDistanceMeters, setWaypoints };
}
