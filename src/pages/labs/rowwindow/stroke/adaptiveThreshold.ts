// Slow baseline + rolling RMS + adaptive positive/negative thresholds.
//
// All thresholds scale with the running RMS so light rowing and hard rowing
// both work without hand-tuned constants. Floors prevent cold-start noise
// from firing spurious peaks before RMS builds up.

export interface AdaptiveThreshold {
  baseline: number;
  rms: number;
  baselineTau: number;
  rmsTau: number;
  initialized: boolean;
}

export function createAdaptiveThreshold(baselineTau = 8, rmsTau = 5): AdaptiveThreshold {
  return { baseline: 0, rms: 0, baselineTau, rmsTau, initialized: false };
}

export interface ThresholdReading {
  dynamic: number;
  rms: number;
  posThreshold: number;
  negThreshold: number;
}

export function updateThreshold(
  s: AdaptiveThreshold,
  bandpassed: number,
  dtSec: number,
  posGain: number,
  negGain: number,
  posFloor: number,
  negFloor: number,
): ThresholdReading {
  if (!s.initialized) {
    s.baseline = bandpassed;
    s.rms = Math.abs(bandpassed);
    s.initialized = true;
  } else {
    const aBase = dtSec / (s.baselineTau + dtSec);
    s.baseline += aBase * (bandpassed - s.baseline);
    const aRms = dtSec / (s.rmsTau + dtSec);
    const dyn = bandpassed - s.baseline;
    s.rms = Math.sqrt(s.rms * s.rms + aRms * (dyn * dyn - s.rms * s.rms));
  }
  const dynamic = bandpassed - s.baseline;
  const posThreshold = Math.max(posFloor, s.rms * posGain);
  const negThreshold = -Math.max(negFloor, s.rms * negGain);
  return { dynamic, rms: s.rms, posThreshold, negThreshold };
}
