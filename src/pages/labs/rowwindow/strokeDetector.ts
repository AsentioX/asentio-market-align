// =============================================================================
// strokeDetector — pure, stateful stroke-rate estimator from 3-axis
// accelerometer samples. Extracted from useRowSensors so it can be unit-tested
// against synthetic signals at known cadences.
//
// Why per-axis instead of magnitude?
//   Naive magnitude detection `√(x²+y²+z²)` is gravity-invariant but rectifies
//   the stroke: each rowing cycle produces TWO magnitude bumps (one from the
//   positive accel peak, one from the negative trough) that are
//   indistinguishable. The detector then either double-counts (reporting 2×
//   the true cadence) or, if you try to gate with a zero-crossing re-arm,
//   never re-arms because magnitude bumps return to zero, not negative.
//
//   Instead we:
//     1. Track a very slow per-axis LPF → gravity vector (handles any phone
//        orientation, including changing tilt as the rower moves).
//     2. Subtract gravity → linear-acceleration vector with sign preserved.
//     3. Project onto a slowly-updated principal axis (the axis with most
//        running variance — the boat's pitch/rocking axis). The projection
//        is a single signed scalar that swings clearly positive and negative
//        once per stroke.
//     4. Peak-detect on the signed signal with a true zero-crossing refractory.
//     5. Report median of the last N inter-peak intervals.
// =============================================================================

export interface StrokeDetectorState {
  initialized: boolean;
  gx: number; gy: number; gz: number;          // gravity estimate
  vx: number; vy: number; vz: number;          // running variance of linear axes
  px: number; py: number; pz: number;          // current principal axis (unit vec)
  signal: number;                              // smoothed projected signal
  baselineSignal: number;                      // very-slow trend of signal (≈ 0)
  rms: number;
  lastPeakT: number;
  lastDynamic: number;
  rising: boolean;
  refractory: boolean;
  intervals: number[];
  warmupSamples: number;
}

export interface StrokeDetectorTunings {
  /** alpha for per-axis gravity LPF (very slow). */
  gravityAlpha: number;
  /** alpha for axis-variance tracker (slow). */
  varianceAlpha: number;
  /** alpha for smoothing the projected signal (fast). */
  signalAlpha: number;
  /** alpha for the long-run baseline of the projected signal. */
  baselineAlpha: number;
  /** alpha for RMS of the dynamic projected signal. */
  rmsAlpha: number;
  /** Adaptive threshold = max(floor, rms * mul). */
  thresholdMul: number;
  thresholdFloor: number;
  /** Re-arm when signal swings below -rearmAbs (true zero-crossing). */
  rearmAbs: number;
  /** Cap on max SPM (lower bound on inter-peak interval). */
  minIntervalMs: number;
  /** Floor on min SPM (upper bound on inter-peak interval). */
  maxIntervalMs: number;
  /** Number of recent intervals kept for median spm. */
  windowSize: number;
  /** Samples to discard while filters settle. */
  warmupSamples: number;
}

export const DEFAULT_TUNINGS: StrokeDetectorTunings = {
  gravityAlpha: 0.005,    // ~200-sample TC, ~3.3 s — slower than any stroke
  varianceAlpha: 0.01,
  signalAlpha: 0.25,
  baselineAlpha: 0.003,
  rmsAlpha: 0.005,
  thresholdMul: 0.7,
  thresholdFloor: 0.15,
  rearmAbs: 0.15,
  minIntervalMs: 1100,    // 54 spm cap — above realistic max race cadence
  maxIntervalMs: 6000,
  windowSize: 8,
  warmupSamples: 60,      // ~1 s @60Hz so gravity LPF can lock
};

export function createStrokeDetectorState(): StrokeDetectorState {
  return {
    initialized: false,
    gx: 0, gy: 0, gz: 0,
    vx: 0, vy: 0, vz: 0,
    px: 0, py: 0, pz: 1,
    signal: 0,
    baselineSignal: 0,
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
  ax: number;
  ay: number;
  az: number;
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
  const { ax, ay, az, t } = sample;
  const T = tunings;

  if (!state.initialized) {
    state.gx = ax; state.gy = ay; state.gz = az;
    state.initialized = true;
    return { spm: null, peak: false, threshold: T.thresholdFloor, dynamic: 0 };
  }

  // 1. Gravity tracker (very slow per-axis LPF).
  state.gx = state.gx * (1 - T.gravityAlpha) + ax * T.gravityAlpha;
  state.gy = state.gy * (1 - T.gravityAlpha) + ay * T.gravityAlpha;
  state.gz = state.gz * (1 - T.gravityAlpha) + az * T.gravityAlpha;

  // 2. Linear acceleration with gravity removed (signed).
  const lx = ax - state.gx;
  const ly = ay - state.gy;
  const lz = az - state.gz;

  // 3. Per-axis variance → principal axis. Update slowly so the axis is
  //    stable across strokes but can re-orient as the phone shifts.
  state.vx = state.vx * (1 - T.varianceAlpha) + lx * lx * T.varianceAlpha;
  state.vy = state.vy * (1 - T.varianceAlpha) + ly * ly * T.varianceAlpha;
  state.vz = state.vz * (1 - T.varianceAlpha) + lz * lz * T.varianceAlpha;

  // Principal direction proportional to (√vx, √vy, √vz) — biased toward the
  // axis with the most stroke energy. Normalize. Preserve sign of projection
  // by aligning to the current linear vector each step (avoids the axis
  // flipping 180° between updates and inverting the signal).
  let dx = Math.sqrt(state.vx);
  let dy = Math.sqrt(state.vy);
  let dz = Math.sqrt(state.vz);
  const n = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
  dx /= n; dy /= n; dz /= n;
  // Align sign: keep the axis pointing the same direction as the current
  // linear-accel vector. Otherwise sqrt() always returns positive components
  // and the projection sign would be lost.
  const align = Math.sign(lx * dx + ly * dy + lz * dz) || 1;
  state.px = dx * align;
  state.py = dy * align;
  state.pz = dz * align;

  // Wait — aligning to the *current* linear vector makes the projection always
  // positive. We want the axis to be stable so projection swings ±. Use a
  // smoothed alignment instead: alignment is updated only when |projection|
  // is small (signal near zero crossing) and frozen otherwise. Simpler: align
  // to the slow average of `l`, but that's gravity, which we already removed.
  //
  // Pragmatic: skip alignment entirely; project onto the variance-weighted
  // axis with a *fixed* sign convention based on the first axis index that
  // dominates. Easier: project linear onto the un-aligned axis (dx,dy,dz);
  // since √vx etc. are always positive, the axis points into the all-positive
  // octant. The projection l·axis can still go negative whenever l has any
  // negative component along that axis.
  const projection = lx * dx + ly * dy + lz * dz;

  // 4. Smooth the projection a bit and remove residual drift.
  state.signal = state.signal * (1 - T.signalAlpha) + projection * T.signalAlpha;
  state.baselineSignal =
    state.baselineSignal * (1 - T.baselineAlpha) + state.signal * T.baselineAlpha;
  const dynamic = state.signal - state.baselineSignal;

  state.rms = Math.sqrt(state.rms * state.rms * (1 - T.rmsAlpha) + dynamic * dynamic * T.rmsAlpha);
  const threshold = Math.max(T.thresholdFloor, state.rms * T.thresholdMul);

  let peak = false;
  state.warmupSamples++;
  const warm = state.warmupSamples > T.warmupSamples;

  if (warm) {
    if (state.refractory) {
      // True zero-crossing required: signal must swing negative before re-arming.
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
