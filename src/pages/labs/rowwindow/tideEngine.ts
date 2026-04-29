// RowWindow tide + safety engine
// Mock 24h sinusoidal tide model structured to be swapped for a NOAA JSON feed
// (Station 9414523 — Redwood City). Heights in feet, time in ms epoch.

export interface TidePoint {
  t: number; // ms epoch
  height: number; // feet (MLLW)
}

export interface TideTurn {
  t: number;
  type: 'high' | 'low';
  height: number;
}

export interface WindReading {
  speedKnots: number;
  directionDeg: number; // meteorological: dir wind is FROM
  directionLabel: string; // e.g. "NW"
}

export type Direction = 'Flood' | 'Ebb' | 'Slack';

export interface VesselProfile {
  id: 'single' | 'eight';
  label: string;
  windWarnKnots: number;
}

export const VESSEL_PROFILES: Record<VesselProfile['id'], VesselProfile> = {
  single: { id: 'single', label: 'Single (1x)', windWarnKnots: 10 },
  eight: { id: 'eight', label: 'Eight (8+)', windWarnKnots: 16 },
};

// Safety thresholds (feet, MLLW) — BIAC channel constraints
export const TIDE_RED_FT = 1.0;
export const TIDE_GREEN_FT = 2.0;

// Generate a 24h sinusoidal tide series anchored to "now".
// Two highs (~6.2 ft) and two lows (~0.4 ft) per ~24h — typical SF Bay mixed semidiurnal.
export function generateMockTideSeries(centerMs = Date.now(), hoursBefore = 6, hoursAfter = 18, stepMin = 10): TidePoint[] {
  const points: TidePoint[] = [];
  const start = centerMs - hoursBefore * 3600_000;
  const end = centerMs + hoursAfter * 3600_000;
  const stepMs = stepMin * 60_000;
  // Mixed semidiurnal: sum of two sinusoids
  // Period 1 ~ 12.42h (M2), Period 2 ~ 24h diurnal modulation
  const P1 = 12.42 * 3600_000;
  const P2 = 24.84 * 3600_000;
  // Phase chosen so a high tide occurs near 4-5h after typical morning launch window
  const phase1 = -2 * 3600_000;
  const phase2 = 1 * 3600_000;

  for (let t = start; t <= end; t += stepMs) {
    const a = 2.7 * Math.sin((2 * Math.PI * (t - phase1)) / P1);
    const b = 0.7 * Math.sin((2 * Math.PI * (t - phase2)) / P2);
    const height = 3.0 + a + b; // mean sea level around 3 ft
    points.push({ t, height: Number(height.toFixed(2)) });
  }
  return points;
}

export function findTideTurns(series: TidePoint[]): TideTurn[] {
  const turns: TideTurn[] = [];
  for (let i = 1; i < series.length - 1; i++) {
    const prev = series[i - 1].height;
    const curr = series[i].height;
    const next = series[i + 1].height;
    if (curr > prev && curr > next) turns.push({ t: series[i].t, type: 'high', height: curr });
    else if (curr < prev && curr < next) turns.push({ t: series[i].t, type: 'low', height: curr });
  }
  return turns;
}

export function getCurrentTide(series: TidePoint[], now = Date.now()): TidePoint {
  // nearest point
  let nearest = series[0];
  let bestDiff = Math.abs(series[0].t - now);
  for (const p of series) {
    const d = Math.abs(p.t - now);
    if (d < bestDiff) {
      bestDiff = d;
      nearest = p;
    }
  }
  return nearest;
}

export function getDirection(series: TidePoint[], now = Date.now()): Direction {
  const idx = series.findIndex((p) => p.t >= now);
  if (idx <= 0 || idx >= series.length - 1) return 'Slack';
  const before = series[Math.max(0, idx - 3)].height;
  const after = series[Math.min(series.length - 1, idx + 3)].height;
  const delta = after - before;
  if (Math.abs(delta) < 0.05) return 'Slack';
  return delta > 0 ? 'Flood' : 'Ebb';
}

