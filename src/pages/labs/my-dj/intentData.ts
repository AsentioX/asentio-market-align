// Intent definitions: all the nuanced states users can express

export interface IntentFlavor {
  /** 'prefer' boosts vocal tracks, 'avoid' deprioritizes them, 'any' is neutral */
  vocals: 'prefer' | 'avoid' | 'any';
  /** Genres to boost in track selection (matched against TRACK_DB.genre) */
  genres?: string[];
  /** Small bias added on top of mode's BPM (-15..+15) */
  bpmBias?: number;
  /** Small bias added on top of mode's energy (-15..+15) */
  energyBias?: number;
}

export interface IntentDef {
  id: string;
  label: string;
  descriptor: string;
  dimension: 'mind' | 'emotion' | 'body' | 'social';
  gradient: { from: string; to: string };
  /** Maps to the engine's UserMode for playback */
  engineMode: 'calm' | 'focus' | 'energize' | 'endurance' | 'recovery';
  /** 0–100 intensity hint for the engine */
  intensityHint: number;
  /** How this intent flavors track selection on top of the mode */
  flavor: IntentFlavor;
}


export const INTENTS: IntentDef[] = [
  // 🧠 Mind
  { id: 'focus',       label: 'Focus',        descriptor: 'Lock in. Minimize distractions',         dimension: 'mind',    gradient: { from: '#6366f1', to: '#818cf8' }, engineMode: 'focus',     intensityHint: 60, flavor: { vocals: 'avoid',  genres: ['Activities Lo-Fi', 'Chillhop'] } },
  { id: 'deep-work',   label: 'Deep Work',    descriptor: 'Sustain attention. Reduce drift',        dimension: 'mind',    gradient: { from: '#4f46e5', to: '#7c3aed' }, engineMode: 'focus',     intensityHint: 80, flavor: { vocals: 'avoid',  genres: ['Activities Lo-Fi', 'Ambient Drift'], energyBias: -5 } },
  { id: 'creative',    label: 'Creative Flow', descriptor: 'Open, divergent thinking',              dimension: 'mind',    gradient: { from: '#a78bfa', to: '#c084fc' }, engineMode: 'focus',     intensityHint: 40, flavor: { vocals: 'any',    genres: ['Hybrid', 'Jazz Lounge'] } },
  { id: 'thoughtful',  label: 'Thoughtful',   descriptor: 'Deliberate, considered thinking',        dimension: 'mind',    gradient: { from: '#6d28d9', to: '#8b5cf6' }, engineMode: 'focus',     intensityHint: 35, flavor: { vocals: 'avoid',  genres: ['Jazz Lounge', 'Zen Lo-Fi'] } },
  { id: 'pensive',     label: 'Pensive',      descriptor: 'Slow thinking. Reflect inward',          dimension: 'mind',    gradient: { from: '#4c1d95', to: '#6d28d9' }, engineMode: 'calm',      intensityHint: 25, flavor: { vocals: 'prefer', genres: ['Indie Vocal', 'Late Night'] } },

  // ❤️ Emotion
  { id: 'calm',        label: 'Calm',         descriptor: 'Still water. Deep ease',                  dimension: 'emotion', gradient: { from: '#0ea5e9', to: '#38bdf8' }, engineMode: 'calm',      intensityHint: 50, flavor: { vocals: 'avoid',  genres: ['Ambient Drift', 'Zen Lo-Fi'] } },
  { id: 'happy',       label: 'Happy',        descriptor: 'Bright, warm, uplifted',                  dimension: 'emotion', gradient: { from: '#fbbf24', to: '#f59e0b' }, engineMode: 'energize',  intensityHint: 55, flavor: { vocals: 'prefer', genres: ['Soul Lo-Fi', 'Funk Bounce'] } },
  { id: 'confident',   label: 'Confident',    descriptor: 'Grounded power. Quiet strength',          dimension: 'emotion', gradient: { from: '#ef4444', to: '#f97316' }, engineMode: 'energize',  intensityHint: 65, flavor: { vocals: 'prefer', genres: ['Funk Bounce', 'Indie Vocal'], energyBias: 5 } },
  { id: 'romantic',    label: 'Romantic',      descriptor: 'Tender, intimate, warm',                 dimension: 'emotion', gradient: { from: '#ec4899', to: '#f472b6' }, engineMode: 'calm',      intensityHint: 40, flavor: { vocals: 'prefer', genres: ['Soul Lo-Fi', 'Jazz Lounge', 'Indie Vocal'] } },
  { id: 'flirty',      label: 'Flirty',       descriptor: 'Light, playful, magnetic',                dimension: 'emotion', gradient: { from: '#f472b6', to: '#fb7185' }, engineMode: 'energize',  intensityHint: 45, flavor: { vocals: 'prefer', genres: ['Soul Lo-Fi', 'Funk Bounce'] } },
  { id: 'melancholic', label: 'Melancholic',  descriptor: 'Beautiful sadness. Bittersweet',          dimension: 'emotion', gradient: { from: '#475569', to: '#64748b' }, engineMode: 'calm',      intensityHint: 30, flavor: { vocals: 'prefer', genres: ['Indie Vocal', 'Late Night', 'Jazz Lounge'] } },

  // ⚡ Body
  { id: 'energize',    label: 'Energize',     descriptor: 'Rise. Activate. Ignite',                  dimension: 'body',    gradient: { from: '#f59e0b', to: '#f97316' }, engineMode: 'energize',  intensityHint: 75, flavor: { vocals: 'prefer', genres: ['Funk Bounce', 'Indie Vocal'], bpmBias: 5 } },
  { id: 'endurance',   label: 'Endurance',    descriptor: 'Steady state. Push through',              dimension: 'body',    gradient: { from: '#10b981', to: '#14b8a6' }, engineMode: 'endurance', intensityHint: 70, flavor: { vocals: 'any',    genres: ['Funk Bounce', 'Chillhop'] } },
  { id: 'recover',     label: 'Recover',      descriptor: 'Cool down. Restore. Breathe',             dimension: 'body',    gradient: { from: '#818cf8', to: '#6366f1' }, engineMode: 'recovery',  intensityHint: 30, flavor: { vocals: 'avoid',  genres: ['Ambient Drift', 'Zen Lo-Fi'] } },
  { id: 'activate',    label: 'Activate',     descriptor: 'Wake up the body. Get moving',            dimension: 'body',    gradient: { from: '#fb923c', to: '#f97316' }, engineMode: 'energize',  intensityHint: 60, flavor: { vocals: 'prefer', genres: ['Soul Lo-Fi', 'Funk Bounce'] } },
  { id: 'slow-down',   label: 'Slow Down',    descriptor: 'Gradual deceleration',                    dimension: 'body',    gradient: { from: '#06b6d4', to: '#0ea5e9' }, engineMode: 'recovery',  intensityHint: 35, flavor: { vocals: 'avoid',  genres: ['Ambient Drift', 'Late Night'] } },

  // 🌍 Social / Context
  { id: 'party',       label: 'Party',        descriptor: 'Full energy. Lights up',                  dimension: 'social',  gradient: { from: '#f43f5e', to: '#e11d48' }, engineMode: 'energize',  intensityHint: 90, flavor: { vocals: 'prefer', genres: ['Funk Bounce', 'Indie Vocal'], bpmBias: 8, energyBias: 8 } },
  { id: 'dance',       label: 'Dance',        descriptor: 'Move your body. Groove',                  dimension: 'social',  gradient: { from: '#d946ef', to: '#c026d3' }, engineMode: 'energize',  intensityHint: 80, flavor: { vocals: 'prefer', genres: ['Funk Bounce', 'Soul Lo-Fi'] } },
  { id: 'social-vibe', label: 'Social Vibe',  descriptor: 'Background energy for connection',        dimension: 'social',  gradient: { from: '#fb7185', to: '#f472b6' }, engineMode: 'energize',  intensityHint: 50, flavor: { vocals: 'any',    genres: ['Chillhop', 'Soul Lo-Fi', 'Hybrid'] } },
  { id: 'ambient',     label: 'Ambient',      descriptor: 'Dissolve into the background',            dimension: 'social',  gradient: { from: '#94a3b8', to: '#64748b' }, engineMode: 'calm',      intensityHint: 20, flavor: { vocals: 'avoid',  genres: ['Ambient Drift', 'Zen Lo-Fi'] } },
  { id: 'date-night',  label: 'Date Night',   descriptor: 'Warm, sophisticated, just right',         dimension: 'social',  gradient: { from: '#be185d', to: '#ec4899' }, engineMode: 'calm',      intensityHint: 40, flavor: { vocals: 'prefer', genres: ['Jazz Lounge', 'Soul Lo-Fi', 'Indie Vocal'] } },
];

