// Adaptive peak detector.
//
// A candidate peak is committed only when every gate passes: local maximum,
// exceeds the positive threshold, rising then falling slope, minimum
// prominence relative to RMS, minimum inter-peak interval, and — critically —
// the signal must have dipped below the adaptive negative threshold since the
// previous peak (true zero-crossing re-arm). This blocks the "two bumps per
// stroke" failure mode of naive magnitude detectors.

export interface PeakDetectorState {
  prevDynamic: number;
  prev2Dynamic: number;
  lastPeakT: number;
  lastPeakValue: number;
  /** Minimum dynamic seen since the last committed peak (for prominence). */
  troughSinceLastPeak: number;
  /** True after signal has dipped below the negative threshold; the detector
   *  is armed and may commit the next peak. */
  armed: boolean;
  minPeakSpacingMs: number;
  minProminence: number;
}

export function createPeakDetector(minPeakSpacingMs: number, minProminence: number): PeakDetectorState {
  return {
    prevDynamic: 0,
    prev2Dynamic: 0,
    lastPeakT: 0,
    lastPeakValue: 0,
    troughSinceLastPeak: 0,
    armed: true,
    minPeakSpacingMs,
    minProminence,
  };
}

export interface PeakEvent {
  peak: boolean;
  peakValue: number;
  peakT: number;
  prominence: number;
}

export function processPeak(
  s: PeakDetectorState,
  dynamic: number,
  t: number,
  rms: number,
  posThreshold: number,
  negThreshold: number,
): PeakEvent {
  // Track the deepest trough since the last committed peak — used to compute
  // prominence and (once it crosses the negative threshold) to re-arm.
  if (dynamic < s.troughSinceLastPeak) s.troughSinceLastPeak = dynamic;
  if (!s.armed && dynamic < negThreshold) s.armed = true;

  // Detect local max on prev sample: prev2 < prev > current.
  let peak = false;
  let peakValue = 0;
  let peakT = 0;
  let prominence = 0;

  if (
    s.armed &&
    s.prevDynamic > posThreshold &&
    s.prevDynamic > s.prev2Dynamic &&
    s.prevDynamic > dynamic
  ) {
    const prominenceCandidate = s.prevDynamic - s.troughSinceLastPeak;
    const spacingOK = s.lastPeakT === 0 || t - s.lastPeakT >= s.minPeakSpacingMs;
    const prominenceOK = prominenceCandidate >= rms * s.minProminence;

    if (spacingOK && prominenceOK) {
      peak = true;
      peakValue = s.prevDynamic;
      peakT = t;
      prominence = prominenceCandidate;
      s.lastPeakT = t;
      s.lastPeakValue = s.prevDynamic;
      s.troughSinceLastPeak = 0;
      s.armed = false;
    }
  }

  s.prev2Dynamic = s.prevDynamic;
  s.prevDynamic = dynamic;

  return { peak, peakValue, peakT, prominence };
}
