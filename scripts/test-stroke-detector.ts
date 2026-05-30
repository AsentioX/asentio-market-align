// Synthetic 3-axis stroke-rate accuracy test for strokeDetector.

import {
  createStrokeDetectorState,
  processStrokeSample,
  DEFAULT_TUNINGS,
  type StrokeDetectorTunings,
} from '../src/pages/labs/rowwindow/strokeDetector';

interface SimOptions {
  trueSpm: number;
  durationSec: number;
  sampleHz: number;
  amplitude: number;       // m/s² peak on the stroke axis
  noiseStd: number;        // m/s² per-axis white noise
  harmonicFrac: number;    // secondary harmonic amplitude as fraction of main
  /** Gravity vector — phone tilt. */
  gx: number; gy: number; gz: number;
  /** Stroke axis (will be normalized). */
  sx: number; sy: number; sz: number;
  spmDriftPerMin: number;
  seed: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  const u = Math.max(1e-9, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function simulate(opts: SimOptions, tunings: StrokeDetectorTunings = DEFAULT_TUNINGS) {
  const dt = 1000 / opts.sampleHz;
  const nSamples = Math.floor(opts.durationSec * opts.sampleHz);
  const rand = mulberry32(opts.seed);
  const state = createStrokeDetectorState();
  // Normalize stroke axis
  const sn = Math.sqrt(opts.sx ** 2 + opts.sy ** 2 + opts.sz ** 2);
  const sx = opts.sx / sn, sy = opts.sy / sn, sz = opts.sz / sn;

  let phase = 0;
  const spmReadings: { t: number; spm: number; truth: number }[] = [];
  let peakCount = 0;

  for (let i = 0; i < nSamples; i++) {
    const t = i * dt;
    const currentSpm = opts.trueSpm + (opts.spmDriftPerMin * (t / 60000));
    const freqHz = currentSpm / 60;
    phase += 2 * Math.PI * freqHz * (dt / 1000);

    const stroke = opts.amplitude * Math.sin(phase);
    const harmonic = opts.amplitude * opts.harmonicFrac * Math.sin(2 * phase + 0.6);
    const dyn = stroke + harmonic;

    const ax = opts.gx + dyn * sx + opts.noiseStd * gauss(rand);
    const ay = opts.gy + dyn * sy + opts.noiseStd * gauss(rand);
    const az = opts.gz + dyn * sz + opts.noiseStd * gauss(rand);

    const res = processStrokeSample(state, { ax, ay, az, t }, tunings);
    if (res.peak) peakCount++;
    if (res.spm !== null && i % opts.sampleHz === 0) {
      spmReadings.push({ t, spm: res.spm, truth: currentSpm });
    }
  }

  // Use the second half of readings to skip warm-up convergence.
  const stable = spmReadings.filter((r) => r.t > opts.durationSec * 1000 * 0.5);
  const meanErr =
    stable.length === 0
      ? null
      : stable.reduce((acc, r) => acc + Math.abs(r.spm - r.truth), 0) / stable.length;
  const lastSpm = spmReadings.length ? spmReadings[spmReadings.length - 1].spm : null;
  const expectedPeaks = opts.trueSpm * (opts.durationSec / 60) +
    0.5 * opts.spmDriftPerMin * (opts.durationSec / 60) * (opts.durationSec / 60);

  return { peakCount, expectedPeaks, lastSpm, meanErr, samples: spmReadings.length };
}

function pad(s: string | number, n: number) {
  const str = String(s);
  return str + ' '.repeat(Math.max(0, n - str.length));
}

function runSuite(label: string, tunings: StrokeDetectorTunings) {
  console.log(`\n=== ${label} ===`);
  console.log(
    pad('case', 32), pad('truth', 8), pad('lastSpm', 10), pad('|err|', 8),
    pad('peaks', 8), pad('expected', 10),
  );

  const defaults: SimOptions = {
    trueSpm: 28,
    durationSec: 45,
    sampleHz: 60,
    amplitude: 2.5,
    noiseStd: 0.3,
    harmonicFrac: 0.3,
    gx: 0, gy: 9.8, gz: 0,      // phone upright, screen forward
    sx: 1, sy: 0, sz: 0.3,      // stroke axis: fore-aft + slight vertical
    spmDriftPerMin: 0,
    seed: 42,
  };

  const cases: { name: string; opts: Partial<SimOptions> }[] = [
    { name: 'idle 18 spm', opts: { trueSpm: 18, noiseStd: 0.15 } },
    { name: 'paddle 24 spm', opts: { trueSpm: 24, noiseStd: 0.2 } },
    { name: 'steady 28 spm', opts: { trueSpm: 28, noiseStd: 0.3 } },
    { name: 'race 32 spm', opts: { trueSpm: 32, noiseStd: 0.4 } },
    { name: 'race 36 spm', opts: { trueSpm: 36, noiseStd: 0.4 } },
    { name: 'sprint 40 spm', opts: { trueSpm: 40, noiseStd: 0.5 } },
    { name: 'sprint 46 spm', opts: { trueSpm: 46, noiseStd: 0.5 } },
    { name: 'noisy 30 spm', opts: { trueSpm: 30, noiseStd: 1.2 } },
    { name: 'small amp 26 spm', opts: { trueSpm: 26, amplitude: 0.8, noiseStd: 0.2 } },
    { name: 'strong harm 30', opts: { trueSpm: 30, harmonicFrac: 0.6, noiseStd: 0.3 } },
    { name: 'drift 24→32 spm', opts: { trueSpm: 24, spmDriftPerMin: 8, noiseStd: 0.3, durationSec: 60 } },
    { name: 'phone flat 28', opts: { trueSpm: 28, gx: 0, gy: 0, gz: 9.8, sx: 1, sy: 0.3, sz: 0 } },
    { name: 'phone tilted 28', opts: { trueSpm: 28, gx: 3, gy: 8, gz: 4, sx: 0.7, sy: 0.2, sz: 0.7 } },
  ];

  let totalErr = 0, count = 0, missed = 0;
  for (const c of cases) {
    const opts: SimOptions = { ...defaults, ...c.opts };
    const r = simulate(opts, tunings);
    if (r.meanErr !== null) { totalErr += r.meanErr; count++; } else { missed++; }
    console.log(
      pad(c.name, 32),
      pad(opts.trueSpm.toFixed(1), 8),
      pad(r.lastSpm ?? '-', 10),
      pad(r.meanErr?.toFixed(2) ?? '-', 8),
      pad(r.peakCount, 8),
      pad(r.expectedPeaks.toFixed(1), 10),
    );
  }
  const avg = count ? (totalErr / count).toFixed(2) : '-';
  console.log(`  → mean |err|: ${avg} spm   missed: ${missed}/${cases.length}`);
}

runSuite('DEFAULT_TUNINGS', DEFAULT_TUNINGS);