export const DIMENSION_META: Record<IntentDef['dimension'], { label: string; emoji: string }> = {
  mind:    { label: 'Mind',    emoji: '🧠' },
  emotion: { label: 'Emotion', emoji: '❤️' },
  body:    { label: 'Body',    emoji: '⚡' },
  social:  { label: 'Social',  emoji: '🌍' },
};

export const BLEND_LABELS: Record<string, string> = {
  'focus+calm':       'Stable Focus',
  'calm+focus':       'Stable Focus',
  'energize+happy':   'Uplifted Energy',
  'happy+energize':   'Uplifted Energy',
  'focus+energize':   'Power Focus',
  'energize+focus':   'Power Focus',
  'calm+happy':       'Bright Serenity',
  'happy+calm':       'Bright Serenity',
  'recover+calm':     'Deep Restore',
  'calm+recover':     'Deep Restore',
  'endurance+energize': 'Peak Drive',
  'energize+endurance': 'Peak Drive',
  'romantic+calm':    'Soft Glow',
  'calm+romantic':    'Soft Glow',
  'pensive+melancholic': 'Quiet Reflection',
  'melancholic+pensive': 'Quiet Reflection',
  'party+dance':      'Full Send',
  'dance+party':      'Full Send',
  'creative+calm':    'Wandering Mind',
  'calm+creative':    'Wandering Mind',
  'confident+energize': 'Unstoppable',
  'energize+confident': 'Unstoppable',
};

