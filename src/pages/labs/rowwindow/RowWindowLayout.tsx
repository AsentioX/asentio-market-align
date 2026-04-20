import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Waves, Wind, Sailboat, ArrowLeft, AlertTriangle, ArrowUp, ArrowDown, Clock, Anchor, Radio, RefreshCw } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  VESSEL_PROFILES,
  VesselProfile,
  TIDE_GREEN_FT,
  TIDE_RED_FT,
  TidePoint,
  WindReading,
  assessLaunchWindow,
  fetchLiveConditions,
  formatCountdown,
  generateMockTideSeries,
  getCurrentTide,
  getDirection,
  getMockWind,
  getNextTurn,
} from './tideEngine';

const DURATIONS = [60, 90, 120];
const LIVE_REFRESH_MS = 10 * 60_000; // refresh NOAA every 10 minutes

const RowWindowLayout = () => {
  const [now, setNow] = useState<number>(Date.now());
  const [vesselId, setVesselId] = useState<VesselProfile['id']>('single');
  const [duration, setDuration] = useState<number>(90);

  // Live data state — seeded with mock so first paint is instant
  const [series, setSeries] = useState<TidePoint[]>(() => generateMockTideSeries(Date.now()));
  const [wind, setWind] = useState<WindReading>(() => getMockWind(Date.now()));
  const [source, setSource] = useState<'noaa' | 'mock'>('mock');
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Tick every 30s to keep countdowns fresh
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Live NOAA fetch — initial load + periodic refresh
  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const result = await fetchLiveConditions(Date.now(), ac.signal);
      if (cancelled) return;
      setSeries(result.series);
      setWind(result.wind);
      setSource(result.source);
      setFetchError(result.error ?? null);
      setFetchedAt(Date.now());
      setLoading(false);
    };
    load();
    const id = setInterval(load, LIVE_REFRESH_MS);
    return () => {
      cancelled = true;
      ac.abort();
      clearInterval(id);
    };
  }, []);

  const current = useMemo(() => getCurrentTide(series, now), [series, now]);
  const direction = useMemo(() => getDirection(series, now), [series, now]);
  const nextTurn = useMemo(() => getNextTurn(series, now), [series, now]);
  const vessel = VESSEL_PROFILES[vesselId];

  const assessment = useMemo(
    () => assessLaunchWindow(series, duration, vessel, wind, direction, now),
    [series, duration, vessel, wind, direction, now],
  );

  const chartData = useMemo(
    () => series.map((p) => ({ time: p.t, height: p.height, label: new Date(p.t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) })),
    [series],
  );

  const windowEndMs = now + duration * 60_000;

  const statusMeta = {
    green: { label: 'GO — Safe to Launch', dotClass: 'bg-emerald-400 shadow-[0_0_24px_hsl(150_80%_55%/0.7)]', textClass: 'text-emerald-300' },
    yellow: { label: 'CAUTION — Proceed with Care', dotClass: 'bg-amber-400 shadow-[0_0_24px_hsl(45_95%_55%/0.7)]', textClass: 'text-amber-300' },
    red: { label: 'STOP — Do Not Launch', dotClass: 'bg-rose-500 shadow-[0_0_24px_hsl(355_85%_55%/0.7)]', textClass: 'text-rose-300' },
  }[assessment.status];

  return (
    <div className="min-h-screen bg-[hsl(220_30%_6%)] text-slate-100">
      {/* Top bar */}
      <header className="border-b border-white/5 bg-[hsl(220_30%_8%)]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/labs" className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-slate-300" aria-label="Back to Labs">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-700/30 border border-cyan-400/20 flex items-center justify-center">
                <Waves className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight">RowWindow</h1>
                <p className="text-[11px] text-slate-400 -mt-0.5">BIAC · Redwood City · NOAA 9414523</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                source === 'noaa'
                  ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-400/30 bg-amber-500/10 text-amber-300'
              }`}
              title={
                source === 'noaa'
                  ? `Live NOAA data${fetchedAt ? ` · updated ${new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`
                  : fetchError
                    ? `NOAA unavailable — using mock model. ${fetchError}`
                    : 'Mock model'
              }
            >
              {loading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Radio className={`w-3 h-3 ${source === 'noaa' ? 'animate-pulse' : ''}`} />
              )}
              {source === 'noaa' ? 'LIVE · NOAA' : 'MOCK'}
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Local time</div>
              <div className="text-sm font-mono text-slate-200">{new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6 space-y-6">
        {/* Primary status — traffic light */}
        <section className="rounded-2xl border border-white/5 bg-[hsl(220_30%_9%)] p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className={`w-6 h-6 rounded-full ${assessment.status === 'red' ? statusMeta.dotClass : 'bg-rose-900/40'}`} />
                <div className={`w-6 h-6 rounded-full ${assessment.status === 'yellow' ? statusMeta.dotClass : 'bg-amber-900/40'}`} />
                <div className={`w-6 h-6 rounded-full ${assessment.status === 'green' ? statusMeta.dotClass : 'bg-emerald-900/40'}`} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Launch Status</div>
                <div className={`text-2xl md:text-3xl font-bold mt-1 ${statusMeta.textClass}`}>{statusMeta.label}</div>
                <div className="text-sm text-slate-400 mt-1">
                  {vessel.label} · {duration} min window
                </div>
              </div>
            </div>
            <div className="md:ml-auto grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <Stat icon={<Waves className="w-4 h-4" />} label="Tide" value={`${current.height.toFixed(2)} ft`} sub={direction} />
              <Stat
                icon={direction === 'Flood' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                label="Next turn"
                value={nextTurn ? formatCountdown(nextTurn.t - now) : '—'}
                sub={nextTurn ? `${nextTurn.type === 'high' ? 'High' : 'Low'} · ${nextTurn.height.toFixed(2)} ft` : 'Stable'}
              />
              <Stat icon={<Wind className="w-4 h-4" />} label="Wind" value={`${wind.speedKnots} kt`} sub={`from ${wind.directionLabel}`} />
            </div>
          </div>

          {assessment.reasons.length > 0 && (
            <ul className="mt-6 space-y-1.5 text-sm text-slate-300/90">
              {assessment.reasons.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-slate-500 mt-1">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Chop alert */}
        {assessment.chopAlert && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-amber-200">Chop Alert — Square Waves in Port Channel</div>
              <div className="text-sm text-amber-100/80 mt-0.5">
                Northwest wind ({wind.speedKnots} kt) opposing the ebbing tide. Expect short, steep waves on the Port side. Consider Starboard channel or shorten the row.
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Panel title="Vessel Profile" icon={<Sailboat className="w-4 h-4 text-cyan-300" />}>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(VESSEL_PROFILES).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVesselId(v.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border transition ${
                    vesselId === v.id
                      ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-100'
                      : 'border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10'
                  }`}
                >
                  <div>{v.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Wind warn &gt; {v.windWarnKnots} kt</div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Planned Duration" icon={<Clock className="w-4 h-4 text-cyan-300" />}>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border transition ${
                    duration === d
                      ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-100'
                      : 'border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Window range:{' '}
              <span className="font-mono text-slate-300">
                {assessment.minHeight.toFixed(2)}–{assessment.maxHeight.toFixed(2)} ft
              </span>
            </div>
          </Panel>
        </section>

        {/* Tide chart */}
        <section className="rounded-2xl border border-white/5 bg-[hsl(220_30%_9%)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4 text-cyan-300" />
              <h2 className="text-sm font-semibold tracking-tight">Tide Forecast (24h)</h2>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <LegendDot color="hsl(150 80% 55%)" label={`> ${TIDE_GREEN_FT} ft`} />
              <LegendDot color="hsl(45 95% 55%)" label={`${TIDE_RED_FT}–${TIDE_GREEN_FT} ft`} />
              <LegendDot color="hsl(355 85% 55%)" label={`< ${TIDE_RED_FT} ft`} />
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(195 90% 55%)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(195 90% 55%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(220 20% 18%)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: 'numeric' })}
                  stroke="hsl(220 15% 50%)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[-1, 8]}
                  stroke="hsl(220 15% 50%)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}ft`}
                />
                <Tooltip
                  contentStyle={{ background: 'hsl(220 30% 10%)', border: '1px solid hsl(220 20% 20%)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(v) => new Date(v as number).toLocaleString([], { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}
                  formatter={(value: number) => [`${value.toFixed(2)} ft`, 'Tide']}
                />
                <ReferenceArea y1={-2} y2={TIDE_RED_FT} fill="hsl(355 85% 50%)" fillOpacity={0.08} />
                <ReferenceArea y1={TIDE_RED_FT} y2={TIDE_GREEN_FT} fill="hsl(45 95% 55%)" fillOpacity={0.06} />
                <ReferenceLine y={TIDE_RED_FT} stroke="hsl(355 85% 55%)" strokeDasharray="4 4" />
                <ReferenceLine y={TIDE_GREEN_FT} stroke="hsl(150 80% 55%)" strokeDasharray="4 4" />
                <ReferenceLine x={now} stroke="hsl(195 90% 65%)" strokeWidth={2} label={{ value: 'Now', fill: 'hsl(195 90% 75%)', fontSize: 11, position: 'insideTopRight' }} />
                <ReferenceArea x1={now} x2={windowEndMs} fill="hsl(195 90% 55%)" fillOpacity={0.08} />
                <Area type="monotone" dataKey="height" stroke="hsl(195 90% 65%)" strokeWidth={2} fill="url(#tideFill)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            {source === 'noaa' ? (
              <>
                Live tide predictions from <a href={`https://tidesandcurrents.noaa.gov/stationhome.html?id=${'9414523'}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">NOAA CO-OPS Station 9414523</a> (Redwood City, MLLW datum) · 6-min interval
                {fetchedAt && <> · refreshed {new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>}
              </>
            ) : (
              <>
                NOAA feed unavailable — using mock 24h sinusoidal model.{fetchError ? ` (${fetchError})` : ''}
              </>
            )}
          </p>
        </section>
      </main>
    </div>
  );
};

const Stat = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) => (
  <div className="rounded-xl border border-white/5 bg-black/30 px-4 py-3">
    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
      {icon}
      {label}
    </div>
    <div className="text-xl font-semibold mt-1 text-slate-100">{value}</div>
    {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
  </div>
);

const Panel = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/5 bg-[hsl(220_30%_9%)] p-5">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
    </div>
    {children}
  </div>
);

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1.5">
    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
    {label}
  </div>
);

export default RowWindowLayout;
