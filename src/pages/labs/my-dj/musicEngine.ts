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

// Real track library — CC0 licensed tracks from OpenLo-Fi (public domain)
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
  // ── Calm & Recovery ──────────────────────────
  { title: 'Almost Floating', artist: 'OpenLo-Fi', genre: 'Ambient Drift', duration: 189, baseBpm: 58, baseEnergy: 12, url: '/tracks/almost-floating.mp3', modes: ['calm', 'recovery'] },
  { title: 'Drifting Through Fog', artist: 'OpenLo-Fi', genre: 'Ambient Drift', duration: 162, baseBpm: 55, baseEnergy: 10, url: '/tracks/drifting-through-fog.mp3', modes: ['calm', 'recovery'] },
  { title: 'Moonlit Moss', artist: 'OpenLo-Fi', genre: 'Ambient Drift', duration: 120, baseBpm: 60, baseEnergy: 14, url: '/tracks/moonlit-moss.mp3', modes: ['calm', 'recovery'] },
  { title: 'Sea Glass Evening', artist: 'OpenLo-Fi', genre: 'Ambient Drift', duration: 208, baseBpm: 62, baseEnergy: 15, url: '/tracks/sea-glass-evening.mp3', modes: ['calm', 'recovery'] },
  { title: 'Petals After Rain', artist: 'OpenLo-Fi', genre: 'Seasonal', duration: 124, baseBpm: 65, baseEnergy: 18, url: '/tracks/petals-after-rain.mp3', modes: ['calm'] },
  { title: 'Temple at Dawn', artist: 'OpenLo-Fi', genre: 'Zen Lo-Fi', duration: 113, baseBpm: 56, baseEnergy: 8, url: '/tracks/temple-at-dawn.mp3', modes: ['calm', 'recovery'] },
  { title: 'Teacup Morning Fog', artist: 'OpenLo-Fi', genre: 'Zen Lo-Fi', duration: 126, baseBpm: 58, baseEnergy: 10, url: '/tracks/teacup-morning-fog.mp3', modes: ['calm', 'recovery'] },
  { title: 'Satellite Lullaby', artist: 'OpenLo-Fi', genre: 'Ambient Drift', duration: 115, baseBpm: 54, baseEnergy: 8, url: '/tracks/satellite-lullaby.mp3', modes: ['recovery'] },
  { title: 'Polar Afterglow', artist: 'OpenLo-Fi', genre: 'Ambient Drift', duration: 283, baseBpm: 52, baseEnergy: 6, url: '/tracks/polar-afterglow.mp3', modes: ['recovery'] },

  // ── Focus ────────────────────────────────────
  { title: 'Chapter By Lamplight', artist: 'OpenLo-Fi', genre: 'Activities Lo-Fi', duration: 131, baseBpm: 78, baseEnergy: 30, url: '/tracks/chapter-by-lamplight.mp3', modes: ['focus'] },
  { title: '2 AM Debug Loop', artist: 'OpenLo-Fi', genre: 'Activities Lo-Fi', duration: 97, baseBpm: 82, baseEnergy: 35, url: '/tracks/2-am-debug-loop.mp3', modes: ['focus'] },
  { title: 'Terminal Rain', artist: 'OpenLo-Fi', genre: 'Activities Lo-Fi', duration: 110, baseBpm: 80, baseEnergy: 32, url: '/tracks/terminal-rain.mp3', modes: ['focus'] },
  { title: 'Morning Pages', artist: 'OpenLo-Fi', genre: 'Activities Lo-Fi', duration: 128, baseBpm: 76, baseEnergy: 28, url: '/tracks/morning-pages.mp3', modes: ['focus', 'calm'] },
  { title: 'Stacks of Quiet Hours', artist: 'OpenLo-Fi', genre: 'Activities Lo-Fi', duration: 140, baseBpm: 74, baseEnergy: 25, url: '/tracks/stacks-of-quiet-hours.mp3', modes: ['focus'] },
  { title: 'Dust and Hardcovers', artist: 'OpenLo-Fi', genre: 'Jazz Lounge', duration: 206, baseBpm: 72, baseEnergy: 28, url: '/tracks/dust-and-hardcovers.mp3', modes: ['focus', 'calm'] },
  { title: 'Aurora on Mute', artist: 'OpenLo-Fi', genre: 'Ambient Drift', duration: 145, baseBpm: 68, baseEnergy: 20, url: '/tracks/aurora-on-mute.mp3', modes: ['focus', 'calm'] },

  // ── Energize ─────────────────────────────────
  { title: 'Basement Groove 86', artist: 'OpenLo-Fi', genre: 'Funk Bounce', duration: 99, baseBpm: 118, baseEnergy: 72, url: '/tracks/basement-groove-86.mp3', modes: ['energize'] },
  { title: 'Burnt Sunset Groove', artist: 'OpenLo-Fi', genre: 'Funk Bounce', duration: 205, baseBpm: 112, baseEnergy: 68, url: '/tracks/burnt-sunset-groove.mp3', modes: ['energize'] },
  { title: 'Golden Afternoon Groove', artist: 'OpenLo-Fi', genre: 'Soul Lo-Fi', duration: 157, baseBpm: 108, baseEnergy: 62, url: '/tracks/golden-afternoon-groove.mp3', modes: ['energize'] },
  { title: 'Summer Curbside Glow', artist: 'OpenLo-Fi', genre: 'Funk Bounce', duration: 151, baseBpm: 115, baseEnergy: 65, url: '/tracks/summer-curbside-glow.mp3', modes: ['energize', 'endurance'] },

  // ── Endurance ────────────────────────────────
  { title: 'Cassette Basement Bounce', artist: 'OpenLo-Fi', genre: 'Funk Bounce', duration: 165, baseBpm: 128, baseEnergy: 70, url: '/tracks/cassette-basement-bounce.mp3', modes: ['endurance', 'energize'] },
  { title: 'Sunrise Stretch Flow', artist: 'OpenLo-Fi', genre: 'Activities Lo-Fi', duration: 165, baseBpm: 132, baseEnergy: 58, url: '/tracks/sunrise-stretch-flow.mp3', modes: ['endurance'] },
  { title: 'Glow on the Overpass', artist: 'OpenLo-Fi', genre: 'Chillhop', duration: 128, baseBpm: 125, baseEnergy: 55, url: '/tracks/glow-on-the-overpass.mp3', modes: ['endurance', 'energize'] },
  { title: 'Porchlight Golden Hour', artist: 'OpenLo-Fi', genre: 'Chillhop', duration: 117, baseBpm: 120, baseEnergy: 50, url: '/tracks/porchlight-golden-hour.mp3', modes: ['endurance'] },
  { title: 'Soft Gold Sky', artist: 'OpenLo-Fi', genre: 'Chillhop', duration: 117, baseBpm: 122, baseEnergy: 48, url: '/tracks/soft-gold-sky.mp3', modes: ['endurance'] },

  // ── Expanded Library ────────────────────────
  // Activities Lo-Fi
  { title: 'Pixel Quest Save Point', artist: 'OpenLo-Fi', genre: 'Activities Lo-Fi', duration: 84, baseBpm: 76, baseEnergy: 26, url: '/tracks/pixel-quest-save-point.mp3', modes: ['focus'] },
  { title: 'Continue Screen Dreams', artist: 'OpenLo-Fi', genre: 'Activities Lo-Fi', duration: 95, baseBpm: 79, baseEnergy: 30, url: '/tracks/continue-screen-dreams.mp3', modes: ['focus'] },
  { title: 'Pancakes in the Sun', artist: 'OpenLo-Fi', genre: 'Activities Lo-Fi', duration: 107, baseBpm: 82, baseEnergy: 34, url: '/tracks/pancakes-in-the-sun.mp3', modes: ['focus'] },
  { title: 'First Coffee Thoughts', artist: 'OpenLo-Fi', genre: 'Activities Lo-Fi', duration: 94, baseBpm: 85, baseEnergy: 38, url: '/tracks/first-coffee-thoughts.mp3', modes: ['focus'] },
  // Ambient Drift
  { title: 'Warm Constellations', artist: 'OpenLo-Fi', genre: 'Ambient Drift', duration: 111, baseBpm: 54, baseEnergy: 6, url: '/tracks/warm-constellations.mp3', modes: ['recovery', 'calm'] },
  { title: 'Misty Mountain Sunrise', artist: 'OpenLo-Fi', genre: 'Ambient Drift', duration: 139, baseBpm: 57, baseEnergy: 10, url: '/tracks/misty-mountain-sunrise.mp3', modes: ['recovery', 'calm'] },
  { title: 'Green After Midnight', artist: 'OpenLo-Fi', genre: 'Ambient Drift', duration: 184, baseBpm: 60, baseEnergy: 14, url: '/tracks/green-after-midnight.mp3', modes: ['recovery', 'calm'] },
  // Zen Lo-Fi
  { title: 'Bells Before Sunrise', artist: 'OpenLo-Fi', genre: 'Zen Lo-Fi', duration: 139, baseBpm: 61, baseEnergy: 12, url: '/tracks/bells-before-sunrise.mp3', modes: ['calm', 'focus'] },
  { title: 'Misty Steam Quiet Dreams', artist: 'OpenLo-Fi', genre: 'Zen Lo-Fi', duration: 151, baseBpm: 64, baseEnergy: 16, url: '/tracks/misty-steam-quiet-dreams.mp3', modes: ['calm', 'focus'] },
  // Chillhop
  { title: 'Dusk Between Stoops', artist: 'OpenLo-Fi', genre: 'Chillhop', duration: 132, baseBpm: 96, baseEnergy: 44, url: '/tracks/dusk-between-stoops.mp3', modes: ['endurance', 'focus'] },
  { title: 'Window Seat Daydream', artist: 'OpenLo-Fi', genre: 'Chillhop', duration: 139, baseBpm: 99, baseEnergy: 48, url: '/tracks/window-seat-daydream.mp3', modes: ['endurance', 'focus'] },
  // Funk Bounce
  { title: 'Roller Rink Reverie', artist: 'OpenLo-Fi', genre: 'Funk Bounce', duration: 124, baseBpm: 111, baseEnergy: 59, url: '/tracks/roller-rink-reverie.mp3', modes: ['energize', 'endurance'] },
  { title: 'Neon on the Diner Floor', artist: 'OpenLo-Fi', genre: 'Funk Bounce', duration: 149, baseBpm: 114, baseEnergy: 63, url: '/tracks/neon-on-the-diner-floor.mp3', modes: ['energize', 'endurance'] },
  { title: 'Mirrorball Slow Roll', artist: 'OpenLo-Fi', genre: 'Funk Bounce', duration: 138, baseBpm: 117, baseEnergy: 67, url: '/tracks/mirrorball-slow-roll.mp3', modes: ['energize', 'endurance'] },
  // Hybrid
  { title: 'Cafe Da Tarde', artist: 'OpenLo-Fi', genre: 'Hybrid', duration: 109, baseBpm: 96, baseEnergy: 49, url: '/tracks/cafe-da-tarde.mp3', modes: ['focus', 'energize'] },
  { title: 'Savanna Slow Glow', artist: 'OpenLo-Fi', genre: 'Hybrid', duration: 174, baseBpm: 99, baseEnergy: 53, url: '/tracks/savanna-slow-glow.mp3', modes: ['focus', 'energize'] },
  // Jazz Lounge
  { title: 'Rain on the Boulevard', artist: 'OpenLo-Fi', genre: 'Jazz Lounge', duration: 89, baseBpm: 84, baseEnergy: 34, url: '/tracks/rain-on-the-boulevard.mp3', modes: ['focus', 'calm'] },
  { title: 'Breezy Afternoon Terrace', artist: 'OpenLo-Fi', genre: 'Jazz Lounge', duration: 89, baseBpm: 87, baseEnergy: 38, url: '/tracks/breezy-afternoon-terrace.mp3', modes: ['focus', 'calm'] },
  { title: 'Saxophone in the Rain', artist: 'OpenLo-Fi', genre: 'Jazz Lounge', duration: 98, baseBpm: 90, baseEnergy: 42, url: '/tracks/saxophone-in-the-rain.mp3', modes: ['focus', 'calm'] },
  // Late Night
  { title: '3 AM Echoes', artist: 'OpenLo-Fi', genre: 'Late Night', duration: 97, baseBpm: 64, baseEnergy: 14, url: '/tracks/3-am-echoes.mp3', modes: ['calm', 'recovery'] },
  { title: 'Empty Street Static', artist: 'OpenLo-Fi', genre: 'Late Night', duration: 99, baseBpm: 67, baseEnergy: 18, url: '/tracks/empty-street-static.mp3', modes: ['calm', 'recovery'] },
  { title: 'Rain Off the Neon Signs', artist: 'OpenLo-Fi', genre: 'Late Night', duration: 118, baseBpm: 70, baseEnergy: 22, url: '/tracks/rain-off-the-neon-signs.mp3', modes: ['calm', 'recovery'] },
  { title: 'Streetlights in the Rearview', artist: 'OpenLo-Fi', genre: 'Late Night', duration: 134, baseBpm: 73, baseEnergy: 26, url: '/tracks/streetlights-in-the-rearview.mp3', modes: ['calm', 'recovery'] },
  // Seasonal
  { title: 'Fireplace Loop', artist: 'OpenLo-Fi', genre: 'Seasonal', duration: 93, baseBpm: 66, baseEnergy: 16, url: '/tracks/fireplace-loop.mp3', modes: ['calm', 'focus'] },
  { title: 'Winter Turntable', artist: 'OpenLo-Fi', genre: 'Seasonal', duration: 108, baseBpm: 69, baseEnergy: 20, url: '/tracks/winter-turntable.mp3', modes: ['calm', 'focus'] },
  { title: 'Amber Sidewalks', artist: 'OpenLo-Fi', genre: 'Seasonal', duration: 111, baseBpm: 72, baseEnergy: 24, url: '/tracks/amber-sidewalks.mp3', modes: ['calm', 'focus'] },
  { title: 'After School Rain', artist: 'OpenLo-Fi', genre: 'Seasonal', duration: 97, baseBpm: 75, baseEnergy: 28, url: '/tracks/after-school-rain.mp3', modes: ['calm', 'focus'] },
  // Soul Lo-Fi
  { title: '3AM Sink Light', artist: 'OpenLo-Fi', genre: 'Soul Lo-Fi', duration: 98, baseBpm: 91, baseEnergy: 44, url: '/tracks/3am-sink-light.mp3', modes: ['energize', 'calm'] },
  { title: 'Slow Dance in the Living Room', artist: 'OpenLo-Fi', genre: 'Soul Lo-Fi', duration: 96, baseBpm: 94, baseEnergy: 48, url: '/tracks/slow-dance-in-the-living-room.mp3', modes: ['energize', 'calm'] },
  { title: 'Porcelain Heartbeat', artist: 'OpenLo-Fi', genre: 'Soul Lo-Fi', duration: 115, baseBpm: 97, baseEnergy: 52, url: '/tracks/porcelain-heartbeat.mp3', modes: ['energize', 'calm'] },
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
