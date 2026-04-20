import type { Category } from './vibinTheme';

export type CostLevel = '$' | '$$' | '$$$';
export type BestTime = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type Vibe = 'foodie' | 'scenic' | 'chill' | 'cultural' | 'active';
export type Pace = 'relaxed' | 'balanced' | 'packed';
export type Duration = 'half-day' | 'full-day' | 'multi-day' | '3hrs';

export interface VibinCard {
  id: string;
  title: string;
  image: string;
  category: Category;
  description: string;
  note?: string;
  tags: string[];
  durationMin: number; // estimated visit duration
  bestTime: BestTime;
  cost: CostLevel;
  locationName: string;
  lat: number;
  lng: number;
  tip?: string;
  createdAt: number;
  authorName?: string;
  liked?: boolean;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  duration: Duration;
  coverImage?: string;
  cardIds: string[];
  optionalCardIds?: string[];
  authorName?: string;
  createdAt: number;
}

export interface Trip {
  id: string;
  title: string;
  duration: Duration;
  vibe: Vibe;
  pace: Pace;
  cardIds: string[];
  startTime: string; // "10:00"
  createdAt: number;
}

export interface VibinState {
  cards: VibinCard[];
  decks: Deck[];
  trips: Trip[];
  profile: { name: string; handle: string; bio: string; avatar: string };
}
