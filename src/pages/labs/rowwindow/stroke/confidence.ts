// Confidence score in [0, 1].
//
// Weighted blend of four sub-scores. Each sub-score is a bounded [0, 1]
// signal so the final value stays interpretable — 0 means "don't trust this
// SPM number", 1 means "steady, clean, periodic rhythm".

import { median, medianAbsoluteDeviation } from './intervalValidator';

export interface ConfidenceInputs {
  intervals: number[];             // accepted inter-peak intervals
  recentPeakHeights: number[];     // recent peak amplitudes
  recentTroughDepths: number[];    // recent trough amplitudes (positive numbers)
  rms: number;
  clipping: boolean;               // raw sensor pinning to its range
}

const WEIGHTS = { rhythm: 0.35, peak: 0.25, periodicity: 0.2, sensor: 0.2 };

export function computeConfidence(x: ConfidenceInputs): number {
  const rhythm = rhythmScore(x.intervals);
  const peakQ = peakQualityScore(x.recentPeakHeights, x.rms);
  const period = periodicityScore(x.recentPeakHeights, x.recentTroughDepths);
  const sensor = sensorScore(x.clipping);

  const raw =
    WEIGHTS.rhythm * rhythm +
    WEIGHTS.peak * peakQ +
    WEIGHTS.periodicity * period +
    WEIGHTS.sensor * sensor;

  return clamp01(raw);
}

function rhythmScore(intervals: number[]): number {
  if (intervals.length < 3) return 0;
  const med = median(intervals);
  if (med === null || med === 0) return 0;
  const mad = medianAbsoluteDeviation(intervals, med);
  // MAD as a fraction of the median: 0 → perfect, 0.25+ → very inconsistent.
  return clamp01(1 - Math.min(1, (mad / med) / 0.2));
}

function peakQualityScore(peaks: number[], rms: number): number {
  if (peaks.length === 0 || rms <= 0) return 0;
  const mean = peaks.reduce((a, b) => a + b, 0) / peaks.length;
  // A healthy stroke peak sits ~2–3 × RMS. Saturate at 3×.
  return clamp01(mean / (rms * 3));
}

function periodicityScore(peaks: number[], troughs: number[]): number {
  // Consistent alternation of peaks and troughs (per stroke) implies a real
  // oscillation instead of drift. Score is the fraction of paired samples.
  const n = Math.min(peaks.length, troughs.length);
  if (n < 3) return 0;
  let paired = 0;
  for (let i = 0; i < n; i++) {
    if (peaks[i] > 0 && troughs[i] > 0) paired++;
  }
  return clamp01(paired / n);
}

function sensorScore(clipping: boolean): number {
  return clipping ? 0.3 : 1;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