export function getNextTurn(series: TidePoint[], now = Date.now()): TideTurn | null {
  const turns = findTideTurns(series);
  return turns.find((t) => t.t > now) ?? null;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '—';
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export type LaunchStatus = 'green' | 'yellow' | 'red';

export interface LaunchAssessment {
  status: LaunchStatus;
  minHeight: number;
  maxHeight: number;
  reasons: string[];
  windowSeries: TidePoint[];
  windWarning: boolean;
  chopAlert: boolean;
}

export function assessLaunchWindow(
  series: TidePoint[],
  durationMin: number,
  vessel: VesselProfile,
  wind: WindReading,
  direction: Direction,
  now = Date.now(),
): LaunchAssessment {
  const endT = now + durationMin * 60_000;
  const windowSeries = series.filter((p) => p.t >= now - 5 * 60_000 && p.t <= endT + 5 * 60_000);
  const heights = windowSeries.map((p) => p.height);
  const minHeight = heights.length ? Math.min(...heights) : 0;
  const maxHeight = heights.length ? Math.max(...heights) : 0;
  const reasons: string[] = [];

  let status: LaunchStatus = 'green';
  if (minHeight < TIDE_RED_FT) {
    status = 'red';
    reasons.push(`Tide drops to ${minHeight.toFixed(2)} ft — mudflats exposed (< ${TIDE_RED_FT} ft).`);
  } else if (minHeight < TIDE_GREEN_FT) {
    status = 'yellow';
    reasons.push(`Tide dips to ${minHeight.toFixed(2)} ft — caution, channel shallows.`);
  } else {
    reasons.push(`Tide stays above ${TIDE_GREEN_FT} ft (min ${minHeight.toFixed(2)} ft).`);
  }

  const windWarning = wind.speedKnots > vessel.windWarnKnots;
  if (windWarning) {
    if (status === 'green') status = 'yellow';
    reasons.push(`Wind ${wind.speedKnots} kt exceeds ${vessel.label} threshold (${vessel.windWarnKnots} kt).`);
  }

  // Wind-against-tide chop alert: NW wind + Ebb = square waves in Port channel
  const isNW = wind.directionLabel === 'NW' || wind.directionLabel === 'WNW' || wind.directionLabel === 'NNW';
  const chopAlert = isNW && direction === 'Ebb';
  if (chopAlert) {
    if (status === 'green') status = 'yellow';
    reasons.push('NW wind against ebb tide — expect square waves in the Port channel.');
  }

  return { status, minHeight, maxHeight, reasons, windowSeries, windWarning, chopAlert };
}

// Mock wind reading — designed to be swapped for a real feed (e.g. NDBC, OpenWeather).
export function getMockWind(now = Date.now()): WindReading {
  // Cycle through a few realistic conditions based on hour-of-day so the demo feels alive
  const hour = new Date(now).getHours();
  const presets: WindReading[] = [
    { speedKnots: 6, directionDeg: 315, directionLabel: 'NW' },
    { speedKnots: 12, directionDeg: 315, directionLabel: 'NW' },
    { speedKnots: 4, directionDeg: 90, directionLabel: 'E' },
    { speedKnots: 18, directionDeg: 270, directionLabel: 'W' },
  ];
  return presets[hour % presets.length];
}

// =====================================================================
// LIVE NOAA CO-OPS INTEGRATION
// Station 9414523 — Redwood City, San Francisco Bay
// API docs: https://api.tidesandcurrents.noaa.gov/api/prod/
// CORS-enabled, no auth required.
// =====================================================================

export const NOAA_STATION_ID = '9414523';
const NOAA_BASE = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

// Default wind station (Alameda) — used when caller omits a station.
export const NOAA_WIND_STATION_ID = '9414750';

function fmtNoaaDate(d: Date): string {
  // yyyyMMdd HH:mm — NOAA expects this format with a space (URL-encode later)
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}${mm}${dd} ${hh}:${mi}`;
}

function degToCompass(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(((deg % 360) / 22.5)) % 16;
  return dirs[idx];
}

/**
 * Fetch high-resolution tide PREDICTIONS from NOAA for a window around `now`.
 * Returns 6-minute interval points in feet (MLLW datum).
 */
export async function fetchNoaaTideSeries(
  centerMs = Date.now(),
  hoursBefore = 6,
  hoursAfter = 18,
  signal?: AbortSignal,
  stationId: string = NOAA_STATION_ID,
): Promise<TidePoint[]> {
  const begin = new Date(centerMs - hoursBefore * 3600_000);
  const end = new Date(centerMs + hoursAfter * 3600_000);
  const params = new URLSearchParams({
    product: 'predictions',
    application: 'RowWindow',
    begin_date: fmtNoaaDate(begin),
    end_date: fmtNoaaDate(end),
    datum: 'MLLW',
    station: stationId,
    time_zone: 'gmt',
    units: 'english',
    interval: '6', // 6-min high-res
    format: 'json',
  });
  const res = await fetch(`${NOAA_BASE}?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`NOAA tide fetch failed: ${res.status}`);
  const json = await res.json();
  if (!json?.predictions || !Array.isArray(json.predictions)) {
    throw new Error('NOAA tide response malformed');
  }
  return json.predictions.map((p: { t: string; v: string }) => ({
    // NOAA returns "YYYY-MM-DD HH:mm" in GMT — append Z to parse as UTC
    t: new Date(p.t.replace(' ', 'T') + 'Z').getTime(),
    height: Number(Number(p.v).toFixed(2)),
  }));
}

