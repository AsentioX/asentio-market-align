import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Waves, Wind, Sailboat, ArrowLeft, AlertTriangle, ArrowUp, ArrowDown, Clock, Anchor, Radio, RefreshCw,
  Activity, Compass, Navigation, Play, Pause, Square, MapPin, Timer, Route, TrendingUp, Gauge, Heart, Flame,
  Trash2, Download, ArrowLeftRight,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';
import {
  VESSEL_PROFILES,
  VesselProfile,
  TIDE_GREEN_FT,
  TIDE_RED_FT,
  TidePoint,
  TideTurn,
  WindReading,
  assessLaunchWindow,
  fetchLiveConditions,
  findTideTurns,
  formatCountdown,
  generateMockTideSeries,
  getCurrentTide,
  getDirection,
  getMockWind,
  getNextTurn,
} from './tideEngine';
import { useRowLocation } from './useRowLocation';
import { LocationPicker } from './LocationPicker';
import { useRowSensors, type SensorStatus, type TrackPoint } from './useRowSensors';

const DURATIONS = [60, 90, 120];
const LIVE_REFRESH_MS = 10 * 60_000; // refresh NOAA every 10 minutes

type TabId = 'pre' | 'on' | 'post';

const SESSIONS_STORAGE_KEY = 'rowwindow:sessions:v1';
const DASH = '—';

interface RowSession {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  // Nullable fields are null when no real sensor was connected for that metric.
  distanceMeters: number | null;
  avgSpm: number | null;
  maxSpm: number | null;
  avgPaceSecPer500: number | null;
  avgHeadingDeg: number | null;
  laneDeviationMax: number | null;
  caloriesKcal: number | null;
  avgHeartRate: number | null;
  startConditions: {
    tideFt: number;
    direction: string;
    windKnots: number;
    windDir: string;
  };
  spmSeries: { t: number; spm: number; pace: number }[];
  track: TrackPoint[];
  speedSeries: { t: number; speedMs: number; pace: number }[];
}

