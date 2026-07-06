// Rolling-median SPM estimator from accepted inter-peak intervals.
//
// Median (not mean) so one missed or extra peak doesn't drag the reading.

import { median } from './intervalValidator';

export interface SPMEstimator {
  intervals: number[];
  windowSize: number;
  lastPeakT: number;
  maxIntervalMs: number;
}

export function createSPMEstimator(windowSize: number, maxIntervalMs: number): SPMEstimator {
  return { intervals: [], windowSize, lastPeakT: 0, maxIntervalMs };
}

export function pushPeak(s: SPMEstimator, t: number): number | null {
  if (s.lastPeakT === 0) {
    s.lastPeakT = t;
    return currentSpm(s);
  }
  const interval = t - s.lastPeakT;
  s.lastPeakT = t;
  s.intervals.push(interval);
  if (s.intervals.length > s.windowSize) s.intervals.shift();
  return currentSpm(s);
}

export function tick(s: SPMEstimator, t: number): number | null {
  // Reset the window if the rower has been idle longer than max interval;
  // stale intervals would otherwise keep reporting a phantom cadence.
  if (s.lastPeakT !== 0 && t - s.lastPeakT > s.maxIntervalMs) {
    s.intervals = [];
    s.lastPeakT = 0;
  }
  return currentSpm(s);
}

export function currentSpm(s: SPMEstimator): number | null {
  if (s.intervals.length < 2) return null;
  const med = median(s.intervals);
  if (med === null || med <= 0) return null;
  return Math.round(60_000 / med);
}
