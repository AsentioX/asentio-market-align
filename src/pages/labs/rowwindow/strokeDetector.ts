// =============================================================================
// strokeDetector — pure, stateful stroke-rate estimator from accelerometer
// magnitude samples. Extracted from useRowSensors so it can be unit-tested
// against synthetic signals at known cadences.
//
// Signal model
//   Each rowing stroke produces ~one dominant oscillation cycle on the boat's
//   pitch axis (catch → drive → finish → recovery). Phone accelerometer
//   magnitude therefore shows one strong peak per stroke, plus smaller
//   harmonics from the recovery slide.
//
// Algorithm
//   1. Lazy-init filters to the first sample → no 0 → 9.8 startup transient
//      that would otherwise fire a spurious peak before the first real stroke.
//   2. Cascade two one-pole filters: a fast low-pass (signal) and a very slow
//      one-pole (baseline). dynamic = signal − baseline removes gravity DC
//      regardless of phone orientation, and tracks slow drift (e.g. heel).
//   3. Rolling RMS of the dynamic signal (slow) → adaptive threshold.
//   4. Peak gating: arm on threshold crossing, fire on local-max — but
//      require the signal to swing back *below baseline* (true zero-crossing)
//      before another peak can arm. This eliminates the double-counting on
//      the recovery half-cycle that pure threshold detectors suffer from.
//   5. Minimum inter-peak interval enforces a physiological cap (≤ 54 spm).
//   6. Reject intervals deviating > 1.8× from running median (missed/extra
//      peak) and report median of last N intervals — robust to one bad sample.
// =============================================================================

export interface StrokeDetectorState {
  initialized: boolean;
  lpAccel: number;
  baseline: number;
  rms: number;
  lastPeakT: number;
  lastDynamic: number;
  rising: boolean;
  refractory: boolean;
  intervals: number[];
  warmupSamples: number;
}

export interface StrokeDetectorTunings {
  signalAlpha: number;
  baselineAlpha: number;
  rmsAlpha: number;
  thresholdMul: number;
  thresholdFloor: number;
  /** Magnitude (m/s²) the signal must dip *below baseline* to re-arm. */
  rearmAbs: number;
  minIntervalMs: number;
  maxIntervalMs: number;
  windowSize: number;
  warmupSamples: number;
}

export const DEFAULT_TUNINGS: StrokeDetectorTunings = {
  signalAlpha: 0.18,      // ~5-sample TC @60Hz — kills jitter, preserves stroke shape
  baselineAlpha: 0.0015,  // ~660-sample TC → ~11 s, well above any stroke period
  rmsAlpha: 0.004,        // ~250-sample TC → ~4 s, doesn't chase individual peaks
  thresholdMul: 1.0,      // sin-wave peak > RMS by sqrt(2), so 1.0 leaves margin
  thresholdFloor: 0.25,
  rearmAbs: 0.15,         // true zero-crossing (below baseline) required to re-arm
  minIntervalMs: 1100,    // 54 spm cap — above realistic max race cadence (~48)
  maxIntervalMs: 6000,    // 10 spm floor
  windowSize: 8,
  warmupSamples: 30,      // ~0.5 s @60Hz — let baseline settle before peak hunting
};

export function createStrokeDetectorState(): StrokeDetectorState {
  return {
    initialized: false,
    lpAccel: 0,
    baseline: 0,
    rms: 0,
    lastPeakT: 0,
    lastDynamic: 0,
    rising: false,
    refractory: false,
    intervals: [],
    warmupSamples: 0,
  };
}

export interface StrokeSample {
  mag: number;
  t: number;
}

export interface StrokeDetectorResult {
  spm: number | null;
  peak: boolean;
  threshold: number;
  dynamic: number;
}

export function processStrokeSample(
  state: StrokeDetectorState,
  sample: StrokeSample,
  tunings: StrokeDetectorTunings = DEFAULT_TUNINGS,
): StrokeDetectorResult {
  const { mag, t } = sample;
  const T = tunings;

  if (!state.initialized) {
    state.lpAccel = mag;
    state.baseline = mag;
    state.rms = 0;
    state.initialized = true;
    state.lastDynamic = 0;
    state.warmupSamples = 0;
    return { spm: null, peak: false, threshold: T.thresholdFloor, dynamic: 0 };
  }

  state.lpAccel = state.lpAccel * (1 - T.signalAlpha) + mag * T.signalAlpha;
  state.baseline = state.baseline * (1 - T.baselineAlpha) + state.lpAccel * T.baselineAlpha;
  const dynamic = state.lpAccel - state.baseline;

  state.rms = Math.sqrt(state.rms * state.rms * (1 - T.rmsAlpha) + dynamic * dynamic * T.rmsAlpha);
  const threshold = Math.max(T.thresholdFloor, state.rms * T.thresholdMul);

  let peak = false;
  state.warmupSamples++;
  const warm = state.warmupSamples > T.warmupSamples;

  if (warm) {
    if (state.refractory) {
      // Require true zero-crossing back through baseline (slightly negative).
      if (dynamic < -T.rearmAbs) {
        state.refractory = false;
        state.rising = false;
      }
    } else {
      if (dynamic > threshold) state.rising = true;
      const isLocalMax = state.rising && dynamic < state.lastDynamic && state.lastDynamic > threshold;

      if (isLocalMax && (state.lastPeakT === 0 || t - state.lastPeakT > T.minIntervalMs)) {
        peak = true;
        state.rising = false;
        state.refractory = true;

        if (state.lastPeakT !== 0) {
          const interval = t - state.lastPeakT;
          if (interval > T.minIntervalMs && interval < T.maxIntervalMs) {
            const med = median(state.intervals);
            const accept = med === null || (interval < med * 1.8 && interval > med * 0.55);
            if (accept) {
              state.intervals.push(interval);
              if (state.intervals.length > T.windowSize) state.intervals.shift();
            }
          }
        }
        state.lastPeakT = t;
      }
    }
  }

  if (state.lastPeakT !== 0 && t - state.lastPeakT > T.maxIntervalMs) {
    state.intervals = [];
    state.lastPeakT = 0;
    state.rising = false;
    state.refractory = false;
  }

  state.lastDynamic = dynamic;

  const med = median(state.intervals);
  const spm = med !== null && state.intervals.length >= 2 ? Math.round(60_000 / med) : null;

  return { spm, peak, threshold, dynamic };
}

function median(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
