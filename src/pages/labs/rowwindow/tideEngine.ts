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
  single: { id: 'single', label: 'Single Scull (1x)', windWarnKnots: 10 },
  eight: { id: 'eight', label: 'Sweep Eight (8+)', windWarnKnots: 16 },
};

// Safety thresholds (feet, MLLW) — BIAC channel constraints
export const TIDE_RED_FT = 1.5;
export const TIDE_GREEN_FT = 3.0;

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
