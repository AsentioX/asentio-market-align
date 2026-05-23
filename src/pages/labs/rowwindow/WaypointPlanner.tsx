import { useEffect, useMemo, useRef } from 'react';
import L from './leaflet-setup';
import { Trash2, MapPin, Route } from 'lucide-react';
import { Waypoint } from './useWaypoints';

interface Props {
  center: { lat: number; lon: number };
  waypoints: Waypoint[];
  totalDistanceMeters: number;
  onAdd: (lat: number, lon: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const numberedIcon = (n: number) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        background: hsl(195 90% 45%);
        color: white;
        width: 28px; height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 13px; font-family: ui-sans-serif, system-ui;
      ">
        <span style="transform: rotate(45deg);">${n}</span>
      </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

export function WaypointPlanner({ center, waypoints, totalDistanceMeters, onAdd, onRemove, onClear }: Props) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const onAddRef = useRef(onAdd);
  const positions = useMemo(() => waypoints.map((w) => [w.lat, w.lon] as [number, number]), [waypoints]);

  useEffect(() => { onAddRef.current = onAdd; }, [onAdd]);

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current, { scrollWheelZoom: true }).setView([center.lat, center.lon], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => onAddRef.current(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      routeLayerRef.current = null;
    };
  }, [center.lat, center.lon]);

  useEffect(() => {
    const layer = routeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (positions.length > 1) {
      L.polyline(positions, { color: 'hsl(195 90% 45%)', weight: 4, opacity: 0.85, dashArray: '6 6' }).addTo(layer);
    }
    waypoints.forEach((w, i) => {
      L.marker([w.lat, w.lon], { icon: numberedIcon(i + 1) }).addTo(layer);
    });
  }, [positions, waypoints]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-cyan-700" />
          <h2 className="text-sm font-semibold tracking-tight">Plan your route</h2>
          <span className="text-[11px] text-slate-500 hidden sm:inline">Tap the map to add waypoints</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-700">
            <span className="font-mono font-semibold text-slate-900">
              {(totalDistanceMeters / 1000).toFixed(2)} km
            </span>
            <span className="text-slate-500 ml-1">planned</span>
          </div>
          {waypoints.length > 0 && (
            <button
              onClick={onClear}
              className="px-2.5 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 text-rose-700 text-xs font-medium inline-flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px]">
        <div className="h-[360px] md:h-[420px] relative">
          <div
            ref={mapElRef}
            className="w-full h-full"
            style={{ background: 'hsl(210 40% 95%)' }}
          />
          {waypoints.length === 0 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200 shadow-sm text-xs text-slate-700 z-[400] pointer-events-none">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-cyan-700" />
              Tap the map to drop your first waypoint
            </div>
          )}
        </div>

        <div className="border-t md:border-t-0 md:border-l border-slate-200 max-h-[420px] overflow-y-auto">
          {waypoints.length === 0 ? (
            <div className="p-4 text-xs text-slate-500 text-center">No waypoints yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {waypoints.map((w, i) => (
                <li key={w.id} className="flex items-center gap-2 px-3 py-2.5">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0 text-[11px] font-mono text-slate-700 leading-tight">
                    {w.lat.toFixed(5)},<br />{w.lon.toFixed(5)}
                  </div>
                  <button
                    onClick={() => onRemove(w.id)}
                    className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 transition"
                    aria-label={`Delete waypoint ${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
