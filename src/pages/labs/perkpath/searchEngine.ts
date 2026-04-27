import type { Perk } from '@/hooks/usePerkPath';

// Word-boundary matcher. Returns the strongest match kind for `needle` in `hay`,
// or null if it doesn't match at a word boundary.
//   'exact'        — entire string equals needle
//   'word-exact'   — needle equals a whole word in hay
//   'word-prefix'  — needle is a prefix of a word in hay (e.g. "her" matches "Hertz")
// We deliberately do NOT match arbitrary substrings inside words (so "hr" no
// longer matches "through" or "Hollywood").
type MatchKind = 'exact' | 'word-exact' | 'word-prefix' | null;
function matchKind(hay: string, needle: string): MatchKind {
  if (!hay || !needle) return null;
  if (hay === needle) return 'exact';
  // Split on anything that isn't a letter or digit so "McCormick & Schmick's" tokenizes cleanly.
  const tokens = hay.split(/[^a-z0-9]+/i).filter(Boolean);
  let best: MatchKind = null;
  for (const tok of tokens) {
    const t = tok.toLowerCase();
    if (t === needle) return 'word-exact';
    if (t.startsWith(needle)) best = best ?? 'word-prefix';
  }
  return best;
}

const KIND_MULTIPLIER: Record<Exclude<MatchKind, null>, number> = {
  'exact': 4,
  'word-exact': 3,
  'word-prefix': 1.5,
};

// Score how well a perk matches a search query. Higher = better. Null = no match.
function scoreMatch(perk: Perk, q: string): number | null {
  const needle = q.toLowerCase().trim();
  if (!needle || needle.length < 2) return null;

  // Drop how_to_redeem from the haystack — it's noisy prose ("buy through…",
  // "register at…") that produced confusing brand-name matches.
  const haystacks: Array<{ text: string; weight: number }> = [
    { text: perk.venue ?? '', weight: 6 },
    { text: perk.title, weight: 4 },
    { text: perk.membership?.name ?? '', weight: 3 },
    { text: perk.perk_tags.join(' '), weight: 3 },
    { text: perk.membership?.perk_tags.join(' ') ?? '', weight: 2 },
    { text: perk.category, weight: 2 },
  ];

  let score = 0;
  let matched = false;
  for (const h of haystacks) {
    const kind = matchKind(h.text.toLowerCase(), needle);
    if (!kind) continue;
    matched = true;
    score += h.weight * KIND_MULTIPLIER[kind];
  }

  if (matched && perk.membership?.category === 'financial') score += 1;
  return matched ? score : null;
}

export interface SearchMatch {
  best: Perk;
  stack: Perk[];
}

export function searchPerks(perks: Perk[], query: string): SearchMatch | null {
  const scored = perks
    .map(p => ({ perk: p, score: scoreMatch(p, query) }))
    .filter((x): x is { perk: Perk; score: number } => x.score !== null)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const best = scored[0].perk;

  // Build a stack: top scoring perks from DIFFERENT memberships
  const stack: Perk[] = [];
  const seenMemberships = new Set<string>([best.membership_id]);
  for (const { perk } of scored.slice(1)) {
    if (seenMemberships.has(perk.membership_id)) continue;
    stack.push(perk);
    seenMemberships.add(perk.membership_id);
    if (stack.length >= 3) break;
  }

  return { best, stack };
}
