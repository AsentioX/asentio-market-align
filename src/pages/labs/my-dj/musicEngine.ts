// Music Engine: determines adaptive music parameters based on state

import { StateSnapshot, UserMode, BioInputs } from './stateEngine';

export interface MusicParams {
  bpm: number;
  energy: number;       // 0-100
  rhythmDensity: number; // 0-100
  vocalPresence: number; // 0-100 (0 = instrumental)
  harmonicTension: number; // 0-100 (0 = calm, 100 = intense)
  intensity: number;     // user-controlled 0-100
}

export interface NowPlaying {
  title: string;
  artist: string;
  genre: string;
  duration: number; // seconds
  elapsed: number;
  params: MusicParams;
}

// Simulated track library
const TRACK_DB: Array<{ title: string; artist: string; genre: string; duration: number; baseBpm: number; baseEnergy: number }> = [
  { title: 'Ocean Waves', artist: 'Ambient Drift', genre: 'Ambient', duration: 280, baseBpm: 60, baseEnergy: 15 },
  { title: 'Neural Flow', artist: 'Deep Work', genre: 'Lo-fi', duration: 240, baseBpm: 85, baseEnergy: 35 },
  { title: 'Sunrise Protocol', artist: 'Synth Runners', genre: 'Synthwave', duration: 210, baseBpm: 128, baseEnergy: 75 },
  { title: 'Midnight Pulse', artist: 'Beat Lab', genre: 'Electronic', duration: 195, baseBpm: 140, baseEnergy: 85 },
  { title: 'Forest Rain', artist: 'Nature Sound Co', genre: 'Nature', duration: 320, baseBpm: 55, baseEnergy: 10 },
  { title: 'Grind State', artist: 'Bass Theory', genre: 'Drum & Bass', duration: 180, baseBpm: 170, baseEnergy: 95 },
  { title: 'Warm Glow', artist: 'Piano Dusk', genre: 'Classical', duration: 300, baseBpm: 70, baseEnergy: 20 },
  { title: 'Steady Climb', artist: 'Tempo Match', genre: 'House', duration: 240, baseBpm: 125, baseEnergy: 65 },
  { title: 'Mind Garden', artist: 'Alpha Waves', genre: 'Binaural', duration: 360, baseBpm: 72, baseEnergy: 25 },
  { title: 'Thunder Drive', artist: 'Voltage', genre: 'Techno', duration: 200, baseBpm: 138, baseEnergy: 80 },
  { title: 'Silk Road', artist: 'World Beat', genre: 'World', duration: 260, baseBpm: 95, baseEnergy: 45 },
  { title: 'Cloud Nine', artist: 'Chill Factory', genre: 'Chillout', duration: 290, baseBpm: 90, baseEnergy: 30 },
];

export function computeMusicParams(state: StateSnapshot, bio: BioInputs, mode: UserMode, intensity: number): MusicParams {
  const intFactor = intensity / 100;

  switch (mode) {
    case 'calm': {
      // Counter stress: lower everything
      const stressFactor = Math.min(bio.stress / 100, 1);
      return {
        bpm: Math.round(80 - stressFactor * 15 - (1 - intFactor) * 10),
        energy: Math.round(20 - stressFactor * 10 + intFactor * 15),
        rhythmDensity: Math.round(15 + intFactor * 10),
        vocalPresence: Math.round(10 + intFactor * 20),
        harmonicTension: Math.round(10 + intFactor * 10),
        intensity,
      };
    }
    case 'focus': {
      return {
        bpm: Math.round(75 + intFactor * 25),
        energy: Math.round(30 + intFactor * 20),
        rhythmDensity: Math.round(30 + intFactor * 15),
        vocalPresence: Math.round(5 + intFactor * 10), // minimal vocals
        harmonicTension: Math.round(20 + intFactor * 10),
        intensity,
      };
    }
    case 'energize': {
      return {
        bpm: Math.round(110 + intFactor * 30),
        energy: Math.round(60 + intFactor * 35),
        rhythmDensity: Math.round(55 + intFactor * 30),
        vocalPresence: Math.round(40 + intFactor * 40),
        harmonicTension: Math.round(40 + intFactor * 30),
        intensity,
      };
    }
    case 'endurance': {
      // Match cadence
      const targetBpm = bio.cadence > 60 ? bio.cadence : 130;
      return {
        bpm: Math.round(targetBpm + intFactor * 10),
        energy: Math.round(55 + intFactor * 30),
        rhythmDensity: Math.round(60 + intFactor * 20),
        vocalPresence: Math.round(30 + intFactor * 30),
        harmonicTension: Math.round(35 + intFactor * 25),
        intensity,
      };
    }
    case 'recovery': {
      return {
        bpm: Math.round(65 - (1 - intFactor) * 10),
        energy: Math.round(15 + intFactor * 10),
        rhythmDensity: Math.round(10 + intFactor * 10),
        vocalPresence: Math.round(15 + intFactor * 15),
        harmonicTension: Math.round(5 + intFactor * 10),
        intensity,
      };
    }
  }
}

export function selectTrack(params: MusicParams): typeof TRACK_DB[number] {
  // Score tracks by how closely they match desired params
  let best = TRACK_DB[0];
  let bestScore = Infinity;
  for (const track of TRACK_DB) {
    const bpmDiff = Math.abs(track.baseBpm - params.bpm);
    const energyDiff = Math.abs(track.baseEnergy - params.energy);
    const score = bpmDiff * 0.5 + energyDiff * 0.5;
    if (score < bestScore) {
      bestScore = score;
      best = track;
    }
  }
  return best;
}

export function getTrackDB() {
  return TRACK_DB;
}
