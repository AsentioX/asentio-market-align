// Music Engine: determines adaptive music parameters and selects real tracks

import { StateSnapshot, UserMode, BioInputs } from './stateEngine';

export interface MusicParams {
  bpm: number;
  energy: number;       // 0-100
  rhythmDensity: number; // 0-100
  vocalPresence: number; // 0-100
  harmonicTension: number; // 0-100
  intensity: number;     // user-controlled 0-100
}

export interface NowPlaying {
  title: string;
  artist: string;
  genre: string;
  duration: number; // seconds
  elapsed: number;
  params: MusicParams;
  url: string;
}

// Real track library — royalty-free tracks served from /public/tracks/
const TRACK_DB: Array<{
  title: string;
  artist: string;
  genre: string;
  duration: number;
  baseBpm: number;
  baseEnergy: number;
  url: string;
  modes: UserMode[];
}> = [
  {
    title: 'Weightless',
    artist: 'Ambient Drift',
    genre: 'Ambient',
    duration: 221,
    baseBpm: 60,
    baseEnergy: 15,
    url: '/tracks/calm-ambient.mp3',
    modes: ['calm', 'recovery'],
  },
  {
    title: 'Still Waters',
    artist: 'Meditation Sound',
    genre: 'Meditation',
    duration: 419,
    baseBpm: 55,
    baseEnergy: 10,
    url: '/tracks/calm-meditation.mp3',
    modes: ['calm', 'recovery'],
  },
  {
    title: 'Deep Current',
    artist: 'Lo-fi Lab',
    genre: 'Lo-fi',
    duration: 294,
    baseBpm: 85,
    baseEnergy: 35,
    url: '/tracks/focus-lofi.mp3',
    modes: ['focus', 'calm'],
  },
  {
    title: 'Clear Mind',
    artist: 'Alpha Waves',
    genre: 'Ambient Electronic',
    duration: 453,
    baseBpm: 78,
    baseEnergy: 30,
    url: '/tracks/focus-deep.mp3',
    modes: ['focus'],
  },
  {
    title: 'Neural Pathways',
    artist: 'Sound Architect',
    genre: 'Ambient',
    duration: 630,
    baseBpm: 72,
    baseEnergy: 25,
    url: '/tracks/focus-ambient.mp3',
    modes: ['focus', 'calm'],
  },
  {
    title: 'Voltage',
    artist: 'Synth Runners',
    genre: 'Electronic',
    duration: 638,
    baseBpm: 128,
    baseEnergy: 75,
    url: '/tracks/energize-electronic.mp3',
    modes: ['energize', 'endurance'],
  },
  {
    title: 'Rising Sun',
    artist: 'Beat Theory',
    genre: 'Upbeat Electronic',
    duration: 530,
    baseBpm: 120,
    baseEnergy: 70,
    url: '/tracks/energize-upbeat.mp3',
    modes: ['energize'],
  },
  {
    title: 'Steady Pace',
    artist: 'Tempo Match',
    genre: 'Driving',
    duration: 516,
    baseBpm: 135,
    baseEnergy: 65,
    url: '/tracks/endurance-drive.mp3',
    modes: ['endurance', 'energize'],
  },
  {
    title: 'Mile Marker',
    artist: 'Run Club',
    genre: 'Tempo',
    duration: 487,
    baseBpm: 140,
    baseEnergy: 60,
    url: '/tracks/endurance-tempo.mp3',
    modes: ['endurance'],
  },
  {
    title: 'Warm Glow',
    artist: 'Piano Dusk',
    genre: 'Classical',
    duration: 559,
    baseBpm: 70,
    baseEnergy: 20,
    url: '/tracks/recovery-piano.mp3',
    modes: ['recovery', 'calm'],
  },
];

export function computeMusicParams(state: StateSnapshot, bio: BioInputs, mode: UserMode, intensity: number): MusicParams {
  const intFactor = intensity / 100;

  switch (mode) {
    case 'calm': {
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
    case 'focus':
      return {
        bpm: Math.round(75 + intFactor * 25),
        energy: Math.round(30 + intFactor * 20),
        rhythmDensity: Math.round(30 + intFactor * 15),
        vocalPresence: Math.round(5 + intFactor * 10),
        harmonicTension: Math.round(20 + intFactor * 10),
        intensity,
      };
    case 'energize':
      return {
        bpm: Math.round(110 + intFactor * 30),
        energy: Math.round(60 + intFactor * 35),
        rhythmDensity: Math.round(55 + intFactor * 30),
        vocalPresence: Math.round(40 + intFactor * 40),
        harmonicTension: Math.round(40 + intFactor * 30),
        intensity,
      };
    case 'endurance': {
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
    case 'recovery':
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

let lastTrackUrl = '';

export function selectTrack(params: MusicParams, mode: UserMode): typeof TRACK_DB[number] {
  // Filter to tracks that match the current mode
  const modeTracks = TRACK_DB.filter(t => t.modes.includes(mode));
  const pool = modeTracks.length > 0 ? modeTracks : TRACK_DB;

  // Score tracks by param proximity, exclude last played
  let best = pool[0];
  let bestScore = Infinity;

  for (const track of pool) {
    if (track.url === lastTrackUrl && pool.length > 1) continue;

    const bpmDiff = Math.abs(track.baseBpm - params.bpm);
    const energyDiff = Math.abs(track.baseEnergy - params.energy);
    const score = bpmDiff * 0.4 + energyDiff * 0.6 + Math.random() * 15; // add randomness
    if (score < bestScore) {
      bestScore = score;
      best = track;
    }
  }

  lastTrackUrl = best.url;
  return best;
}

export function getTrackDB() {
  return TRACK_DB;
}
