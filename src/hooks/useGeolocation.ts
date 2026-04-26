import { useState, useEffect } from 'react';

interface Coords { lat: number; lng: number; accuracy?: number }

interface State {
  coords: Coords | null;
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';
  error: string | null;
}

// Lightweight geolocation hook. Lazy — only requests when `request()` is called.
export function useGeolocation() {
  const [state, setState] = useState<State>({ coords: null, status: 'idle', error: null });

  // Detect support
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState({ coords: null, status: 'unavailable', error: 'Geolocation not supported' });
    }
  }, []);

  const request = () => {
    if (!('geolocation' in navigator)) {
      setState({ coords: null, status: 'unavailable', error: 'Geolocation not supported' });
      return;
    }
    setState(s => ({ ...s, status: 'requesting' }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy },
          status: 'granted',
          error: null,
        });
      },
      (err) => {
        setState({ coords: null, status: 'denied', error: err.message });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  return { ...state, request };
}

// Haversine distance in km between two coordinates
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}