export function getBlendLabel(a: string, b: string): string {
  return BLEND_LABELS[`${a}+${b}`] || `${INTENTS.find(i => i.id === a)?.label} + ${INTENTS.find(i => i.id === b)?.label}`;
}

/** AI-style contextual suggestions based on time + physio state */
export function getSuggestions(
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
  physioState: string,
  location?: string
): IntentDef[] {
  const byId = (id: string) => INTENTS.find(i => i.id === id)!;

  if (physioState === 'stressed') {
    if (timeOfDay === 'evening' || timeOfDay === 'night') return [byId('calm'), byId('recover'), byId('pensive')];
    return [byId('calm'), byId('creative'), byId('slow-down')];
  }
  if (physioState === 'exercising') {
    return [byId('endurance'), byId('energize'), byId('activate')];
  }
  if (physioState === 'fatigued') {
    if (timeOfDay === 'morning') return [byId('activate'), byId('happy'), byId('energize')];
    return [byId('recover'), byId('calm'), byId('slow-down')];
  }

  // Time-based defaults
  if (timeOfDay === 'morning') return [byId('activate'), byId('focus'), byId('happy')];
  if (timeOfDay === 'afternoon') return [byId('focus'), byId('deep-work'), byId('energize')];
  if (timeOfDay === 'evening') return [byId('calm'), byId('social-vibe'), byId('romantic')];
  return [byId('calm'), byId('ambient'), byId('pensive')]; // night
}

export function getContextLine(
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
  physioState: string,
  sessionDuration?: number
): string {
  if (sessionDuration && sessionDuration > 7200) {
    return `You've been focused for ${Math.round(sessionDuration / 3600)} hours`;
  }
  if (physioState === 'stressed') return 'Elevated stress detected';
  if (physioState === 'exercising') return 'Active movement detected';
  if (physioState === 'fatigued') return 'Low energy detected';

  const timeLabels = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Late night' };
  return `${timeLabels[timeOfDay]} · ${physioState.charAt(0).toUpperCase() + physioState.slice(1)}`;
}
