// Public API for the modular stroke detector.
//
// One `createDetector()` bundles every pipeline stage; each call to
// `processSample()` runs a sample through the full pipeline and returns the
// current SPM + confidence + a debug frame.
//
// The orchestrator here is intentionally thin: each stage is independently
// testable in isolation via its own module file.

import type { ActivityProfile, DebugFrame, DetectorResult, StrokeSample, Vec3 } from './types';
import { ROWING_PROFILE } from './profiles';
import { createGravityFilter, updateGravity, type GravityFilter } from './gravityFilter';
import { createCovarianceTracker, updateCovariance, type CovarianceTracker } from './covarianceTracker';
import { createPCAAxis, maybeUpdateAxis, projectOnAxis, type PCAAxis } from './pcaAxis';
import { createBandPassFilter, updateBandPass, type BandPassFilter } from './bandPassFilter';
import { createAdaptiveThreshold, updateThreshold, type AdaptiveThreshold } from './adaptiveThreshold';
import { createPeakDetector, processPeak, type PeakDetectorState } from './peakDetector';
import { createIntervalValidator, reset as resetValidator, validateInterval, median, type IntervalValidator } from './intervalValidator';
import { createSPMEstimator, pushPeak, tick, type SPMEstimator } from './spmEstimator';
import { computeConfidence } from './confidence';

export type { ActivityProfile, DebugFrame, DetectorResult, StrokeSample, Vec3 };
export { PROFILES, ROWING_PROFILE, KAYAK_PROFILE, CANOE_PROFILE, DRAGON_BOAT_PROFILE, type ActivityId } from './profiles';

export interface StrokeDetector {
  profile: ActivityProfile;
  lastT: number;
  sampleCount: number;
  gravity: GravityFilter;
  covariance: CovarianceTracker;
  pca: PCAAxis;
  bandpass: BandPassFilter;
  threshold: AdaptiveThreshold;
  peak: PeakDetectorState;
  validator: IntervalValidator;
  spm: SPMEstimator;
  /** Recent peak heights and trough depths for confidence sub-scores. */
  peakHeights: number[];
  troughDepths: number[];
  /** Whether the raw signal is pinning to sensor range. */
  clipping: boolean;
  /** Deepest dynamic trough seen since the last committed peak (for pairing). */
  latestTroughDepth: number;
}

export function createDetector(profile: ActivityProfile = ROWING_PROFILE): StrokeDetector {
  return {
    profile,
    lastT: 0,
    sampleCount: 0,
    gravity: createGravityFilter(3),
    covariance: createCovarianceTracker(2),
    pca: createPCAAxis(10, 5),
    bandpass: createBandPassFilter(profile.bandpassHz[0], profile.bandpassHz[1]),
    threshold: createAdaptiveThreshold(8, 5),
    peak: createPeakDetector(profile.minIntervalMs, profile.minProminence),
    validator: createIntervalValidator(profile.madWidth, 20),
    spm: createSPMEstimator(profile.windowSize, profile.maxIntervalMs),
    peakHeights: [],
    troughDepths: [],
    clipping: false,
    latestTroughDepth: 0,
  };
}

export function setProfile(det: StrokeDetector, profile: ActivityProfile): void {
  det.profile = profile;
  det.bandpass = createBandPassFilter(profile.bandpassHz[0], profile.bandpassHz[1]);
  det.peak = createPeakDetector(profile.minIntervalMs, profile.minProminence);
  det.validator = createIntervalValidator(profile.madWidth, 20);
  det.spm = createSPMEstimator(profile.windowSize, profile.maxIntervalMs);
  det.peakHeights = [];
  det.troughDepths = [];
}

const CLIP_THRESHOLD = 78; // m/s² — well beyond gravity + realistic paddle accel