/**
 * Fetch latest observed wind from NOAA met station.
 * Returns null if station has no recent data (some stations are tide-only).
 */
export async function fetchNoaaWind(signal?: AbortSignal, stationId: string = NOAA_WIND_STATION_ID): Promise<WindReading | null> {
  const params = new URLSearchParams({
    product: 'wind',
    application: 'RowWindow',
    date: 'latest',
    station: stationId,
    time_zone: 'gmt',
    units: 'english', // wind speed in knots
    format: 'json',
  });
  const res = await fetch(`${NOAA_BASE}?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`NOAA wind fetch failed: ${res.status}`);
  const json = await res.json();
  const obs = json?.data?.[0];
  if (!obs) return null;
  const speedKnots = Number(obs.s);
  const directionDeg = Number(obs.d);
  if (!Number.isFinite(speedKnots) || !Number.isFinite(directionDeg)) return null;
  return {
    speedKnots: Number(speedKnots.toFixed(1)),
    directionDeg,
    directionLabel: typeof obs.dr === 'string' && obs.dr.trim() ? obs.dr.trim() : degToCompass(directionDeg),
  };
}

/**
 * Convenience: fetch live tide + wind in parallel, with mock fallback.
 * Always resolves — never throws — so the UI stays responsive.
 */
export async function fetchLiveConditions(
  centerMs = Date.now(),
  signal?: AbortSignal,
  stations?: { tideStationId?: string; windStationId?: string },
): Promise<{ series: TidePoint[]; wind: WindReading; source: 'noaa' | 'mock'; error?: string }> {
  try {
    const [series, wind] = await Promise.all([
      fetchNoaaTideSeries(centerMs, 6, 18, signal, stations?.tideStationId ?? NOAA_STATION_ID),
      fetchNoaaWind(signal, stations?.windStationId ?? NOAA_WIND_STATION_ID).catch(() => null),
    ]);
    return {
      series,
      wind: wind ?? getMockWind(centerMs),
      source: 'noaa',
    };
  } catch (err) {
    return {
      series: generateMockTideSeries(centerMs),
      wind: getMockWind(centerMs),
      source: 'mock',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
