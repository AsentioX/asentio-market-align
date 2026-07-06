// dt-adaptive band-pass filter built from cascaded one-pole sections.
//
// The RBJ biquad is standard but requires stable dt; here samples arrive from
// DeviceMotion at variable rates, so we use one-pole HP + one-pole LP which
// stays unconditionally stable and recomputes its coefficients per-sample.

export interface BandPassFilter {
  fcLowHz: number;      // high-pass cutoff (removes drift)
  fcHighHz: number;     // low-pass cutoff (removes vibration)
  hpX: number;
  hpY: number;
  lpY: number;
  initialized: boolean;
}

export function createBandPassFilter(fcLowHz: number, fcHighHz: number): BandPassFilter {
  return {
    fcLowHz,
    fcHighHz,
    hpX: 0,
    hpY: 0,
    lpY: 0,
    initialized: false,
  };
}

export function updateBandPass(state: BandPassFilter, x: number, dtSec: number): number {
  if (!state.initialized) {
    state.hpX = x;
    state.hpY = 0;
    state.lpY = 0;
    state.initialized = true;
    return 0;
  }

  // One-pole HP: y = a * (y_prev + x - x_prev), a = tau / (tau + dt).
  const tauHp = 1 / (2 * Math.PI * Math.max(1e-4, state.fcLowHz));
  const aHp = tauHp / (tauHp + dtSec);
  const hpY = aHp * (state.hpY + x - state.hpX);
  state.hpX = x;
  state.hpY = hpY;

  // One-pole LP: y += (dt / (tau + dt)) * (x - y).
  const tauLp = 1 / (2 * Math.PI * Math.max(1e-4, state.fcHighHz));
  const aLp = dtSec / (tauLp + dtSec);
  state.lpY += aLp * (hpY - state.lpY);
  return state.lpY;
}