export function processSample(det: StrokeDetector, sample: StrokeSample): DetectorResult {
  const { ax, ay, az, t } = sample;

  // Bootstrap dt from a nominal 60 Hz on the first sample.
  const dtMs = det.lastT === 0 ? 1000 / 60 : Math.max(1, Math.min(500, t - det.lastT));
  const dtSec = dtMs / 1000;
  det.lastT = t;
  det.sampleCount++;

  // 1. Gravity removal.
  const g = updateGravity(det.gravity, ax, ay, az, dtSec);
  const lx = ax - g.x;
  const ly = ay - g.y;
  const lz = az - g.z;

  // Clipping detector — any component hitting the ceiling means the peak
  // amplitude is untrustworthy for this sample.
  det.clipping =
    Math.abs(ax) > CLIP_THRESHOLD || Math.abs(ay) > CLIP_THRESHOLD || Math.abs(az) > CLIP_THRESHOLD;

  // 2. Covariance + 3. PCA axis.
  updateCovariance(det.covariance, lx, ly, lz, dtSec);
  const axis = maybeUpdateAxis(det.pca, det.covariance);

  // 4. Projection onto principal axis (signed).
  const projection = projectOnAxis(axis, lx, ly, lz);

  // 5. Band-pass filter.
  const bandpassed = updateBandPass(det.bandpass, projection, dtSec);

  // 6+7. Baseline, RMS, adaptive thresholds.
  const th = updateThreshold(
    det.threshold,
    bandpassed,
    dtSec,
    det.profile.posGain,
    det.profile.negGain,
    det.profile.posFloor,
    det.profile.negFloor,
  );

  // Track deepest trough seen so we can pair peaks with troughs for the
  // periodicity confidence score.
  if (th.dynamic < 0 && -th.dynamic > det.latestTroughDepth) det.latestTroughDepth = -th.dynamic;

  const warm = det.sampleCount > det.profile.warmupSamples;
  let peak = false;
  let rejected = false;

  if (warm) {
    // 8. Peak detection.
    const evt = processPeak(det.peak, th.dynamic, t, th.rms, th.posThreshold, th.negThreshold);

    if (evt.peak) {
      // Commit peak height + paired trough for confidence scoring.
      det.peakHeights.push(evt.peakValue);
      if (det.peakHeights.length > 12) det.peakHeights.shift();
      det.troughDepths.push(det.latestTroughDepth);
      if (det.troughDepths.length > 12) det.troughDepths.shift();
      det.latestTroughDepth = 0;

      // 9. Interval validation before committing to the SPM estimator.
      if (det.spm.lastPeakT === 0) {
        pushPeak(det.spm, t);
        peak = true;
      } else {
        const intervalMs = t - det.spm.lastPeakT;
        const inRange = intervalMs >= det.profile.minIntervalMs && intervalMs <= det.profile.maxIntervalMs;
        if (!inRange) {
          rejected = true;
        } else {
          const { accepted } = validateInterval(det.validator, intervalMs);
          if (accepted) {
            pushPeak(det.spm, t);
            peak = true;
          } else {
            rejected = true;
          }
        }
      }
    }
  }

  tick(det.spm, t);

  // Reset if we've been idle too long.
  if (det.spm.lastPeakT === 0 && det.validator.history.length > 0 && !peak) {
    resetValidator(det.validator);
  }

  const medInterval = median(det.spm.intervals);
  const spm = det.spm.intervals.length >= 2 && medInterval !== null && medInterval > 0
    ? Math.round(60_000 / medInterval)
    : null;
  const confidence = computeConfidence({
    intervals: det.spm.intervals,
    recentPeakHeights: det.peakHeights,
    recentTroughDepths: det.troughDepths,
    rms: th.rms,
    clipping: det.clipping,
  });

  const debug: DebugFrame = {
    t,
    raw: { x: ax, y: ay, z: az },
    gravity: g,
    linear: { x: lx, y: ly, z: lz },
    axis,
    projection,
    bandpass: bandpassed,
    baseline: det.threshold.baseline,
    rms: th.rms,
    posThreshold: th.posThreshold,
    negThreshold: th.negThreshold,
    spm,
    confidence,
    peak,
    rejected,
  };

  return { spm, confidence, peak, rejected, debug };
}
