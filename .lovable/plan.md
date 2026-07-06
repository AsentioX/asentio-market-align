
# Improve Stroke Rate (SPM) Detection

Rebuild `strokeDetector.ts` as a modular sensor-fusion pipeline that stays a drop-in replacement for `useRowSensors`, then add a confidence score, activity presets, a live debug panel, and an optional recording mode.

## What changes for the user

- SPM readings become more accurate and less jumpy across phone orientations, boat vibration, and light vs hard rowing.
- New confidence indicator (0–1) so the UI can hide unreliable numbers.
- Activity picker (Rowing / Kayak / Canoe / Dragon Boat) tunes the detector for each sport's cadence.
- Hidden dev debug panel on `/labs/rowwindow` with live graphs and a "record session" button that downloads a JSON of the raw signals for offline tuning.

Everything else in the app stays the same.

## New file layout

```text
src/pages/labs/rowwindow/stroke/
  index.ts                  // public API: createDetector, processSample, presets
  types.ts                  // Sample, DetectorResult, DebugFrame, ActivityProfile
  profiles.ts               // rowing / kayak / canoe / dragonBoat configs
  gravityFilter.ts          // time-based per-axis LPF (tau = 3s)
  covarianceTracker.ts      // 3x3 exponentially-weighted covariance
  pcaAxis.ts                // dominant eigenvector via power iteration, sign lock
  bandPassFilter.ts         // biquad HP (0.2 Hz) + LP (2 Hz), dt-aware
  adaptiveThreshold.ts      // RMS + baseline + positive/negative thresholds
  peakDetector.ts           // slope + prominence + adaptive re-arm
  intervalValidator.ts      // rolling median + MAD gate
  spmEstimator.ts           // rolling median of accepted intervals
  confidence.ts             // rhythm + peak-quality + periodicity + sensor score
  recorder.ts               // optional ring-buffer + JSON export
```

`strokeDetector.ts` becomes a thin re-export that keeps the current
`createStrokeDetectorState` / `processStrokeSample` signatures alive so
`useRowSensors.ts` and `scripts/test-stroke-detector.ts` don't break.

## Pipeline (per sample)

1. **Gravity removal** — per-axis LPF with `alpha = dt / (tau + dt)`, `tau = 3s`. Uses the sample's real timestamp; no fixed-rate assumption.
2. **Covariance tracker** — update 6 unique entries of the 3×3 covariance with exponential weight (`tau = 2s`).
3. **PCA axis** — every 10 samples, run 5 power-iteration steps on the covariance to get the dominant eigenvector. Sign-lock against the previous axis (`if dot < 0 → flip`). Between updates, reuse the last axis.
4. **Projection** — signed scalar `l · axis`.
5. **Band-pass** — biquad high-pass at 0.2 Hz then low-pass at 2 Hz. Coefficients recomputed when `dt` drifts >10 %. Passband tuned per activity profile.
6. **Baseline & RMS** — very slow baseline subtracted from band-pass output; rolling RMS (`tau ≈ 5s`).
7. **Peak detector** — accepts a peak only when all hold:
   - Local maximum (`prev > prev-1` and `prev > current`)
   - `prev > max(minPositive, RMS * posGain)`
   - Rising slope before, falling slope after
   - Prominence ≥ RMS × `minProminence`
   - Elapsed since last peak ≥ `minIntervalMs`
   - Re-arm needed: signal must dip below `-max(minNegative, RMS * negGain)` before the next peak.
8. **Interval validator** — keep last 20 intervals; reject any that fall outside `median ± 3 × MAD`. Rejected intervals are still emitted in debug data.
9. **SPM estimator** — rolling median of the last 8–12 accepted intervals; `spm = round(60000 / median)`.
10. **Confidence** — weighted blend, clamped 0–1:
    - Rhythm consistency: `1 - min(1, MAD / median)` (weight 0.35)
    - Peak quality: `min(1, meanPeakHeight / RMS / 3)` (weight 0.25)
    - Periodicity: alternating-sign ratio in last 12 peaks vs troughs (weight 0.20)
    - Sensor health: not clipping, not saturated with high-freq energy (weight 0.20)

## Activity profiles

`profiles.ts` exports a config object per sport with expected SPM range, band-pass corners, min/max interval, and threshold gains:

- Rowing: 10–42 SPM, band 0.15–1.2 Hz, `minInterval = 1200 ms`
- Kayak: 30–90 SPM, band 0.4–2 Hz, `minInterval = 550 ms`
- Canoe: 20–70 SPM, band 0.3–1.5 Hz, `minInterval = 750 ms`
- Dragon Boat: 40–120 SPM, band 0.6–2.5 Hz, `minInterval = 450 ms`

`useRowSensors` gains an optional `activity` option (defaults to `rowing`) and passes it into `createDetector`. `RowWindowLayout` gets a small activity selector in the pre-session sheet.

## Confidence + activity UI

- `RowSensorState` gains `spmConfidence: number | null` and echoes back `activity`.
- The stroke card in `RowWindowLayout` dims the value and shows a small "warming up" state whenever `confidence < 0.4`.
- Post-session summary uses accepted intervals only.

## Debug panel

New `StrokeDebugPanel.tsx` mounted only when `?debug=stroke` is in the URL:

- Live sparklines for: raw XYZ, gravity XYZ, linear XYZ, projection, band-pass output, baseline, RMS, positive/negative thresholds, detected peaks (dot markers), rejected peaks (red markers), current SPM, confidence.
- Uses a shared 512-frame ring buffer fed from the detector's `debug` output.
- "Start recording" button → writes samples to `recorder.ts`; "Download JSON" exports timestamped session for offline analysis.

## Compatibility & tests

- Keep the existing exports (`createStrokeDetectorState`, `processStrokeSample`, `DEFAULT_TUNINGS`, `StrokeDetectorTunings`) so `scripts/test-stroke-detector.ts` still compiles. Internally they delegate to the new modular detector using the rowing profile.
- Extend `scripts/test-stroke-detector.ts` with:
  - Cadence sweep 16–40 SPM at multiple noise levels
  - Random phone-tilt sweep
  - Vibration overlay at 8 Hz
  - Kayak profile sweep 45–75 SPM
  - Assert average error < 1 SPM and confidence > 0.7 for clean signals.

## Deliverables (in order)

1. `stroke/` modules + `profiles.ts` + `types.ts`.
2. New pipeline wired through `stroke/index.ts`; `strokeDetector.ts` becomes a compatibility shim.
3. `useRowSensors` returns `spmConfidence`, accepts `activity`, and forwards debug frames through a ref.
4. Activity selector in the pre-session sheet; confidence-aware SPM tile in `RowWindowLayout`.
5. `StrokeDebugPanel` + `recorder.ts` behind `?debug=stroke`.
6. Expanded synthetic test script; run and confirm targets.

## Non-goals

- No GPS-fusion for stroke detection yet (confidence formula leaves a hook but doesn't consume speed).
- No changes to heart rate, compass, GPS, tide, or piece-detection code.
- No UI redesign beyond the activity selector, confidence dimming, and the hidden debug panel.
