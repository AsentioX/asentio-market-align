import type { Perk } from '@/hooks/usePerkPath';
import type { PerkCategory } from '@/hooks/usePerkPath';

export interface PurchaseInput {
  merchant: string;
  category: PerkCategory | 'any';
  amount: number; // 0 means unspecified
}

export interface RankedOption {
  membershipId: string;
  membershipName: string;
  brandColor: string;
  logo: string;
  category: 'financial' | 'lifestyle';
  pillar: string;
  bestPerk: Perk | null;
  matchScore: number;
  estimatedSavings: number; // in dollars, 0 if unknown
  reason: string;
}

// Try to extract a percentage or fixed-dollar value from a perk's value_label
// Examples: "5% Back", "3x Points", "$50 Credit", "Free", "Up to 35% Off", "15% Off"
function estimateValue(perk: Perk, amount: number): { dollars: number; reason: string } {
  if (amount <= 0) return { dollars: 0, reason: perk.value_label };
  const label = perk.value_label.toLowerCase();

  // Free => assume full value (capped at $100 to be conservative)
  if (/\bfree\b/.test(label)) {
    return { dollars: Math.min(amount, 100), reason: `${perk.value_label} (est.)` };
  }

  // Fixed $ credit
  const dollarMatch = label.match(/\$(\d+(?:\.\d+)?)/);
  if (dollarMatch) {
    const v = Math.min(parseFloat(dollarMatch[1]), amount);
    return { dollars: v, reason: `${perk.value_label} applied` };
  }

  // Points multiplier (3x, 5x) — assume 1 point ≈ $0.015 (standard travel valuation)
  const xMatch = label.match(/(\d+(?:\.\d+)?)x\s*(points|miles)?/);
  if (xMatch) {
    const mult = parseFloat(xMatch[1]);
    const earnRate = mult * 0.015; // multiplier × per-point value
    return { dollars: amount * earnRate, reason: `${mult}x points ≈ ${(earnRate * 100).toFixed(1)}% back` };
  }

  // Cash back % or discount %
  const pctMatch = label.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]) / 100;
    return { dollars: amount * pct, reason: `${(pct * 100).toFixed(0)}% of $${amount.toFixed(2)}` };
  }

  return { dollars: 0, reason: perk.value_label };
}

// Score how well a perk matches a planned purchase
function scorePerk(perk: Perk, input: PurchaseInput): number {
  const merchant = input.merchant.toLowerCase().trim();
  let score = 0;

  // Category match (strong signal)
  if (input.category !== 'any') {
    if (perk.category === input.category) score += 10;
    if (perk.perk_tags.includes(input.category)) score += 5;
    if (perk.membership?.perk_tags.includes(input.category)) score += 3;
  } else {
    // Generic match — any perk could apply, but lower baseline
    score += 1;
  }

  // Merchant text match
  if (merchant) {
    const venue = (perk.venue ?? '').toLowerCase();
    const title = perk.title.toLowerCase();
    const tags = perk.perk_tags.join(' ').toLowerCase();
    const memTags = (perk.membership?.perk_tags ?? []).join(' ').toLowerCase();

    if (venue === merchant) score += 20;
    else if (venue.includes(merchant) || merchant.includes(venue)) score += 12;
    if (title.includes(merchant)) score += 5;
    if (tags.includes(merchant)) score += 4;
    if (memTags.includes(merchant)) score += 2;

    // Generic catch-alls (e.g. "All Restaurants", "Nationwide", "Airlines Direct")
    if (/^(all|any|nationwide|various|airlines)/i.test(perk.venue ?? '')) score += 1;
  }

  return score;
}

export function rankPurchaseOptions(
  perks: Perk[],
  memberships: Array<{ id: string; name: string; brand_color: string; logo: string; category: 'financial' | 'lifestyle'; pillar: string }>,
  input: PurchaseInput,
): RankedOption[] {
  const byMembership = new Map<string, RankedOption>();

  for (const m of memberships) {
    byMembership.set(m.id, {
      membershipId: m.id,
      membershipName: m.name,
      brandColor: m.brand_color,
      logo: m.logo,
      category: m.category,
      pillar: m.pillar,
      bestPerk: null,
      matchScore: 0,
      estimatedSavings: 0,
      reason: 'No matching perk',
    });
  }

  for (const perk of perks) {
    const score = scorePerk(perk, input);
    if (score <= 0) continue;
    const slot = byMembership.get(perk.membership_id);
    if (!slot) continue;
    if (score > slot.matchScore) {
      const { dollars, reason } = estimateValue(perk, input.amount);
      slot.bestPerk = perk;
      slot.matchScore = score;
      slot.estimatedSavings = dollars;
      slot.reason = reason;
    }
  }

  return Array.from(byMembership.values()).sort((a, b) => {
    // Primary: estimated savings (when amount provided)
    if (input.amount > 0 && b.estimatedSavings !== a.estimatedSavings) {
      return b.estimatedSavings - a.estimatedSavings;
    }
    // Secondary: match score
    return b.matchScore - a.matchScore;
  });
}
