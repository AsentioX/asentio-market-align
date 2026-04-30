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

  // ── Vocal / Indie (CC0, HoliznaCC0) — songs WITH LYRICS ─────────
  { title: 'Garden Eyes', artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 184, baseBpm: 72, baseEnergy: 30, url: '/tracks/garden-eyes.mp3', modes: ['calm', 'focus'] },
  { title: 'Eden', artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 392, baseBpm: 70, baseEnergy: 28, url: '/tracks/eden.mp3', modes: ['calm', 'recovery'] },
  { title: 'A Cloud Dog Named Sky', artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 412, baseBpm: 68, baseEnergy: 26, url: '/tracks/cloud-dog-named-sky.mp3', modes: ['calm', 'recovery'] },
  { title: 'The Wind That Whistled Through the Wicker Chair', artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 281, baseBpm: 76, baseEnergy: 34, url: '/tracks/wind-whistled-wicker-chair.mp3', modes: ['calm', 'focus'] },
  { title: 'Iron Skies', artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 296, baseBpm: 82, baseEnergy: 42, url: '/tracks/iron-skies.mp3', modes: ['focus', 'energize'] },
  { title: 'Goodbye Good Times', artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 223, baseBpm: 88, baseEnergy: 50, url: '/tracks/goodbye-good-times.mp3', modes: ['focus', 'energize'] },
  { title: 'A Small Town on Pluto', artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 189, baseBpm: 92, baseEnergy: 55, url: '/tracks/small-town-on-pluto.mp3', modes: ['energize', 'focus'] },
  { title: 'Your Nature', artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 283, baseBpm: 96, baseEnergy: 58, url: '/tracks/your-nature.mp3', modes: ['energize', 'endurance'] },
  { title: "Won't Need Money Where I'm Going", artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 280, baseBpm: 104, baseEnergy: 64, url: '/tracks/wont-need-money.mp3', modes: ['energize', 'endurance'] },
  { title: 'The Sound of Violent Lovers', artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 253, baseBpm: 112, baseEnergy: 70, url: '/tracks/sound-of-violent-lovers.mp3', modes: ['energize', 'endurance'] },
  { title: 'Smile and Nod', artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 103, baseBpm: 118, baseEnergy: 75, url: '/tracks/smile-and-nod.mp3', modes: ['energize', 'endurance'] },
  { title: 'Willy Loman', artist: 'HoliznaCC0', genre: 'Indie Vocal', duration: 258, baseBpm: 100, baseEnergy: 60, url: '/tracks/willy-loman.mp3', modes: ['energize', 'focus'] },
];

export function computeMusicParams(state: StateSnapshot, bio: BioInputs, mode: UserMode, intensity: number): MusicParams {
  const intFactor = intensity / 100;

  switch (mode) {
    case 'calm': {
      const stressFactor = Math.min(bio.stress / 100, 1);
      // Low HRV (< 40ms) → tension; pull BPM down a touch more to soothe
      const hrvCalm = bio.hrv < 40 ? (40 - bio.hrv) / 40 : 0; // 0..1
      return {
        bpm: Math.round(80 - stressFactor * 15 - hrvCalm * 5 - (1 - intFactor) * 10),
        energy: Math.round(20 - stressFactor * 10 - hrvCalm * 4 + intFactor * 15),
        rhythmDensity: Math.round(15 + intFactor * 10),
        vocalPresence: Math.round(10 + intFactor * 20),
        harmonicTension: Math.round(10 + intFactor * 10),
        intensity,
      };
    }
    case 'focus': {
      // Stressed / low-HRV / fatigued bodies → softer focus (counterbalance)
      const stressFactor = Math.min(bio.stress / 100, 1);
      const hrvDrag = bio.hrv < 40 ? (40 - bio.hrv) / 40 : 0;
      const fatigueDrag = bio.sleepScore < 50 ? (50 - bio.sleepScore) / 50 : 0;
      const ease = Math.min(1, stressFactor * 0.6 + hrvDrag * 0.3 + fatigueDrag * 0.3);
      return {
        bpm: Math.round(75 + intFactor * 25 - ease * 12),
        energy: Math.round(30 + intFactor * 20 - ease * 12),
        rhythmDensity: Math.round(30 + intFactor * 15 - ease * 10),
        vocalPresence: Math.round(5 + intFactor * 10),
        harmonicTension: Math.round(20 + intFactor * 10 - ease * 8),
        intensity,
      };
    }
    case 'energize': {
      // Don't push a stressed/depleted body harder — ease up slightly
      const stressFactor = Math.min(bio.stress / 100, 1);
      const hrvDrag = bio.hrv < 40 ? (40 - bio.hrv) / 40 : 0;
      const ease = Math.min(1, stressFactor * 0.5 + hrvDrag * 0.5);
      return {
        bpm: Math.round(110 + intFactor * 30 - ease * 10),
        energy: Math.round(60 + intFactor * 35 - ease * 12),
        rhythmDensity: Math.round(55 + intFactor * 30 - ease * 10),
        vocalPresence: Math.round(40 + intFactor * 40 - ease * 10),
        harmonicTension: Math.round(40 + intFactor * 30 - ease * 10),
        intensity,
      };
    }
    case 'endurance': {
      // Mirror cadence, but floor at 110 so warm-up / cycling cadences still feel like endurance.
      // Add a small lift from elevated HR.
      const cadenceTarget = bio.cadence > 60 ? Math.max(110, bio.cadence) : 130;
      const hrLift = bio.heartRate > 120 ? Math.min(8, (bio.heartRate - 120) / 5) : 0;
      return {
        bpm: Math.round(cadenceTarget + intFactor * 10 + hrLift),
        energy: Math.round(55 + intFactor * 30 + hrLift * 0.5),
        rhythmDensity: Math.round(60 + intFactor * 20),
        vocalPresence: Math.round(30 + intFactor * 30),
        harmonicTension: Math.round(35 + intFactor * 25),
        intensity,
      };
    }
    case 'recovery': {
      // Deeper recovery when more depleted: poor sleep / low HRV → slower & lower energy
      const hrvDrag = bio.hrv < 50 ? (50 - bio.hrv) / 50 : 0;        // 0..1
      const sleepDrag = bio.sleepScore < 60 ? (60 - bio.sleepScore) / 60 : 0; // 0..1
      const depletion = Math.min(1, hrvDrag * 0.6 + sleepDrag * 0.6);
      return {
        bpm: Math.round(65 - (1 - intFactor) * 10 - depletion * 8),
        energy: Math.round(15 + intFactor * 10 - depletion * 8),
        rhythmDensity: Math.round(10 + intFactor * 10 - depletion * 5),
        vocalPresence: Math.round(15 + intFactor * 15 - depletion * 6),
        harmonicTension: Math.round(5 + intFactor * 10),
        intensity,
      };
    }
  }
}

