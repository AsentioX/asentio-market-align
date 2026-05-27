import { useEffect, useMemo, useRef, useState } from 'react';
import L from './leaflet-setup';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import { Lock, Unlock, Navigation, Flag, Timer } from 'lucide-react';
import { Waypoint, haversineMeters } from './useWaypoints';
import type { TrackPoint } from './useRowSensors';

const WAYPOINT_RADIUS_M = 15;

interface Props {
  waypoints: Waypoint[];
  achievedIds: string[];
  onAchieve: (id: string) => void;
  position: { lat: number; lon: number } | null;
  headingDeg: number | null;
  speedMs: number | null;
  track: TrackPoint[];
  fallbackCenter: { lat: number; lon: number };
}

const numberedIcon = (n: number, achieved: boolean) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        background: ${achieved ? 'hsl(150 70% 45%)' : 'hsl(195 90% 45%)'};
        color: white;
        width: 26px; height: 26px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 12px; font-family: ui-sans-serif, system-ui;
        opacity: ${achieved ? 0.65 : 1};
      ">
        <span style="transform: rotate(45deg);">${achieved ? '✓' : n}</span>
      </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });

const boatIcon = (headingDeg: number) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width: 38px; height: 52px;
        transform: rotate(${headingDeg}deg);
        display: flex; align-items: center; justify-content: center;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
      ">
        <svg viewBox="0 0 24 38" width="34" height="54">
          <!-- Bow arrow: left half green (port), right half red (starboard) -->
          <path d="M12 2 L12 15 L6 18 Z"
            fill="hsl(140 70% 45%)" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>
          <path d="M12 2 L18 18 L12 15 Z"
            fill="hsl(2 85% 55%)" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>
          <!-- Stern arrow: white, pointing opposite -->
          <path d="M12 36 L18 20 L12 23 L6 20 Z"
            fill="white" stroke="hsl(0 0% 25%)" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>
      </div>`,
    iconSize: [38, 52],
    iconAnchor: [19, 26],
  });


export function LiveTrackingMap({
  waypoints, achievedIds, onAchieve, position, headingDeg, speedMs, track, fallbackCenter,
}: Props) {
  const [follow, setFollow] = useState(true);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const lastAchievedRef = useRef<Set<string>>(new Set());

  // Find next unachieved waypoint
  const nextWaypoint = useMemo(
    () => waypoints.find((w) => !achievedIds.includes(w.id)) ?? null,
    [waypoints, achievedIds],
  );

  // Distance + ETA to next waypoint
  const { distToNext, etaSec } = useMemo(() => {
    if (!position || !nextWaypoint) return { distToNext: null as number | null, etaSec: null as number | null };
    const d = haversineMeters(position.lat, position.lon, nextWaypoint.lat, nextWaypoint.lon);
    const eta = speedMs && speedMs > 0.3 ? d / speedMs : null;
    return { distToNext: d, etaSec: eta };
  }, [position, nextWaypoint, speedMs]);

  // Mark a waypoint as achieved when boat gets within radius
  useEffect(() => {
    if (!position || !nextWaypoint) return;
    const d = haversineMeters(position.lat, position.lon, nextWaypoint.lat, nextWaypoint.lon);
    if (d <= WAYPOINT_RADIUS_M && !lastAchievedRef.current.has(nextWaypoint.id)) {
      lastAchievedRef.current.add(nextWaypoint.id);
      onAchieve(nextWaypoint.id);
    }
  }, [position, nextWaypoint, onAchieve]);

  const plannedPositions = waypoints.map((w) => [w.lat, w.lon] as [number, number]);
  const actualPositions = track.map((p) => [p.lat, p.lon] as [number, number]);
  const center = position ?? waypoints[0] ?? fallbackCenter;

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current, { scrollWheelZoom: true }).setView([center.lat, center.lon], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (plannedPositions.length > 1) {
      L.polyline(plannedPositions, { color: 'hsl(195 90% 45%)', weight: 3, opacity: 0.55, dashArray: '6 6' }).addTo(layer);
    }
    if (actualPositions.length > 1) {
      L.polyline(actualPositions, { color: 'hsl(22 95% 55%)', weight: 4, opacity: 0.95 }).addTo(layer);
    }
    waypoints.forEach((w, i) => {
      L.marker([w.lat, w.lon], { icon: numberedIcon(i + 1, achievedIds.includes(w.id)) }).addTo(layer);
    });
    if (nextWaypoint) {
      L.circleMarker([nextWaypoint.lat, nextWaypoint.lon], {
        radius: 22,
        color: 'hsl(195 90% 45%)',
        fillColor: 'hsl(195 90% 55%)',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4 4',
      }).addTo(layer);
    }
    if (position) {
      L.marker([position.lat, position.lon], { icon: boatIcon(headingDeg ?? 0) }).addTo(layer);
    }
  }, [plannedPositions, actualPositions, waypoints, achievedIds, nextWaypoint, position, headingDeg]);

  useEffect(() => {
    if (!follow || !position || !mapRef.current) return;
    mapRef.current.panTo([position.lat, position.lon], { animate: true, duration: 0.6 });
  }, [follow, position]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden relative">
      {/* HUD */}
      {nextWaypoint && distToNext !== null && (
        <div className="absolute top-3 inset-x-3 z-[500] rounded-xl bg-slate-900/95 text-white px-4 py-3 shadow-lg border border-slate-700 flex items-center justify-between gap-3 backdrop-blur">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <Flag className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-300">Next WP</div>
              <div className="text-sm font-semibold leading-tight">
                #{waypoints.findIndex((w) => w.id === nextWaypoint.id) + 1} of {waypoints.length}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-300">Distance</div>
            <div className="text-xl font-bold font-mono leading-tight tabular-nums">
              {distToNext < 1000 ? `${Math.round(distToNext)} m` : `${(distToNext / 1000).toFixed(2)} km`}
            </div>
          </div>
          <div className="text-right border-l border-slate-700 pl-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-300 flex items-center gap-1 justify-end">
              <Timer className="w-3 h-3" /> ETA
            </div>
            <div className="text-xl font-bold font-mono leading-tight tabular-nums">
              {etaSec === null
                ? '—'
                : etaSec < 60
                  ? `${Math.round(etaSec)}s`
                  : `${Math.floor(etaSec / 60)}:${String(Math.round(etaSec % 60)).padStart(2, '0')}`}
            </div>
          </div>
        </div>
      )}
      {waypoints.length > 0 && !nextWaypoint && (
        <div className="absolute top-3 inset-x-3 z-[500] rounded-xl bg-emerald-600/95 text-white px-4 py-3 shadow-lg border border-emerald-400/40 flex items-center gap-2 backdrop-blur">
          <Flag className="w-4 h-4" />
          <div className="text-sm font-semibold">All waypoints achieved · row freely</div>
        </div>
      )}

      <div className="h-[440px] md:h-[520px] relative">
        <div
          ref={mapElRef}
          className="w-full h-full"
          style={{ background: 'hsl(210 40% 95%)' }}
        />

        {/* Camera lock toggle */}
        <button
          onClick={() => setFollow((v) => !v)}
          className={`absolute bottom-3 right-3 z-[500] px-3 py-2 rounded-lg border shadow-md text-xs font-medium inline-flex items-center gap-1.5 transition ${
            follow
              ? 'bg-cyan-600 text-white border-cyan-700 hover:bg-cyan-700'
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {follow ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          {follow ? 'Following boat' : 'Free pan'}
        </button>

        {!position && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-[400]">
            <div className="text-center px-6">
              <Navigation className="w-8 h-8 text-cyan-700 mx-auto animate-pulse" />
              <p className="text-sm font-medium text-slate-800 mt-2">Acquiring position…</p>
              <p className="text-xs text-slate-600 mt-1">Enable GPS or turn on the mock GPS simulator below.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
