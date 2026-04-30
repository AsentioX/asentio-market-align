// YouTube track selection: builds adaptive search queries from intent + biometrics,
// optionally anchored to a user-supplied seed song.
import { supabase } from '@/integrations/supabase/client';
import { MusicParams, SelectionFlavor } from './musicEngine';
import { UserMode } from './stateEngine';

export interface YouTubeTrack {
  videoId: string;
  title: string;
  channel: string;
  thumbnail?: string;
}

export interface YouTubeSeed {
  videoId: string;
  title: string;
  channel: string;
  /** Keywords extracted from title/tags to color future queries */
  keywords: string[];
}

const MOOD_TERMS_BY_MODE: Record<UserMode, string[]> = {
  calm: ['ambient', 'lo-fi chill', 'soft', 'relaxing', 'peaceful'],
  recovery: ['ambient sleep', 'deep rest', 'meditation', 'binaural calm'],
  focus: ['lo-fi beats focus', 'instrumental study', 'concentration', 'deep work'],
  energize: ['upbeat', 'feel good', 'house', 'dance', 'party hits'],
  endurance: ['running mix', 'workout', 'cardio beats', 'high energy edm'],
};

function bpmTerm(bpm: number): string {
  if (bpm < 70) return 'slow';
  if (bpm < 90) return 'mid-tempo';
  if (bpm < 115) return 'upbeat';
  if (bpm < 135) return 'dance tempo';
  return 'fast';
}

function energyTerm(energy: number): string {
  if (energy < 25) return 'mellow';
  if (energy < 50) return 'easy';
  if (energy < 70) return 'lively';
  return 'high energy';
}

function vocalTerm(flavor?: SelectionFlavor | null): string | null {
  if (!flavor) return null;
  if (flavor.vocals === 'avoid') return 'instrumental';
  if (flavor.vocals === 'prefer') return 'with vocals';
  return null;
}

/** Build a search query string from current adaptive params + optional seed */
export function buildYouTubeQuery(
  params: MusicParams,
  mode: UserMode,
  flavor?: SelectionFlavor | null,
  seed?: YouTubeSeed | null,
): string {
  const moods = MOOD_TERMS_BY_MODE[mode] ?? [];
  const mood = moods[Math.floor(Math.random() * moods.length)] ?? '';
  const parts: string[] = [];

  if (seed) {
    // Anchor to seed: take 1-2 of its keywords + 1 mood + tempo descriptor
    const seedKw = seed.keywords.slice(0, 2).join(' ');
    if (seedKw) parts.push(seedKw);
    parts.push(mood);
    parts.push(bpmTerm(params.bpm));
  } else {
    parts.push(mood);
    parts.push(bpmTerm(params.bpm));
    parts.push(energyTerm(params.energy));
    if (flavor?.genres?.length) {
      parts.push(flavor.genres[Math.floor(Math.random() * flavor.genres.length)]);
    }
  }

  const v = vocalTerm(flavor);
  if (v) parts.push(v);
  parts.push('music');
  return parts.filter(Boolean).join(' ');
}

const STOP_WORDS = new Set([
  'official','video','music','audio','lyrics','feat','ft','featuring','the','a','an',
  'with','and','of','in','on','to','remix','version','hd','hq','mv','live','remastered',
]);

function extractKeywords(title: string, channel: string, tags: string[] = []): string[] {
  const fromTitle = title
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .split(/[\s\-–—|·•:,/]+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const fromTags = tags.slice(0, 5).flatMap(t =>
    t.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
  );
  const channelKw = channel.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const all = [...fromTitle, ...fromTags, ...channelKw];
  // dedupe, keep order
  const seen = new Set<string>();
  const uniq: string[] = [];
  for (const w of all) {
    if (!seen.has(w)) { seen.add(w); uniq.push(w); }
    if (uniq.length >= 8) break;
  }
  return uniq;
}

// In-memory page cache so previous/next can walk the same result list
let lastResults: YouTubeTrack[] = [];
let lastIndex = -1;
let lastPageToken: string | undefined;
let lastQuery: string | null = null;

export function resetYouTubeCache() {
  lastResults = [];
  lastIndex = -1;
  lastPageToken = undefined;
  lastQuery = null;
}

async function searchYouTube(query: string, pageToken?: string): Promise<{ items: YouTubeTrack[]; nextPageToken?: string }> {
  const { data, error } = await supabase.functions.invoke('mydj-youtube-search', {
    body: { query, pageToken },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return { items: data?.items ?? [], nextPageToken: data?.nextPageToken };
}

/** Pick the next adaptive YouTube track. Uses a sliding cache to avoid hammering quota. */
export async function selectYouTubeTrack(
  params: MusicParams,
  mode: UserMode,
  flavor?: SelectionFlavor | null,
  seed?: YouTubeSeed | null,
  forceNewQuery = false,
): Promise<YouTubeTrack | null> {
  // Walk cached results first when same query and not forced
  if (!forceNewQuery && lastResults.length > 0 && lastIndex < lastResults.length - 1) {
    lastIndex += 1;
    return lastResults[lastIndex];
  }

  const query = buildYouTubeQuery(params, mode, flavor, seed);
  const usePageToken = !forceNewQuery && query === lastQuery ? lastPageToken : undefined;

  try {
    const { items, nextPageToken } = await searchYouTube(query, usePageToken);
    if (items.length === 0) return null;
    lastResults = items;
    lastIndex = 0;
    lastPageToken = nextPageToken;
    lastQuery = query;
    return items[0];
  } catch (err) {
    console.warn('YouTube search failed:', err);
    return null;
  }
}

export function previousYouTubeTrack(): YouTubeTrack | null {
  if (lastIndex > 0) {
    lastIndex -= 1;
    return lastResults[lastIndex];
  }
  return null;
}

/** Search for a specific song the user typed, and convert it into a seed */
export async function lookupSeedSong(query: string): Promise<YouTubeSeed | null> {
  try {
    const { items } = await searchYouTube(query);
    if (items.length === 0) return null;
    const top = items[0];
    // Fetch details to grab tags
    let tags: string[] = [];
    try {
      const { data } = await supabase.functions.invoke('mydj-youtube-video', {
        body: { videoId: top.videoId },
      });
      if (data?.tags) tags = data.tags;
    } catch {/* ignore */}
    const keywords = extractKeywords(top.title, top.channel, tags);
    // Reset cache so next adaptive pick uses the new seed
    resetYouTubeCache();
    return { videoId: top.videoId, title: top.title, channel: top.channel, keywords };
  } catch (err) {
    console.warn('Seed lookup failed:', err);
    return null;
  }
}
