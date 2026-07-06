// Activity-specific tunings for the stroke detector.
//
// Each profile bakes the expected cadence range, band-pass corners, and
// peak-detection gains for one paddlesport. All other detector modules stay
// generic — the only per-sport knobs live here.

import type { ActivityProfile } from './types';

export const ROWING_PROFILE: ActivityProfile = {
  id: 'rowing',
  label: 'Rowing',
  spmRange: [10, 42],
  bandpassHz: [0.15, 1.2],
  minIntervalMs: 1200,
  maxIntervalMs: 6000,
  posGain: 0.7,
  negGain: 0.4,
  posFloor: 0.15,
  negFloor: 0.12,
  minProminence: 0.6,
  madWidth: 3,
  windowSize: 10,
  warmupSamples: 60,
};

export const KAYAK_PROFILE: ActivityProfile = {
  id: 'kayak',
  label: 'Kayak',
  spmRange: [30, 90],
  bandpassHz: [0.4, 2],
  minIntervalMs: 550,
  maxIntervalMs: 2500,
  posGain: 0.6,
  negGain: 0.4,
  posFloor: 0.12,
  negFloor: 0.1,
  minProminence: 0.5,
  madWidth: 3,
  windowSize: 12,
  warmupSamples: 45,
};

export const CANOE_PROFILE: ActivityProfile = {
  id: 'canoe',
  label: 'Canoe',
  spmRange: [20, 70],
  bandpassHz: [0.3, 1.5],
  minIntervalMs: 750,
  maxIntervalMs: 3500,
  posGain: 0.65,
  negGain: 0.4,
  posFloor: 0.13,
  negFloor: 0.11,
  minProminence: 0.55,
  madWidth: 3,
  windowSize: 10,
  warmupSamples: 45,
};

export const DRAGON_BOAT_PROFILE: ActivityProfile = {
  id: 'dragonBoat',
  label: 'Dragon Boat',
  spmRange: [40, 120],
  bandpassHz: [0.6, 2.5],
  minIntervalMs: 450,
  maxIntervalMs: 2000,
  posGain: 0.6,
  negGain: 0.4,
  posFloor: 0.12,
  negFloor: 0.1,
  minProminence: 0.5,
  madWidth: 3,
  windowSize: 12,
  warmupSamples: 45,
};

export const PROFILES: Record<ActivityProfile['id'], ActivityProfile> = {
  rowing: ROWING_PROFILE,
  kayak: KAYAK_PROFILE,
  canoe: CANOE_PROFILE,
  dragonBoat: DRAGON_BOAT_PROFILE,
};

export type ActivityId = ActivityProfile['id'];
