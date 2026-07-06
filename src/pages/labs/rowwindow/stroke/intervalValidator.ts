// Rolling median + MAD (median-absolute-deviation) outlier gate.
//
// Fixed ratio gates (e.g. reject anything outside 0.55–1.8 × median) miss the
// mark on high-cadence sports and are too permissive on slow rowing. MAD
// gating scales naturally with the current rhythm's own variability.

export interface IntervalValidator {
  history: number[];
  /** Recent inter-peak intervals kept for the MAD estimate (independent of
   *  the SPM window: this one is longer for better robustness). */
  historySize: number;
  madWidth: number;
}

export function createIntervalValidator(madWidth = 3, historySize = 20): IntervalValidator {
  return { history: [], historySize, madWidth };
}

export function validateInterval(v: IntervalValidator, intervalMs: number): { accepted: boolean; median: number | null; mad: number | null } {
  const med = median(v.history);
  const mad = med === null ? null : medianAbsoluteDeviation(v.history, med);

  // Before we have enough history, accept anything within a wide sanity range
  // and let the peak detector's minInterval gate do the heavy lifting.
  if (med === null || mad === null || v.history.length < 4) {
    v.history.push(intervalMs);
    if (v.history.length > v.historySize) v.history.shift();
    return { accepted: true, median: med, mad };
  }

  // MAD can collapse to zero on hyper-steady rhythms; fall back to a small
  // relative floor so we don't reject every future sample.
  const gate = Math.max(mad * v.madWidth, med * 0.15);
  const accepted = Math.abs(intervalMs - med) <= gate;
  if (accepted) {
    v.history.push(intervalMs);
    if (v.history.length > v.historySize) v.history.shift();
  }
  return { accepted, median: med, mad };
}

export function reset(v: IntervalValidator): void {
  v.history = [];
}

export function median(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function medianAbsoluteDeviation(arr: number[], med: number): number {
  if (arr.length === 0) return 0;
  const deviations = arr.map((x) => Math.abs(x - med));
  return median(deviations) ?? 0;
}