// Remember the last few tracks so the engine cycles through the catalog
const recentlyPlayed: string[] = [];
const RECENT_MEMORY = 8;

/** Per-intent flavor that biases track selection on top of the mode + params */
export interface SelectionFlavor {
  vocals: 'prefer' | 'avoid' | 'any';
  genres?: string[];
  bpmBias?: number;
  energyBias?: number;
}

const VOCAL_GENRE = 'Indie Vocal';

export function selectTrack(
  params: MusicParams,
  mode: UserMode,
  flavor?: SelectionFlavor
): typeof TRACK_DB[number] {
  // Filter to tracks that match the current mode
  const modeTracks = TRACK_DB.filter(t => t.modes.includes(mode));
  const pool = modeTracks.length > 0 ? modeTracks : TRACK_DB;

  // Apply intent's bpm/energy biases to the target so fit-scoring shifts accordingly
  const targetBpm = params.bpm + (flavor?.bpmBias ?? 0);
  const targetEnergy = params.energy + (flavor?.energyBias ?? 0);

  // Score every track by param proximity (lower = better fit) plus intent bonuses
  const scored = pool.map(track => {
    const bpmDiff = Math.abs(track.baseBpm - targetBpm);
    const energyDiff = Math.abs(track.baseEnergy - targetEnergy);
    let fitScore = bpmDiff * 0.4 + energyDiff * 0.6;

    // Vocal preference: each genre is ~10pts; treat vocal bonus on the same scale
    if (flavor) {
      const isVocal = track.genre === VOCAL_GENRE;
      if (flavor.vocals === 'prefer' && isVocal) fitScore -= 12;
      if (flavor.vocals === 'prefer' && !isVocal) fitScore += 4;
      if (flavor.vocals === 'avoid' && isVocal) fitScore += 20;

      // Genre preference: strong nudge toward listed genres
      if (flavor.genres?.includes(track.genre)) fitScore -= 10;
    }

    return { track, fitScore };
  });

  // Exclude recently-played; if pool is too small, only exclude the very last
  const memory = pool.length > RECENT_MEMORY ? RECENT_MEMORY : 1;
  const recent = recentlyPlayed.slice(-memory);
  let candidates = scored.filter(s => !recent.includes(s.track.url));
  if (candidates.length === 0) candidates = scored;

  // Take the top half of best-fitting candidates, then pick randomly among them
  candidates.sort((a, b) => a.fitScore - b.fitScore);
  const topN = Math.max(3, Math.ceil(candidates.length / 2));
  const top = candidates.slice(0, topN);
  const pick = top[Math.floor(Math.random() * top.length)].track;

  recentlyPlayed.push(pick.url);
  if (recentlyPlayed.length > RECENT_MEMORY * 2) recentlyPlayed.shift();
  return pick;
}

export function getTrackDB() {
  return TRACK_DB;
}
