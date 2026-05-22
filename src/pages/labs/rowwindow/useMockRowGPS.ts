import { useEffect, useRef, useState } from 'react';
import { haversineMeters, Waypoint } from './useWaypoints';
import type { TrackPoint } from './useRowSensors';

interface Options {
  active: boolean;
  waypoints: Waypoint[];
  fallbackCenter: { lat: number; lon: number };
  speedMs?: number; // simulated boat speed
}

/**
 * Drives a simulated GPS track along the planned waypoints (or wandering
 * around fallbackCenter when no waypoints exist). Lets the user test live
 * tracking + waypoint snapping without physically moving.
 */
export function useMockRowGPS({ active, waypoints, fallbackCenter, speedMs = 3.0 }: Options) {
  const [track, setTrack] = useState<TrackPoint[]>([]);
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [distanceMeters, setDistanceMeters] = useState<number>(0);

  const segRef = useRef<number>(0); // current waypoint segment index
  const progRef = useRef<number>(0); // 0..1 along current segment
  const tRef = useRef<number>(0);

  // Reset when toggled on
  useEffect(() => {
    if (!active) return;
    segRef.current = 0;
    progRef.current = 0;
    tRef.current = 0;
    const start = waypoints[0] ?? fallbackCenter;
    setTrack([{ t: Date.now(), lat: start.lat, lon: start.lon, speedMs: 0, accuracy: 5 }]);
    setPosition({ lat: start.lat, lon: start.lon });
    setDistanceMeters(0);
    setSpeed(0);
  }, [active, waypoints, fallbackCenter]);

  useEffect(() => {
    if (!active) return;
    const TICK = 1000;
    const id = setInterval(() => {
      tRef.current += TICK;
      // jittered speed for realism
      const v = speedMs * (0.85 + Math.random() * 0.3);
      const stepMeters = v * (TICK / 1000);

      let nextLat: number;
      let nextLon: number;
      let bearing = 0;

      if (waypoints.length >= 2) {
        // Walk along segments
        let remaining = stepMeters;
        let seg = segRef.current;
        let prog = progRef.current;
        while (remaining > 0 && seg < waypoints.length - 1) {
          const a = waypoints[seg];
          const b = waypoints[seg + 1];
          const segLen = haversineMeters(a.lat, a.lon, b.lat, b.lon);
          const left = segLen * (1 - prog);
          if (left > remaining) {
            prog += remaining / segLen;
            remaining = 0;
          } else {
            remaining -= left;
            seg += 1;
            prog = 0;
          }
        }
        segRef.current = seg;
        progRef.current = prog;

        if (seg >= waypoints.length - 1) {
          const last = waypoints[waypoints.length - 1];
          nextLat = last.lat;
          nextLon = last.lon;
        } else {
          const a = waypoints[seg];
          const b = waypoints[seg + 1];
          nextLat = a.lat + (b.lat - a.lat) * prog;
          nextLon = a.lon + (b.lon - a.lon) * prog;
          bearing = bearingDeg(a.lat, a.lon, b.lat, b.lon);
        }
        // small lateral wobble (~3m) so the path looks human
        const wobble = 0.00002;
        nextLat += (Math.random() - 0.5) * wobble;
        nextLon += (Math.random() - 0.5) * wobble;
      } else {
        // No waypoints — drift around fallback center
        const prev = position ?? fallbackCenter;
        const angle = (tRef.current / 60000) * Math.PI * 2; // slow circle
        const r = 0.0003;
        nextLat = fallbackCenter.lat + Math.sin(angle) * r;
        nextLon = fallbackCenter.lon + Math.cos(angle) * r;
        bearing = bearingDeg(prev.lat, prev.lon, nextLat, nextLon);
      }

      const prev = position;
      const added = prev ? haversineMeters(prev.lat, prev.lon, nextLat, nextLon) : 0;
      setPosition({ lat: nextLat, lon: nextLon });
      setSpeed(v);
      setHeading(bearing);
      setDistanceMeters((d) => d + added);
      setTrack((t) => {
        const tp: TrackPoint = { t: Date.now(), lat: nextLat, lon: nextLon, speedMs: v, accuracy: 5 };
        const next = [...t, tp];
        if (next.length > 5000) next.shift();
        return next;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [active, waypoints, fallbackCenter, speedMs, position]);

  return { track, position, speedMs: speed, headingDeg: heading, distanceMeters };
}

function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
