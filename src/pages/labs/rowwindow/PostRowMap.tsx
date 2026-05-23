import { useEffect, useMemo, useRef, useState } from 'react';
import L from './leaflet-setup';
import { Gauge, Clock, Route, TrendingUp } from 'lucide-react';
import type { TrackPoint } from './useRowSensors';

interface Props {
  track: TrackPoint[];
}

// Color a speed value (m/s) on a Red→Yellow→Green gradient.
// Tuned for typical rowing: slow ≤ 2 m/s, fast ≥ 4 m/s.
function speedColor(speedMs: number, minS: number, maxS: number): string {
  if (maxS <= minS) return 'hsl(150 70% 45%)';
  const t = Math.max(0, Math.min(1, (speedMs - minS) / (maxS - minS)));
  // Red(0) → Yellow(0.5) → Green(1)
  const hue = t * 130; // 0=red, 60=yellow, 130=green-ish
  return `hsl(${hue} 80% 50%)`;
}

const dot = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

export function PostRowMap({ track }: Props) {
  const [scrubIdx, setScrubIdx] = useState<number | null>(null);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  const stats = useMemo(() => {
    if (track.length < 2) {
      return { distance: 0, durationMs: 0, avgSpeed: 0, maxSpeed: 0, minS: 0, maxS: 0 };
    }
    let dist = 0;
    let maxSpeed = 0;
    let minS = Infinity;
    let maxS = 0;
    for (let i = 1; i < track.length; i++) {
      const a = track[i - 1];
      const b = track[i];
      dist += haversineMeters(a.lat, a.lon, b.lat, b.lon);
      const s = b.speedMs;
      if (s > maxSpeed) maxSpeed = s;
      if (s > 0.2) {
        if (s < minS) minS = s;
        if (s > maxS) maxS = s;
      }
    }
    const durationMs = track[track.length - 1].t - track[0].t;
    const avgSpeed = durationMs > 0 ? dist / (durationMs / 1000) : 0;
    if (!isFinite(minS)) minS = 0;
    return { distance: dist, durationMs, avgSpeed, maxSpeed, minS, maxS };
  }, [track]);

  // Build colored segments (each pair of consecutive points = one polyline)
  const segments = useMemo(() => {
    const segs: { positions: [number, number][]; color: string; idx: number }[] = [];
    for (let i = 1; i < track.length; i++) {
      const a = track[i - 1];
      const b = track[i];
      segs.push({
        positions: [[a.lat, a.lon], [b.lat, b.lon]],
        color: speedColor(b.speedMs, stats.minS, stats.maxS),
        idx: i,
      });
    }
    return segs;
  }, [track, stats.minS, stats.maxS]);

  const hasTrack = track.length >= 2;
  const center = useMemo<[number, number]>(() => hasTrack ? [track[0].lat, track[0].lon] : [0, 0], [hasTrack, track]);
  const scrubPoint = hasTrack && scrubIdx !== null ? track[scrubIdx] : null;
  const scrubColor = scrubPoint ? speedColor(scrubPoint.speedMs, stats.minS, stats.maxS) : '#000';

  useEffect(() => {
    if (!hasTrack || !mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current, { scrollWheelZoom: true }).setView(center, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [center, hasTrack]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    segments.forEach((s) => L.polyline(s.positions, { color: s.color, weight: 5, opacity: 0.9 }).addTo(layer));
    L.circleMarker([track[0].lat, track[0].lon], { radius: 7, color: 'white', fillColor: 'hsl(150 70% 45%)', fillOpacity: 1, weight: 2 }).addTo(layer);
    L.circleMarker([track[track.length - 1].lat, track[track.length - 1].lon], { radius: 7, color: 'white', fillColor: 'hsl(355 80% 55%)', fillOpacity: 1, weight: 2 }).addTo(layer);
    if (scrubPoint) {
      L.marker([scrubPoint.lat, scrubPoint.lon], { icon: dot(scrubColor) }).addTo(layer);
    }
  }, [segments, track, scrubPoint, scrubColor]);

  if (!hasTrack) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
        No GPS track recorded for this session.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <SummaryStat icon={<Route className="w-4 h-4" />} label="Distance" value={`${(stats.distance / 1000).toFixed(2)} km`} />
        <SummaryStat icon={<Clock className="w-4 h-4" />} label="Time" value={formatDuration(stats.durationMs)} />
        <SummaryStat icon={<Gauge className="w-4 h-4" />} label="Avg speed" value={`${(stats.avgSpeed * 3.6).toFixed(1)} km/h`} />
        <SummaryStat icon={<TrendingUp className="w-4 h-4" />} label="Max speed" value={`${(stats.maxSpeed * 3.6).toFixed(1)} km/h`} />
      </div>

      {/* Map with speed heatmap */}
      <div className="rounded-xl overflow-hidden border border-slate-200">
        <div className="h-[380px] relative">
          <div ref={mapElRef} className="w-full h-full" style={{ background: 'hsl(210 40% 95%)' }} />

          {/* Scrub tooltip */}
          {scrubPoint && (
            <div className="absolute top-2 left-2 right-2 sm:right-auto sm:max-w-xs z-[500] rounded-lg bg-slate-900/95 text-white px-3 py-2 shadow-md border border-slate-700 backdrop-blur text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: scrubColor }} />
                <span className="font-semibold">{(scrubPoint.speedMs * 3.6).toFixed(1)} km/h</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-slate-300">{new Date(scrubPoint.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            </div>
          )}
        </div>

        {/* Legend + scrubber */}
        <div className="border-t border-slate-200 bg-slate-50 px-3 py-3 space-y-2.5">
          <div className="flex items-center gap-3 text-[11px] text-slate-700">
            <span className="font-semibold uppercase tracking-wider">Speed</span>
            <div className="flex-1 h-2 rounded-full" style={{
              background: 'linear-gradient(to right, hsl(0 80% 50%), hsl(60 80% 50%), hsl(130 80% 50%))'
            }} />
            <span className="font-mono">{(stats.minS * 3.6).toFixed(1)} – {(stats.maxS * 3.6).toFixed(1)} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 w-12">Scrub</span>
            <input
              type="range"
              min={0}
              max={track.length - 1}
              value={scrubIdx ?? 0}
              onChange={(e) => setScrubIdx(Number(e.target.value))}
              onMouseDown={(e) => setScrubIdx(Number((e.target as HTMLInputElement).value))}
              onTouchStart={(e) => setScrubIdx(Number((e.target as HTMLInputElement).value))}
              className="flex-1 accent-cyan-600 h-6"
            />
            <button
              onClick={() => setScrubIdx(null)}
              className="text-[11px] text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-200 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-600">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold mt-0.5 text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
