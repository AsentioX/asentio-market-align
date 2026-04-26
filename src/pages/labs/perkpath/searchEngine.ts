import type { Perk } from '@/hooks/usePerkPath';

// Score how well a perk matches a search query.
// Higher = better. Returns null if it doesn't match at all.
function scoreMatch(perk: Perk, q: string): number | null {
  const needle = q.toLowerCase().trim();
  if (!needle) return null;

  const haystacks: Array<{ text: string; weight: number }> = [
    { text: perk.venue ?? '', weight: 5 },
    { text: perk.title, weight: 4 },
    { text: perk.membership?.name ?? '', weight: 3 },
    { text: perk.category, weight: 2 },
    { text: perk.perk_tags.join(' '), weight: 3 },
    { text: perk.membership?.perk_tags.join(' ') ?? '', weight: 2 },
    { text: perk.how_to_redeem ?? '', weight: 1 },
  ];

  let score = 0;
  let matched = false;
  for (const h of haystacks) {
    const hay = h.text.toLowerCase();
    if (!hay) continue;
    if (hay === needle) { score += h.weight * 3; matched = true; }
    else if (hay.startsWith(needle)) { score += h.weight * 2; matched = true; }
    else if (hay.includes(needle)) { score += h.weight; matched = true; }
  }

  // Bonus for financial perks (raw value is usually higher)
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
