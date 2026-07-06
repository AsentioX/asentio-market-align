// Per-axis gravity tracker.
//
// A single-pole low-pass with a real time constant (default 3 s). Sample rate
// is not assumed constant — alpha is derived from the observed dt so a phone
// running at 30, 60, or 100 Hz all converge to the same physical response.

import type { Vec3 } from './types';

export interface GravityFilter {
  g: Vec3;
  initialized: boolean;
  /** Time constant in seconds. */
  tau: number;
}

export function createGravityFilter(tau = 3): GravityFilter {
  return { g: { x: 0, y: 0, z: 0 }, initialized: false, tau };
}

export function updateGravity(state: GravityFilter, ax: number, ay: number, az: number, dtSec: number): Vec3 {
  if (!state.initialized) {
    state.g = { x: ax, y: ay, z: az };
    state.initialized = true;
    return state.g;
  }
  // dt-aware one-pole LPF: alpha = dt / (tau + dt).
  const a = dtSec > 0 ? dtSec / (state.tau + dtSec) : 0;
  state.g = {
    x: state.g.x + a * (ax - state.g.x),
    y: state.g.y + a * (ay - state.g.y),
    z: state.g.z + a * (az - state.g.z),
  };
  return state.g;
}
