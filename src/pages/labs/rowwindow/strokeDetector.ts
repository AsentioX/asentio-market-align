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
//   1. Lazy-initialize DC tracker to the first sample (avoids the cold-start
//      transient where lpAccel jumps from 0 → ~9.8 m/s² and fires a spurious
//      peak before the first real stroke).
//   2. Cascade two one-pole filters: a fast low-pass (signal) and a very slow
//      one-pole (baseline). dynamic = signal − baseline removes gravity DC
//      regardless of phone orientation.
//   3. Track rolling RMS of the dynamic signal slowly so the adaptive
//      threshold doesn't collapse around each stroke peak.
//   4. Peak gating: arm on threshold crossing, fire on local-max, then
//      *require the signal to return below* THRESHOLD * 0.4 before re-arming.
//      Combined with a minimum inter-peak interval, this eliminates the
//      double-counting that pure derivative tests suffer from.
//   5. Reject intervals that deviate > 2× from the running median — these are
//      missed peaks (double interval) or noise spikes (half interval).
//   6. Report the median of the last N accepted intervals; median is much
//      more robust than mean to a single bad interval.
// =============================================================================

export interface StrokeDetectorState {
  initialized: boolean;
  lpAccel: number;
  baseline: number;
  rms: number;          // RMS of the dynamic (DC-removed) signal
  lastPeakT: number;    // ms timestamp of the most recent accepted peak
  lastDynamic: number;
  rising: boolean;      // armed: we've crossed threshold and are awaiting peak
  refractory: boolean;  // waiting for signal to drop low enough to re-arm
  intervals: number[];  // accepted inter-peak intervals (ms)
}

export interface StrokeDetectorTunings {
  /** Fast smoothing on the raw magnitude. alpha for new sample. */
  signalAlpha: number;
  /** Baseline (DC) tracker — must be much slower than a stroke (~2 s). */
  baselineAlpha: number;
  /** RMS tracker for adaptive threshold. */
  rmsAlpha: number;
  /** Threshold multiplier over rolling RMS. */
  thresholdMul: number;
  /** Absolute floor for threshold (m/s²). */
  thresholdFloor: number;
  /** Fraction of THRESHOLD the signal must drop below to re-arm. */
  rearmFraction: number;
  /** Minimum inter-peak interval in ms (caps max spm). 700 ms → 85 spm. */
  minIntervalMs: number;
  /** Maximum inter-peak interval in ms (floors min spm). 6000 ms → 10 spm. */
  maxIntervalMs: number;
  /** How many recent intervals to keep for median spm. */
  windowSize: number;
}

export const DEFAULT_TUNINGS: StrokeDetectorTunings = {
  signalAlpha: 0.2,
  baselineAlpha: 0.002,   // ~500-sample TC; ~8 s at 60 Hz — well above stroke period
  rmsAlpha: 0.01,         // ~100-sample TC; ~1.7 s at 60 Hz — slow enough not to chase peaks
  thresholdMul: 1.3,
  thresholdFloor: 0.18,
  rearmFraction: 0.4,
  minIntervalMs: 700,
  maxIntervalMs: 6000,
  windowSize: 6,
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
  };
}

export interface StrokeSample {
  /** Accelerometer magnitude (m/s²), incl. gravity. */
  mag: number;
  /** Sample timestamp in ms. */
  t: number;
}

export interface StrokeDetectorResult {
  /** Strokes per minute (median of recent intervals) or null if not enough data. */
  spm: number | null;
  /** True if a fresh peak was registered on this sample. */
  peak: boolean;
  /** Current adaptive threshold value, for debug/visualization. */
  threshold: number;
  /** Current dynamic (DC-removed, smoothed) signal value. */
  dynamic: number;
}

/**
 * Feed one accelerometer sample. Mutates `state` in place and returns the
 * current SPM estimate (or null if not enough strokes yet).
 */
export function processStrokeSample(
  state: StrokeDetectorState,
  sample: StrokeSample,
  tunings: StrokeDetectorTunings = DEFAULT_TUNINGS,
): StrokeDetectorResult {
  const { mag, t } = sample;
  const T = tunings;

  // Lazy init — avoids 0 → 9.8 startup transient.
  if (!state.initialized) {
    state.lpAccel = mag;
    state.baseline = mag;
    state.rms = 0;
    state.initialized = true;
    state.lastDynamic = 0;
    return { spm: null, peak: false, threshold: T.thresholdFloor, dynamic: 0 };
  }

  state.lpAccel = state.lpAccel * (1 - T.signalAlpha) + mag * T.signalAlpha;
  state.baseline = state.baseline * (1 - T.baselineAlpha) + state.lpAccel * T.baselineAlpha;
  const dynamic = state.lpAccel - state.baseline;

  // RMS over the dynamic signal (slow).
  state.rms = Math.sqrt(state.rms * state.rms * (1 - T.rmsAlpha) + dynamic * dynamic * T.rmsAlpha);
  const threshold = Math.max(T.thresholdFloor, state.rms * T.thresholdMul);

  let peak = false;

  // Re-arm gate: after a peak, require the signal to drop well below threshold
  // before considering the next peak. This kills double-counting on the small
  // secondary bump that often follows the main drive.
  if (state.refractory) {
    if (dynamic < threshold * T.rearmFraction) {
      state.refractory = false;
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
          // Outlier rejection vs. running median.
          const med = median(state.intervals);
          const accept = med === null || (interval < med * 2 && interval > med * 0.5);
          if (accept) {
            state.intervals.push(interval);
            if (state.intervals.length > T.windowSize) state.intervals.shift();
          }
        }
      }
      state.lastPeakT = t;
    }
  }

  // Drop spm if we've gone too long without a peak.
  if (state.lastPeakT !== 0 && t - state.lastPeakT > T.maxIntervalMs) {
    state.intervals = [];
    state.lastPeakT = 0;
    state.rising = false;
    state.refractory = false;
  }

  state.lastDynamic = dynamic;

  const med = median(state.intervals);
  // Need at least 2 accepted intervals (≈3 strokes) before reporting.
  const spm = med !== null && state.intervals.length >= 2 ? Math.round(60_000 / med) : null;

  return { spm, peak, threshold, dynamic };
}

function median(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