const RowWindowLayout = () => {
  const [now, setNow] = useState<number>(Date.now());
  const [vesselId, setVesselId] = useState<VesselProfile['id']>('single');
  const [duration, setDuration] = useState<number>(90);
  const [tab, setTab] = useState<TabId>('pre');

  // Location: picked, GPS, favorites
  const locationState = useRowLocation();
  const { location } = locationState;

  // Live data state — seeded with mock so first paint is instant
  const [series, setSeries] = useState<TidePoint[]>(() => generateMockTideSeries(Date.now()));
  const [wind, setWind] = useState<WindReading>(() => getMockWind(Date.now()));
  const [source, setSource] = useState<'noaa' | 'mock'>('mock');
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Session state (lives on the layout so tabs can read/write it)
  const [sessionState, setSessionState] = useState<'idle' | 'active' | 'paused'>('idle');
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [sessionEndedAt, setSessionEndedAt] = useState<number | null>(null);
  const [pausedMs, setPausedMs] = useState<number>(0);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [savedSessions, setSavedSessions] = useState<RowSession[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as RowSession[];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const lastSession = selectedSessionId
    ? savedSessions.find((s) => s.id === selectedSessionId) ?? null
    : savedSessions[0] ?? null;

  // Persist sessions whenever they change
  useEffect(() => {
    try { localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(savedSessions)); } catch {}
  }, [savedSessions]);

  const deleteSession = (id: string) => {
    setSavedSessions((prev) => prev.filter((s) => s.id !== id));
    if (selectedSessionId === id) setSelectedSessionId(null);
  };

  const exportSession = (s: RowSession) => {
    const blob = new Blob([sessionToGPX(s)], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rowwindow-${new Date(s.startedAt).toISOString().replace(/[:.]/g, '-')}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Live row metrics — null when no real sensor is connected (no mock data).
  const spmHistoryRef = useRef<{ t: number; spm: number; pace: number }[]>([]);
  const hrHistoryRef = useRef<{ t: number; bpm: number }[]>([]);
  const maxSpmRef = useRef<number>(0);
  const maxLaneOffsetRef = useRef<number>(0);

  // Real device sensors (compass, GPS, BLE heart-rate). Values are null when
  // the corresponding sensor is not live — the UI renders an em-dash.
  const sensors = useRowSensors({ tracking: sessionState === 'active' });
  const liveHeading: number | null = sensors.headingStatus === 'live' ? sensors.headingDeg : null;
  const liveDistance: number | null = sensors.positionStatus === 'live' ? sensors.distanceMeters : null;
  const liveSpeedMs: number | null = sensors.positionStatus === 'live' ? sensors.speedMs : null;
  const liveHeartRate: number | null = sensors.heartRateStatus === 'live' ? sensors.heartRate : null;
  // Stroke rate and lane offset have no native sensor wired up — show dash.
  const spm: number | null = null;
  const laneOffsetMeters: number | null = null;
  const targetHeadingDeg = 45;

  // Tick every second when on water tab so timers/instruments feel live
  useEffect(() => {
    const fastTab = tab === 'on' && sessionState === 'active';
    const id = setInterval(() => setNow(Date.now()), fastTab ? 1000 : 30_000);
    return () => clearInterval(id);
  }, [tab, sessionState]);

  // Live NOAA fetch — initial load + periodic refresh; refetch when station changes
  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const result = await fetchLiveConditions(Date.now(), ac.signal, {
        tideStationId: location.tideStationId,
        windStationId: location.windStationId,
      });
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
  }, [location.tideStationId, location.windStationId]);

  // Push real sensor samples into history while session is active (no mock data).
  useEffect(() => {
    if (sessionState !== 'active') return;
    const id = setInterval(() => {
      if (liveSpeedMs !== null) {
        const pace = liveSpeedMs > 0 ? 500 / liveSpeedMs : 0;
        spmHistoryRef.current.push({ t: Date.now(), spm: 0, pace: Math.round(pace) });
        if (spmHistoryRef.current.length > 600) spmHistoryRef.current.shift();
      }
      if (liveHeartRate !== null) {
        hrHistoryRef.current.push({ t: Date.now(), bpm: liveHeartRate });
        if (hrHistoryRef.current.length > 600) hrHistoryRef.current.shift();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [sessionState, liveSpeedMs, liveHeartRate]);

  const current = useMemo(() => getCurrentTide(series, now), [series, now]);
  const direction = useMemo(() => getDirection(series, now), [series, now]);
  const nextTurn = useMemo(() => getNextTurn(series, now), [series, now]);
  const nextLowTurn = useMemo(() => {
    const turns = findTideTurns(series);
    const future = turns.find((t) => t.type === 'low' && t.t > now);
    if (future) return future;
    const lows = turns.filter((t) => t.type === 'low');
    return lows[lows.length - 1] ?? null;
  }, [series, now]);
  const lowTideMarker = useMemo(() => {
    const turns = findTideTurns(series);
    const nextLow = turns.find((t) => t.type === 'low' && t.t > now) ?? null;
    const nextHigh = turns.find((t) => t.type === 'high' && t.t > now) ?? null;
    const lastLow = [...turns].reverse().find((t) => t.type === 'low' && t.t <= now) ?? null;
    if (nextLow && (!nextHigh || nextLow.t <= nextHigh.t)) {
      return { mode: 'to' as const, t: nextLow.t };
    }
    if (lastLow) {
      return { mode: 'since' as const, t: lastLow.t };
    }
    return nextLow ? { mode: 'to' as const, t: nextLow.t } : null;
  }, [series, now]);
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

  // Session derived metrics
  const elapsedMs = useMemo(() => {
    if (!sessionStartedAt) return 0;
    const end = sessionEndedAt ?? (sessionState === 'paused' && pausedAt ? pausedAt : now);
    return end - sessionStartedAt - pausedMs;
  }, [sessionStartedAt, sessionEndedAt, sessionState, pausedAt, pausedMs, now]);

  const startSession = () => {
    setSessionStartedAt(Date.now());
    setSessionEndedAt(null);
    setPausedMs(0);
    setPausedAt(null);
    // No mock seeding — sensor values come from real devices only.

    spmHistoryRef.current = [];
    hrHistoryRef.current = [];
    maxSpmRef.current = 0;
    maxLaneOffsetRef.current = 0;
    sensors.resetDistance();
    // Best-effort: trigger sensor permissions on the user-gesture that starts the row.
    sensors.requestPermissions();
    setSessionState('active');
  };

  const pauseResume = () => {
    if (sessionState === 'active') {
      setPausedAt(Date.now());
      setSessionState('paused');
    } else if (sessionState === 'paused' && pausedAt) {
      setPausedMs((p) => p + (Date.now() - pausedAt));
      setPausedAt(null);
      setSessionState('active');
    }
  };

  const endSession = () => {
    if (!sessionStartedAt) return;
    const endedAt = Date.now();
    const totalElapsed = endedAt - sessionStartedAt - pausedMs - (sessionState === 'paused' && pausedAt ? endedAt - pausedAt : 0);
    const paceHistory = spmHistoryRef.current.filter((h) => h.pace > 0);
    const hrHistory = hrHistoryRef.current;
    // Only compute averages from real samples; otherwise null (rendered as em-dash).
    const avgPace = paceHistory.length
      ? Math.round(paceHistory.reduce((s, h) => s + h.pace, 0) / paceHistory.length)
      : null;
    const avgHr = hrHistory.length
      ? Math.round(hrHistory.reduce((s, h) => s + h.bpm, 0) / hrHistory.length)
      : null;
    const distanceReal = sensors.positionStatus === 'live' ? Math.round(sensors.distanceMeters) : null;
    const headingReal = liveHeading !== null ? Math.round(liveHeading) : null;
    const newId = `row-${endedAt}-${Math.random().toString(36).slice(2, 8)}`;
    const summary: RowSession = {
      id: newId,
      startedAt: sessionStartedAt,
      endedAt,
      durationMs: totalElapsed,
      distanceMeters: distanceReal,
      // Stroke rate has no real sensor wired up — leave null instead of fabricating.
      avgSpm: null,
      maxSpm: null,
      avgPaceSecPer500: avgPace,
      avgHeadingDeg: headingReal,
      // Lane offset has no real sensor — null.
      laneDeviationMax: null,
      // Calories require HR or power; without a real signal, leave null.
      caloriesKcal: null,
      avgHeartRate: avgHr,
      startConditions: {
        tideFt: current.height,
        direction,
        windKnots: wind.speedKnots,
        windDir: wind.directionLabel,
      },
      spmSeries: [...spmHistoryRef.current],
      track: [...sensors.track],
      speedSeries: sensors.track
        .filter((p) => p.speedMs >= 0)
        .map((p) => ({ t: p.t, speedMs: p.speedMs, pace: p.speedMs > 0.2 ? Math.round(500 / p.speedMs) : 0 })),
    };
    setSavedSessions((prev) => [summary, ...prev]);
    setSelectedSessionId(newId);
    setSessionEndedAt(endedAt);
    setSessionState('idle');
    setSessionStartedAt(null);
    setPausedAt(null);
    setPausedMs(0);
    setTab('post');
  };

  const statusMeta = {
    green: { label: 'GO — Safe to Launch', dotClass: 'bg-emerald-400 shadow-[0_0_24px_hsl(150_80%_55%/0.7)]', textClass: 'text-emerald-700' },
    yellow: { label: 'CAUTION — Proceed with Care', dotClass: 'bg-amber-400 shadow-[0_0_24px_hsl(45_95%_55%/0.7)]', textClass: 'text-amber-700' },
    red: { label: 'STOP — Do Not Launch', dotClass: 'bg-rose-500 shadow-[0_0_24px_hsl(355_85%_55%/0.7)]', textClass: 'text-rose-700' },
  }[assessment.status];

  return (
    <div className="min-h-screen bg-[hsl(210_40%_97%)] text-slate-900 pb-24">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-[hsl(210_40%_99%)]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/labs" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-700" aria-label="Back to Labs">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-700/30 border border-cyan-400/20 flex items-center justify-center">
                <Waves className="w-5 h-5 text-cyan-700" />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight">RowWindow</h1>
                <p className="text-[11px] text-slate-600 -mt-0.5 truncate max-w-[180px] sm:max-w-none">{location.name} · NOAA {location.tideStationId}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                source === 'noaa'
                  ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-700'
                  : 'border-amber-400/30 bg-amber-500/10 text-amber-700'
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
              <div className="text-xs text-slate-600">Local time</div>
              <div className="text-sm font-mono text-slate-800">{new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6 space-y-6">
        {tab === 'pre' && (
          <PreRowView
            assessment={assessment}
            statusMeta={statusMeta}
            vessel={vessel}
            duration={duration}
            current={current}
            direction={direction}
            nextTurn={nextTurn}
            nextLowTurn={nextLowTurn}
            now={now}
            wind={wind}
            vesselId={vesselId}
            setVesselId={setVesselId}
            setDuration={setDuration}
            chartData={chartData}
            windowEndMs={windowEndMs}
            source={source}
            fetchedAt={fetchedAt}
            fetchError={fetchError}
            locationState={locationState}
            onLaunch={() => {
              startSession();
              setTab('on');
            }}
          />
        )}

        {tab === 'on' && (
          <OnWaterView
            sessionState={sessionState}
            elapsedMs={elapsedMs}
            distanceMeters={liveDistance}
            spm={spm}
            headingDeg={liveHeading}
            targetHeadingDeg={targetHeadingDeg}
            laneOffsetMeters={laneOffsetMeters}
            heartRate={liveHeartRate}
            wind={wind}
            tide={current}
            direction={direction}
            nextLowTurn={nextLowTurn}
            lowTideMarker={lowTideMarker}
            now={now}
            onStart={startSession}
            onPauseResume={pauseResume}
            onEnd={endSession}
            sensors={sensors}
          />
        )}

        {tab === 'post' && (
          <PostRowView
            session={lastSession}
            sessions={savedSessions}
            selectedSessionId={lastSession?.id ?? null}
            onSelectSession={setSelectedSessionId}
            onDeleteSession={deleteSession}
            onExportSession={exportSession}
            onNewRow={() => setTab('pre')}
          />
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 bg-[hsl(210_40%_99%)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-6xl mx-auto grid grid-cols-3">
          <TabButton
            active={tab === 'pre'}
            onClick={() => setTab('pre')}
            icon={<Waves className="w-5 h-5" />}
            label="Pre-Row"
            sub="Conditions"
          />
          <TabButton
            active={tab === 'on'}
            onClick={() => setTab('on')}
            icon={<Activity className="w-5 h-5" />}
            label="On Water"
            sub={sessionState === 'active' ? 'LIVE' : sessionState === 'paused' ? 'Paused' : 'Instruments'}
            pulse={sessionState === 'active'}
          />
          <TabButton
            active={tab === 'post'}
            onClick={() => setTab('post')}
            icon={<TrendingUp className="w-5 h-5" />}
            label="Post-Row"
            sub={lastSession ? 'Last session' : 'No data'}
          />
        </div>
      </nav>
    </div>
  );
};

// ============================================================
// PRE-ROW: existing conditions screen (unchanged content)
// ============================================================

interface PreRowViewProps {
  assessment: ReturnType<typeof assessLaunchWindow>;
  statusMeta: { label: string; dotClass: string; textClass: string };
  vessel: VesselProfile;
  duration: number;
  current: TidePoint;
  direction: 'Flood' | 'Ebb' | 'Slack';
  nextTurn: ReturnType<typeof getNextTurn>;
  nextLowTurn: TideTurn | null;
  now: number;
  wind: WindReading;
  vesselId: VesselProfile['id'];
  setVesselId: (id: VesselProfile['id']) => void;
  setDuration: (d: number) => void;
  chartData: { time: number; height: number; label: string }[];
  windowEndMs: number;
  source: 'noaa' | 'mock';
  fetchedAt: number | null;
  fetchError: string | null;
  locationState: ReturnType<typeof useRowLocation>;
  onLaunch: () => void;
}

const PreRowView = ({
  assessment, statusMeta, vessel, duration, current, direction, nextTurn, nextLowTurn, now, wind,
  vesselId, setVesselId, setDuration, chartData, windowEndMs, source, fetchedAt, fetchError, locationState, onLaunch,
}: PreRowViewProps) => (
  <>
    {/* Location picker */}
    <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-semibold">Rowing Location</div>
        {locationState.favorites.length > 0 && (
          <div className="text-[10px] text-amber-700/80">{locationState.favorites.length} saved</div>
        )}
      </div>
      <LocationPicker
        location={locationState.location}
        favorites={locationState.favorites}
        nearby={locationState.nearby}
        isFavorite={locationState.isFavorite}
        gpsStatus={locationState.gpsStatus}
        gpsError={locationState.gpsError}
        onSelect={locationState.selectLocation}
        onToggleFavorite={locationState.toggleFavorite}
        onUseGPS={locationState.useGPS}
      />
    </section>

    {/* Primary status — traffic light */}
    <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-100 border border-slate-200">
            <div className={`w-6 h-6 rounded-full ${assessment.status === 'red' ? statusMeta.dotClass : 'bg-rose-900/40'}`} />
            <div className={`w-6 h-6 rounded-full ${assessment.status === 'yellow' ? statusMeta.dotClass : 'bg-amber-900/40'}`} />
            <div className={`w-6 h-6 rounded-full ${assessment.status === 'green' ? statusMeta.dotClass : 'bg-emerald-900/40'}`} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-600">Launch Status</div>
            <div className={`text-2xl md:text-3xl font-bold mt-1 ${statusMeta.textClass}`}>{statusMeta.label}</div>
            <div className="text-sm text-slate-600 mt-1">
              {vessel.label} · {duration} min window
            </div>
          </div>
        </div>
        <div className="md:ml-auto flex flex-col sm:flex-row sm:items-stretch sm:divide-x sm:divide-slate-200 divide-y sm:divide-y-0 divide-slate-200 w-full md:w-auto">
          <div className="px-4 py-2 sm:py-1 sm:first:pl-0">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-600">
              <Waves className="w-4 h-4" />
              Tide
            </div>
            <div className="mt-1 grid grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Current</div>
                <div className="text-xl font-semibold text-slate-900 flex items-center gap-1.5 leading-tight">
                  {current.height.toFixed(2)} ft
                  {direction === 'Flood' && <ArrowUp className="w-4 h-4 text-emerald-500" aria-label="Rising" />}
                  {direction === 'Ebb' && <ArrowDown className="w-4 h-4 text-amber-500" aria-label="Falling" />}
                </div>
                <div className={`text-[11px] mt-0.5 ${
                  direction === 'Flood' ? 'text-emerald-700'
                  : direction === 'Ebb' ? 'text-amber-700'
                  : 'text-slate-600'
                }`}>
                  {direction === 'Flood' ? 'Rising' : direction === 'Ebb' ? 'Falling' : 'Slack'}
                </div>
              </div>
              {nextLowTurn && (
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Low tide</div>
                  <div className="text-xl font-semibold font-mono text-slate-900 leading-tight">
                    {new Date(nextLowTurn.t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    in {Math.max(0, Math.round((nextLowTurn.t - now) / 60_000))} min
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="px-4 py-2 sm:py-1">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-600">
              <Wind className="w-4 h-4" />
              Wind
            </div>
            <div className="text-xl font-semibold mt-1 text-slate-900 leading-tight">{wind.speedKnots} kt</div>
            <div className="text-[11px] text-slate-600 mt-0.5">from {wind.directionLabel}</div>
          </div>
        </div>
      </div>
    </section>

    {/* Chop alert */}
    {assessment.chopAlert && (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold text-amber-800">Chop Alert — Square Waves in Port Channel</div>
          <div className="text-sm text-amber-800/80 mt-0.5">
            Northwest wind ({wind.speedKnots} kt) opposing the ebbing tide. Expect short, steep waves on the Port side. Consider Starboard channel or shorten the row.
          </div>
        </div>
      </div>
    )}

    {/* Controls */}
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Panel title="Vessel Profile" icon={<Sailboat className="w-4 h-4 text-cyan-700" />}>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(VESSEL_PROFILES).map((v) => (
            <button
              key={v.id}
              onClick={() => setVesselId(v.id)}
              className={`px-4 py-3 rounded-lg text-sm font-medium border transition ${
                vesselId === v.id
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-800'
                  : 'border-slate-200 bg-white/[0.02] text-slate-700 hover:border-slate-300'
              }`}
            >
              <div>{v.label}</div>
              <div className="text-[11px] text-slate-600 mt-0.5">Wind warn &gt; {v.windWarnKnots} kt</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Planned Duration" icon={<Clock className="w-4 h-4 text-cyan-700" />}>
        <div className="grid grid-cols-3 gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-4 py-3 rounded-lg text-sm font-medium border transition ${
                duration === d
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-800'
                  : 'border-slate-200 bg-white/[0.02] text-slate-700 hover:border-slate-300'
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-600">
          Window range:{' '}
          <span className="font-mono text-slate-700">
            {assessment.minHeight.toFixed(2)}–{assessment.maxHeight.toFixed(2)} ft
          </span>
        </div>
      </Panel>
    </section>

    {/* Tide chart */}
    <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-cyan-700" />
          <h2 className="text-sm font-semibold tracking-tight">Tide Forecast (24h)</h2>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
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
            <CartesianGrid stroke="hsl(220 15% 80%)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: 'numeric' })}
              stroke="hsl(220 15% 35%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[-1, 8]}
              stroke="hsl(220 15% 35%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}ft`}
            />
            <Tooltip
              contentStyle={{ background: 'hsl(0 0% 100%)', border: '1px solid hsl(220 15% 80%)', borderRadius: 8, fontSize: 12 }}
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
            Live tide predictions from <a href={`https://tidesandcurrents.noaa.gov/stationhome.html?id=${locationState.location.tideStationId}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">NOAA CO-OPS Station {locationState.location.tideStationId}</a> ({locationState.location.name}, MLLW datum) · 6-min interval
            {fetchedAt && <> · refreshed {new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>}
          </>
        ) : (
          <>
            NOAA feed unavailable — using mock 24h sinusoidal model.{fetchError ? ` (${fetchError})` : ''}
          </>
        )}
      </p>
    </section>
  </>
);

// ============================================================
// SENSORS: real device status + connect actions
// ============================================================

const statusDot = (s: SensorStatus) => {
  if (s === 'live') return 'bg-emerald-400';
  if (s === 'requesting') return 'bg-amber-400 animate-pulse';
  if (s === 'denied' || s === 'error') return 'bg-rose-400';
  if (s === 'unavailable') return 'bg-slate-600';
  return 'bg-slate-500';
};
const statusLabel = (s: SensorStatus, fallback = 'Idle') => {
  if (s === 'live') return 'Live';
  if (s === 'requesting') return 'Connecting…';
  if (s === 'denied') return 'Denied';
  if (s === 'unavailable') return 'Unsupported';
  if (s === 'error') return 'Error';
  return fallback;
};

const SensorsPanel = ({ sensors }: { sensors: ReturnType<typeof useRowSensors> }) => {
  const showCompassBtn = sensors.headingStatus !== 'live' && sensors.headingStatus !== 'unavailable';
  const showPosBtn = sensors.positionStatus !== 'live' && sensors.positionStatus !== 'unavailable';
  const showHrBtn = sensors.heartRateStatus !== 'live';
  return (
    <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-600">Sensors</div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="inline-flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusDot(sensors.headingStatus)}`} />
            <Compass className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-700">Compass</span>
            <span className="text-slate-500">{statusLabel(sensors.headingStatus)}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusDot(sensors.positionStatus)}`} />
            <MapPin className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-700">GPS</span>
            <span className="text-slate-500">
              {statusLabel(sensors.positionStatus)}
              {sensors.positionStatus === 'live' && sensors.positionAccuracy
                ? ` · ±${Math.round(sensors.positionAccuracy)}m`
                : ''}
            </span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusDot(sensors.heartRateStatus)}`} />
            <Heart className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-700">Heart rate</span>
            <span className="text-slate-500">
              {sensors.heartRateStatus === 'live' && sensors.heartRateDeviceName
                ? sensors.heartRateDeviceName
                : statusLabel(sensors.heartRateStatus, 'Not connected')}
            </span>
          </div>
        </div>
      </div>
      {(showCompassBtn || showPosBtn || showHrBtn) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {showCompassBtn && (
            <button
              onClick={sensors.requestCompass}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs inline-flex items-center gap-1.5 transition"
            >
              <Compass className="w-3.5 h-3.5" /> Enable compass
            </button>
          )}
          {showPosBtn && (
            <button
              onClick={sensors.requestPosition}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs inline-flex items-center gap-1.5 transition"
            >
              <MapPin className="w-3.5 h-3.5" /> Enable GPS
            </button>
          )}
          {showHrBtn && (
            <button
              onClick={sensors.connectHeartRate}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 border border-rose-500/30 text-xs inline-flex items-center gap-1.5 transition"
            >
              <Heart className="w-3.5 h-3.5" /> Pair heart-rate monitor
            </button>
          )}
          {sensors.heartRateStatus === 'live' && (
            <button
              onClick={sensors.disconnectHeartRate}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs inline-flex items-center gap-1.5 transition"
            >
              Disconnect HR
            </button>
          )}
        </div>
      )}
      <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
        Compass &amp; GPS need device permission (iOS asks on tap). Heart rate uses Web Bluetooth and works on Chrome/Edge with most BLE chest straps and watches. When a sensor is unavailable, the instrument falls back to a simulated reading so the demo still works.
      </p>
    </section>
  );
};

// ============================================================
// ON WATER: live instrument panel
// ============================================================


interface OnWaterViewProps {
  sessionState: 'idle' | 'active' | 'paused';
  elapsedMs: number;
  distanceMeters: number | null;
  spm: number | null;
  headingDeg: number | null;
  targetHeadingDeg: number;
  laneOffsetMeters: number | null;
  heartRate: number | null;
  wind: WindReading;
  tide: TidePoint;
  direction: 'Flood' | 'Ebb' | 'Slack';
  nextLowTurn: TideTurn | null;
  lowTideMarker: { mode: 'to' | 'since'; t: number } | null;
  now: number;
  onStart: () => void;
  onPauseResume: () => void;
  onEnd: () => void;
  sensors: ReturnType<typeof useRowSensors>;
}

const OnWaterView = ({
  sessionState, elapsedMs, distanceMeters, spm, headingDeg, targetHeadingDeg,
  laneOffsetMeters, heartRate, wind, tide, direction, nextLowTurn, lowTideMarker, now,
  onStart, onPauseResume, onEnd,
  sensors,
}: OnWaterViewProps) => {
  const headingError = headingDeg !== null ? ((headingDeg - targetHeadingDeg + 540) % 360) - 180 : 0;
  const speedMs = spm !== null ? (spm / 26) * 4.2 : 0;
  const pacePer500 = speedMs > 0 ? 500 / speedMs : 0;
  const paceLabel = pacePer500 ? `${Math.floor(pacePer500 / 60)}:${String(Math.round(pacePer500 % 60)).padStart(2, '0')}` : DASH;

  const laneAbs = laneOffsetMeters !== null ? Math.abs(laneOffsetMeters) : 0;
  const laneStatus: 'good' | 'warn' | 'alert' = laneAbs < 1.5 ? 'good' : laneAbs < 3 ? 'warn' : 'alert';
  const laneColor = laneStatus === 'good' ? 'text-emerald-700' : laneStatus === 'warn' ? 'text-amber-700' : 'text-rose-700';
  const laneRingColor = laneStatus === 'good' ? 'hsl(150 80% 55%)' : laneStatus === 'warn' ? 'hsl(45 95% 55%)' : 'hsl(355 85% 55%)';

  if (sessionState === 'idle') {
    return (
      <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-cyan-700" />
        </div>
        <h2 className="text-xl font-semibold">On-Water Instruments</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Start a session to track strokes per minute, heading, lane position, pace, and heart rate while you row.
        </p>
        <button
          onClick={onStart}
          className="mt-6 px-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-800 border border-cyan-400/40 font-semibold text-sm inline-flex items-center gap-2 transition"
        >
          <Play className="w-4 h-4" /> Start Row
        </button>
      </section>
    );
  }

  return (
    <>
      {/* Primary metrics row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-0">
        <BigStat
          icon={<Timer className="w-4 h-4" />}
          label="Elapsed"
          value={formatElapsed(elapsedMs)}
          accent="text-cyan-800"
          mono
        />
        <BigStat
          icon={<Route className="w-4 h-4" />}
          label="Distance"
          value={distanceMeters !== null ? `${(distanceMeters / 1000).toFixed(2)} km` : DASH}
          sub={distanceMeters !== null ? `${Math.round(distanceMeters)} m` : 'GPS not connected'}
          accent="text-cyan-800"
        />
        <BigStat
          icon={<Activity className="w-4 h-4" />}
          label="Stroke Rate"
          value={spm !== null ? `${Math.round(spm)}` : DASH}
          sub="strokes / min"
          accent="text-cyan-800"
          pulse={sessionState === 'active' && spm !== null}
        />
        <BigStat
          icon={<Gauge className="w-4 h-4" />}
          label="Pace"
          value={paceLabel}
          sub="/ 500 m"
          accent="text-cyan-800"
          mono
        />
      </section>

      {/* Heading + Lane keeping */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
        {/* Compass */}
        <Panel title="Heading" icon={<Compass className="w-4 h-4 text-cyan-700" />}>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="46" fill="hsl(210 40% 97%)" stroke="hsl(220 15% 80%)" strokeWidth="2" />
                {/* Cardinal markers */}
                {['N', 'E', 'S', 'W'].map((c, i) => {
                  const angle = (i * 90 - 90) * (Math.PI / 180);
                  const x = 50 + Math.cos(angle) * 38;
                  const y = 50 + Math.sin(angle) * 38;
                  return (
                    <text key={c} x={x} y={y + 3} textAnchor="middle" fontSize="8" fill="hsl(220 15% 30%)" fontFamily="ui-sans-serif">
                      {c}
                    </text>
                  );
                })}
                {/* Target heading marker */}
                <line
                  x1="50" y1="50"
                  x2={50 + Math.cos((targetHeadingDeg - 90) * (Math.PI / 180)) * 30}
                  y2={50 + Math.sin((targetHeadingDeg - 90) * (Math.PI / 180)) * 30}
                  stroke="hsl(150 80% 55%)" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7"
                />
                {/* Boat — rotated to current heading. Port half = red, starboard half = green
                    (standard nautical nav-light convention). */}
                <g transform={`rotate(${headingDeg ?? 0} 50 50)`} opacity={headingDeg !== null ? 1 : 0.25}>
                  {/* Port (left) half */}
                  <path d="M 50 22 Q 42 30 42 56 L 50 64 Z" fill="hsl(355 85% 58%)" stroke="hsl(355 90% 35%)" strokeWidth="0.5" />
                  {/* Starboard (right) half */}
                  <path d="M 50 22 Q 58 30 58 56 L 50 64 Z" fill="hsl(150 80% 50%)" stroke="hsl(150 85% 28%)" strokeWidth="0.5" />
                  {/* Centerline keel */}
                  <line x1="50" y1="22" x2="50" y2="64" stroke="hsl(210 40% 97%)" strokeWidth="0.6" />
                  {/* Bow tick */}
                  <circle cx="50" cy="20" r="1.6" fill="hsl(60 100% 75%)" />
                </g>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold font-mono text-cyan-800">
                {headingDeg !== null ? `${Math.round(headingDeg)}°` : DASH}
              </div>
              <div className="text-xs text-slate-600 mt-1">Target {targetHeadingDeg}° ({degLabel(targetHeadingDeg)})</div>
              <div className={`text-xs mt-2 font-medium ${
                headingDeg === null ? 'text-slate-500'
                : Math.abs(headingError) < 5 ? 'text-emerald-700'
                : Math.abs(headingError) < 12 ? 'text-amber-700'
                : 'text-rose-700'
              }`}>
                {headingDeg === null
                  ? 'Compass not connected'
                  : headingError === 0
                  ? 'On line'
                  : `${Math.abs(Math.round(headingError))}° ${headingError > 0 ? 'right of line' : 'left of line'}`}
              </div>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-600">
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-500" /> Port</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" /> Stbd</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Lane keeping */}
        <Panel title="Lane Position" icon={<Navigation className="w-4 h-4 text-cyan-700" />}>
          <LanePositionWidget
            laneOffsetMeters={laneOffsetMeters}
            laneColor={laneColor}
            laneRingColor={laneRingColor}
            laneStatus={laneStatus}
          />
        </Panel>
      </section>

      {/* Heart rate + environment */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-0">
        <BigStat
          icon={<Heart className="w-4 h-4" />}
          label="Heart Rate"
          value={heartRate !== null ? `${heartRate}` : DASH}
          sub={heartRate !== null ? 'bpm' : 'Not connected'}
          accent="text-rose-700"
          pulse={sessionState === 'active' && heartRate !== null}
        />
        <BigStat
          icon={<Wind className="w-4 h-4" />}
          label="Wind"
          value={`${wind.speedKnots} kt`}
          sub={`from ${wind.directionLabel}`}
          accent="text-slate-800"
        />
        <div className="col-span-2 px-1 py-3 border-b border-slate-200">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-slate-600">
            <Waves className="w-4 h-4" />
            Tide
          </div>
          <div className="mt-1 flex items-start justify-between gap-3">
            <div>
              <div className="text-4xl md:text-5xl font-bold leading-none text-slate-900 flex items-center gap-2">
                {tide.height.toFixed(1)} ft
                {direction === 'Flood' && <ArrowUp className="w-6 h-6 text-emerald-600" aria-label="Rising" />}
                {direction === 'Ebb' && <ArrowDown className="w-6 h-6 text-amber-600" aria-label="Falling" />}
              </div>
              <div className={`text-[11px] mt-1.5 ${
                direction === 'Flood' ? 'text-emerald-700'
                : direction === 'Ebb' ? 'text-amber-700'
                : 'text-slate-600'
              }`}>
                {direction === 'Flood' ? 'Rising (Flood)' : direction === 'Ebb' ? 'Falling (Ebb)' : 'Slack'}
              </div>
            </div>
            {lowTideMarker && (
              <div className="text-right">
                <div className="text-4xl md:text-5xl font-bold leading-none text-slate-900">
                  {Math.max(0, Math.round(Math.abs(lowTideMarker.t - now) / 60_000))} min
                </div>
                <div className="text-[11px] text-slate-600 mt-1.5 font-mono">
                  {lowTideMarker.mode === 'to' ? 'to low @ ' : 'since low @ '}
                  {new Date(lowTideMarker.t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sensors */}
      <SensorsPanel sensors={sensors} />

      {/* Session controls */}
      <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className={`text-xs uppercase tracking-[0.2em] ${sessionState === 'active' ? 'text-emerald-700' : 'text-amber-700'}`}>
              {sessionState === 'active' ? '● Recording' : '|| Paused'}
            </div>
            <div className="text-sm text-slate-600 mt-1">Session controls</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onPauseResume}
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium text-sm inline-flex items-center gap-2 transition"
            >
              {sessionState === 'active' ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
            </button>
            <button
              onClick={onEnd}
              className="px-4 py-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 border border-rose-500/30 font-medium text-sm inline-flex items-center gap-2 transition"
            >
              <Square className="w-4 h-4" /> End Row
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

// ============================================================
// LANE POSITION WIDGET — channel offset visual with bow/stern swap.
// Rowers sit facing the stern, so the user can flip the perspective so the
// boat marker reads as either Bow-up or Stern-up. Flipping mirrors the boat
// marker AND the port/starboard labels (since those swap when you turn around).
// ============================================================

interface LanePositionWidgetProps {
  laneOffsetMeters: number | null;
  laneColor: string;
  laneRingColor: string;
  laneStatus: 'good' | 'warn' | 'alert';
}

const LanePositionWidget = ({ laneOffsetMeters, laneColor, laneRingColor, laneStatus }: LanePositionWidgetProps) => {
  const [bowUp, setBowUp] = useState<boolean>(true);
  const hasData = laneOffsetMeters !== null;
  const offset = laneOffsetMeters ?? 0;

  // When facing stern-up (rower's POV), port and starboard swap sides on screen.
  const displayOffset = bowUp ? offset : -offset;
  const portLabel = bowUp ? 'Port (left)' : 'Port (right)';
  const starboardLabel = bowUp ? 'Starboard (right)' : 'Starboard (left)';
  const sideLabel = !hasData
    ? 'No GPS lane data'
    : offset > 0.3 ? portLabel
    : offset < -0.3 ? starboardLabel
    : 'Centered';
  const leftBankLabel = bowUp ? 'Port bank' : 'Starboard bank';
  const rightBankLabel = bowUp ? 'Starboard bank' : 'Port bank';

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className={`text-4xl md:text-5xl font-bold font-mono leading-none ${hasData ? laneColor : 'text-slate-400'}`}>
          {hasData ? `${offset >= 0 ? '+' : ''}${offset.toFixed(1)} m` : '—'}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-700 font-medium">{sideLabel}</div>
          <button
            onClick={() => setBowUp((v) => !v)}
            className="px-2 py-1 rounded-md bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-800 text-[10px] font-semibold inline-flex items-center gap-1 transition"
            title="Swap Bow / Stern perspective"
          >
            <ArrowLeftRight className="w-3 h-3" />
            {bowUp ? 'Bow ↑' : 'Stern ↑'}
          </button>
        </div>
      </div>
      {/* Channel visualization — banks on the sides, water in the middle */}
      <div className="relative h-14 rounded-lg bg-sky-50 border border-sky-200 overflow-hidden">
        {/* Left bank */}
        <div className="absolute inset-y-0 left-0 w-[10%] bg-emerald-200 border-r border-emerald-400" />
        {/* Right bank */}
        <div className="absolute inset-y-0 right-0 w-[10%] bg-emerald-200 border-l border-emerald-400" />
        {/* Centerline */}
        <div className="absolute inset-y-2 left-1/2 w-px bg-sky-400/60" style={{ borderLeft: '1px dashed hsl(200 80% 45%)' }} />
        {/* Boat marker — only when GPS lane data is available */}
        {hasData && (
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 flex flex-col items-center"
            style={{
              left: `calc(50% + ${Math.max(-40, Math.min(40, displayOffset * 8))}% - 6px)`,
            }}
          >
            {bowUp && (
              <div
                className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent"
                style={{ borderBottomColor: laneRingColor }}
              />
            )}
            <div
              className="w-3 h-7 rounded-sm"
              style={{ background: laneRingColor, boxShadow: `0 0 10px ${laneRingColor}` }}
            />
            {!bowUp && (
              <div
                className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent"
                style={{ borderTopColor: laneRingColor }}
              />
            )}
          </div>
        )}
        <div className="absolute top-1 left-2 text-[9px] font-semibold text-emerald-800 uppercase tracking-wider">{leftBankLabel}</div>
        <div className="absolute top-1 right-2 text-[9px] font-semibold text-emerald-800 uppercase tracking-wider">{rightBankLabel}</div>
      </div>
      <div className={`text-xs ${hasData ? laneColor : 'text-slate-500'}`}>
        {!hasData && '—'}
        {hasData && laneStatus === 'good' && '✓ Holding the channel center line'}
        {hasData && laneStatus === 'warn' && '⚠ Drifting — correct your steering'}
        {hasData && laneStatus === 'alert' && '⚠ Off line — risk of channel edge'}
      </div>
    </div>
  );
};

// ============================================================
// POST-ROW: session summary
// ============================================================

interface PostRowViewProps {
  session: RowSession | null;
  sessions: RowSession[];
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onExportSession: (s: RowSession) => void;
  onNewRow: () => void;
}

const PostRowView = ({ session, sessions, selectedSessionId, onSelectSession, onDeleteSession, onExportSession, onNewRow }: PostRowViewProps) => {
  if (!session) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-500/15 border border-slate-400/20 flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-xl font-semibold">No session yet</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Complete a row from the On Water tab and your summary will appear here.
        </p>
        <button
          onClick={onNewRow}
          className="mt-6 px-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-800 border border-cyan-400/40 font-semibold text-sm inline-flex items-center gap-2 transition"
        >
          Check Conditions →
        </button>
      </section>
    );
  }

  const paceLabel = session.avgPaceSecPer500
    ? `${Math.floor(session.avgPaceSecPer500 / 60)}:${String(session.avgPaceSecPer500 % 60).padStart(2, '0')}`
    : DASH;
  const distanceKmLabel = session.distanceMeters !== null
    ? `${(session.distanceMeters / 1000).toFixed(2)} km`
    : `${DASH} km`;
  const distanceMetersLabel = session.distanceMeters !== null ? `${session.distanceMeters} m` : 'GPS not connected';
  const startedDate = new Date(session.startedAt);
  const endedDate = new Date(session.endedAt);
  const spmChartData = session.spmSeries.map((p, i) => ({ idx: i, spm: p.spm, pace: p.pace }));
  const speedChartData = session.speedSeries.map((p, i) => ({
    idx: i,
    speedKmh: Math.round(p.speedMs * 3.6 * 10) / 10,
    pace: p.pace,
  }));
  const hasTrack = session.track.length >= 2;

  return (
    <>
      {/* Summary headline */}
      <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-[hsl(220_30%_9%)] to-[hsl(220_30%_9%)] p-6 md:p-8">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Row Complete</div>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              {distanceKmLabel} · {formatElapsed(session.durationMs)}
            </h2>
            <div className="text-sm text-slate-600 mt-1">
              {startedDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} ·{' '}
              {startedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} →{' '}
              {endedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onExportSession(session)}
              className="px-3 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-800 text-xs font-medium inline-flex items-center gap-1.5 transition"
              title="Export as GPX"
            >
              <Download className="w-3.5 h-3.5" /> GPX
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this saved row?')) onDeleteSession(session.id);
              }}
              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 text-rose-700 transition"
              title="Delete this session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={<Timer className="w-4 h-4" />} label="Elapsed time" value={formatElapsed(session.durationMs)} />
          <Stat icon={<Route className="w-4 h-4" />} label="Distance" value={distanceKmLabel} sub={distanceMetersLabel} />
          <Stat icon={<Gauge className="w-4 h-4" />} label="Avg pace" value={paceLabel} sub={session.avgPaceSecPer500 ? '/ 500 m' : 'GPS not connected'} />
          <Stat icon={<Activity className="w-4 h-4" />} label="Avg stroke rate" value={session.avgSpm !== null ? `${session.avgSpm}` : DASH} sub={session.maxSpm !== null ? `peak ${session.maxSpm} spm` : 'No stroke sensor'} />
        </div>
      </section>

      {/* Saved sessions list */}
      {sessions.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold tracking-tight">Saved Rows</h2>
            <span className="text-[11px] text-slate-500 ml-auto">{sessions.length} total</span>
          </div>
          <div className="divide-y divide-slate-200">
            {sessions.map((s) => {
              const isActive = s.id === selectedSessionId;
              const d = new Date(s.startedAt);
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg transition ${
                    isActive ? 'bg-cyan-500/10' : 'hover:bg-slate-100'
                  }`}
                >
                  <button
                    onClick={() => onSelectSession(s.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {s.distanceMeters !== null ? `${(s.distanceMeters / 1000).toFixed(2)} km` : `${DASH} km`} · {formatElapsed(s.durationMs)}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ·{' '}
                      {d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} ·{' '}
                      avg {s.avgSpm !== null ? `${s.avgSpm} spm` : `${DASH} spm`}
                    </div>
                  </button>
                  <button
                    onClick={() => onExportSession(s)}
                    className="p-1.5 rounded-md text-slate-600 hover:text-cyan-700 hover:bg-cyan-500/10 transition"
                    title="Export GPX"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this saved row?')) onDeleteSession(s.id);
                    }}
                    className="p-1.5 rounded-md text-slate-600 hover:text-rose-700 hover:bg-rose-500/10 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Stroke rate chart */}
      {spmChartData.length > 5 && (
        <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold tracking-tight">Stroke Rate Over Time</h2>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <LineChart data={spmChartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spmFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(195 90% 55%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(195 90% 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(220 15% 80%)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="idx" stroke="hsl(220 15% 35%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[15, 35]} stroke="hsl(220 15% 35%)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(0 0% 100%)', border: '1px solid hsl(220 15% 80%)', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => [`${value} spm`, 'Stroke rate']}
                  labelFormatter={(idx) => `${idx}s`}
                />
                <Line type="monotone" dataKey="spm" stroke="hsl(195 90% 65%)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* GPS course map */}
      {hasTrack && (
        <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold tracking-tight">Course on Map</h2>
            <span className="text-[11px] text-slate-500 ml-auto">{session.track.length} GPS fixes</span>
          </div>
          <CourseMap track={session.track} />
        </section>
      )}

      {/* Boat speed / pace chart */}
      {speedChartData.length > 5 && (
        <section className="rounded-2xl border border-slate-200 bg-[hsl(0_0%_100%)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-4 h-4 text-cyan-700" />
            <h2 className="text-sm font-semibold tracking-tight">Boat Speed & Pace</h2>
            <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-600">
              <LegendDot color="hsl(195 90% 65%)" label="Speed (km/h)" />
              <LegendDot color="hsl(280 80% 70%)" label="Pace (s/500m)" />
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <LineChart data={speedChartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="hsl(220 15% 80%)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="idx" stroke="hsl(220 15% 35%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="speed" stroke="hsl(195 90% 65%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="pace" orientation="right" stroke="hsl(280 80% 70%)" fontSize={11} tickLine={false} axisLine={false} reversed />
                <Tooltip
                  contentStyle={{ background: 'hsl(0 0% 100%)', border: '1px solid hsl(220 15% 80%)', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number, name: string) => {
                    if (name === 'speedKmh') return [`${value} km/h`, 'Speed'];
                    if (name === 'pace') {
                      const m = Math.floor(value / 60);
                      const s = value % 60;
                      return [`${m}:${String(s).padStart(2, '0')} /500m`, 'Pace'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(idx) => `Fix ${idx}`}
                />
                <Line yAxisId="speed" type="monotone" dataKey="speedKmh" stroke="hsl(195 90% 65%)" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="pace" type="monotone" dataKey="pace" stroke="hsl(280 80% 70%)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Performance + conditions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Performance" icon={<Flame className="w-4 h-4 text-cyan-700" />}>
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={<Heart className="w-4 h-4" />} label="Avg heart rate" value={session.avgHeartRate !== null ? `${session.avgHeartRate} bpm` : DASH} sub={session.avgHeartRate === null ? 'Not connected' : undefined} />
            <Stat icon={<Flame className="w-4 h-4" />} label="Calories" value={session.caloriesKcal !== null ? `${session.caloriesKcal} kcal` : DASH} sub={session.caloriesKcal === null ? 'Needs HR sensor' : undefined} />
            <Stat icon={<Compass className="w-4 h-4" />} label="Avg heading" value={session.avgHeadingDeg !== null ? `${session.avgHeadingDeg}°` : DASH} sub={session.avgHeadingDeg !== null ? degLabel(session.avgHeadingDeg) : 'Compass not connected'} />
            <Stat icon={<Navigation className="w-4 h-4" />} label="Max lane drift" value={session.laneDeviationMax !== null ? `${session.laneDeviationMax} m` : DASH} sub={session.laneDeviationMax === null ? 'No lane sensor' : session.laneDeviationMax < 1.5 ? 'Tight line' : session.laneDeviationMax < 3 ? 'Some drift' : 'Significant drift'} />
          </div>
        </Panel>

        <Panel title="Conditions at Launch" icon={<Waves className="w-4 h-4 text-cyan-700" />}>
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={<Waves className="w-4 h-4" />} label="Tide" value={`${session.startConditions.tideFt.toFixed(2)} ft`} sub={session.startConditions.direction} />
            <Stat icon={<Wind className="w-4 h-4" />} label="Wind" value={`${session.startConditions.windKnots} kt`} sub={`from ${session.startConditions.windDir}`} />
            <Stat icon={<MapPin className="w-4 h-4" />} label="Location" value="BIAC" sub="Redwood City" />
            <Stat icon={<Clock className="w-4 h-4" />} label="Started" value={startedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} sub={startedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} />
          </div>
        </Panel>
      </section>

      <button
        onClick={onNewRow}
        className="w-full md:w-auto px-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-800 border border-cyan-400/40 font-semibold text-sm inline-flex items-center justify-center gap-2 transition"
      >
        Plan Next Row →
      </button>
    </>
  );
};

// ============================================================
// Shared UI primitives
// ============================================================

const Stat = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3">
    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-600">
      {icon}
      {label}
    </div>
    <div className="text-xl font-semibold mt-1 text-slate-900">{value}</div>
    {sub && <div className="text-[11px] text-slate-600 mt-0.5">{sub}</div>}
  </div>
);

const BigStat = ({
  icon, label, value, sub, accent = 'text-slate-900', mono = false, pulse = false,
}: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: string; mono?: boolean; pulse?: boolean }) => (
  <div className="px-1 py-3 border-b border-slate-200">
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-slate-600">
      <span className={pulse ? 'animate-pulse' : ''}>{icon}</span>
      {label}
    </div>
    <div className={`${mono ? 'font-mono' : ''} text-4xl md:text-5xl font-bold mt-1 leading-none ${accent}`}>{value}</div>
    {sub && <div className="text-[11px] text-slate-600 mt-1.5">{sub}</div>}
  </div>
);

const Panel = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="px-1 py-4 border-b border-slate-200">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-[10px] uppercase tracking-[0.15em] text-slate-600 font-semibold">{title}</h2>
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

const TabButton = ({
  active, onClick, icon, label, sub, pulse = false,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; sub: string; pulse?: boolean }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 py-3 transition relative ${
      active ? 'text-cyan-700' : 'text-slate-600 hover:text-slate-800'
    }`}
  >
    {active && <span className="absolute top-0 inset-x-6 h-0.5 bg-cyan-400 rounded-full" />}
    <span className={pulse ? 'animate-pulse' : ''}>{icon}</span>
    <span className="text-xs font-semibold">{label}</span>
    <span className="text-[10px] text-slate-500">{sub}</span>
  </button>
);

// ============================================================
// Helpers
// ============================================================

function formatElapsed(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function degLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((deg % 360) / 45)) % 8];
}

// ============================================================
// CourseMap — projects GPS track points into an SVG viewport.
// Uses an equirectangular projection scaled to the bounding box of the track,
// which is plenty accurate for a single rowing session (< few km).
// ============================================================
const CourseMap = ({ track }: { track: TrackPoint[] }) => {
  if (track.length < 2) return null;
  const W = 800;
  const H = 360;
  const PAD = 24;

  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  for (const p of track) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
  }
  // Avoid divide-by-zero for extremely tight tracks
  const latSpan = Math.max(maxLat - minLat, 1e-6);
  const lonSpan = Math.max(maxLon - minLon, 1e-6);
  const midLat = (minLat + maxLat) / 2;
  // Adjust longitude scale by latitude so the route isn't horizontally squashed.
  const lonScale = Math.cos((midLat * Math.PI) / 180);
  const aspect = (lonSpan * lonScale) / latSpan;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  let drawW = innerW;
  let drawH = innerW / aspect;
  if (drawH > innerH) {
    drawH = innerH;
    drawW = innerH * aspect;
  }
  const offsetX = (W - drawW) / 2;
  const offsetY = (H - drawH) / 2;

  const project = (lat: number, lon: number) => {
    const x = offsetX + ((lon - minLon) / lonSpan) * drawW;
    const y = offsetY + (1 - (lat - minLat) / latSpan) * drawH;
    return [x, y] as const;
  };

  const path = track.map((p, i) => {
    const [x, y] = project(p.lat, p.lon);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const [sx, sy] = project(track[0].lat, track[0].lon);
  const [ex, ey] = project(track[track.length - 1].lat, track[track.length - 1].lon);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-[hsl(210_40%_97%)]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="rowGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(220 15% 75%)" strokeWidth="1" />
          </pattern>
          <linearGradient id="rowRoute" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(150 80% 55%)" />
            <stop offset="100%" stopColor="hsl(195 90% 65%)" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#rowGrid)" />
        <path d={path} fill="none" stroke="url(#rowRoute)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        {/* Start marker */}
        <g transform={`translate(${sx}, ${sy})`}>
          <circle r={9} fill="hsl(150 80% 55%)" stroke="hsl(210 40% 97%)" strokeWidth={3} />
          <text x={12} y={4} fontSize={11} fill="hsl(150 80% 75%)" fontWeight={600}>Start</text>
        </g>
        {/* End marker */}
        <g transform={`translate(${ex}, ${ey})`}>
          <circle r={9} fill="hsl(355 85% 60%)" stroke="hsl(210 40% 97%)" strokeWidth={3} />
          <text x={12} y={4} fontSize={11} fill="hsl(355 85% 80%)" fontWeight={600}>End</text>
        </g>
      </svg>
    </div>
  );
};

// Convert a session into a GPX 1.1 document. Includes track points with
// timestamps + speed extension; falls back gracefully when no GPS was captured.
function sessionToGPX(s: RowSession): string {
  const esc = (v: string) => v.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));
  const name = `RowWindow ${new Date(s.startedAt).toISOString()}`;
  const meta = `<time>${new Date(s.startedAt).toISOString()}</time>`;
  const trkpts = s.track.map((p) =>
    `      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}">` +
    `<time>${new Date(p.t).toISOString()}</time>` +
    `<extensions><speed>${p.speedMs.toFixed(2)}</speed></extensions>` +
    `</trkpt>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RowWindow" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${esc(name)}</name>
    ${meta}
  </metadata>
  <trk>
    <name>${esc(name)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

export default RowWindowLayout;
