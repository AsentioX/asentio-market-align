/**
 * Card recommendation engine.
 *
 * Given the user's wallet and a planned purchase (category + amount + optional
 * perk discount), rank financial cards by their effective return.
 *
 * Effective return blends:
 *   1. Card rewards earned on the *post-discount* spend
 *   2. Any percentage discount the perk itself provides
 *
 * Output is suitable for both the Purchase tab (full ranked list with deltas)
 * and the perk drawer (top pick + 1–2 runners-up).
 */
import type { Membership, Perk, PerkCategory } from '@/hooks/usePerkPath';
import {
  effectiveReturnPct,
  rateLabel,
  type RewardProfile,
  type RewardsCurrency,
} from './cardRewards';

export interface CardRecommendation {
  membershipId: string;
  membershipName: string;
  brandColor: string;
  tier: string | null;
  /** Effective % back from card rewards alone (post-discount). */
  cardReturnPct: number;
  /** % discount applied by the perk itself, if any (0 when none). */
  perkDiscountPct: number;
  /** Combined effective % back: discount + (1 - discount) * cardReturn. */
  combinedReturnPct: number;
  /** Estimated dollars saved/earned on the planned amount. */
  estimatedDollars: number;
  /** Human readable rate ("4x points · 1.5¢ each" or "2% cash back"). */
  rateLabel: string;
  /** Currency the card pays in ("cashback" or "points"). */
  currency: RewardsCurrency;
  /** True if this is the user's preferred travel-rewards card (highest travel rate). */
  isTravelCard: boolean;
}

const profileFromMembership = (m: Membership): RewardProfile => ({
  rewardRates: m.reward_rates ?? {},
  baseRate: m.base_rate ?? 1,
  currency: m.rewards_currency ?? 'cashback',
  pointsValueCents: m.points_value_cents ?? 1,
});

/** Extract a discount % from a perk's value_label (e.g. "20% off Hertz" → 20). */
export function perkDiscountPct(perk: Perk | null | undefined): number {
  if (!perk) return 0;
  const m = perk.value_label.match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? parseFloat(m[1]) : 0;
}

/**
 * Pick the user's "primary travel card" — the financial card with the highest
 * effective return on `travel`. Used to compute the "vs travel card" delta.
 */
export function findPrimaryTravelCard(memberships: Membership[]): Membership | null {
  let best: Membership | null = null;
  let bestReturn = -1;
  for (const m of memberships) {
    if (m.category !== 'financial') continue;
    const ret = effectiveReturnPct(profileFromMembership(m), 'travel');
    if (ret > bestReturn) { best = m; bestReturn = ret; }
  }
  return best;
}

export interface RankInput {
  category: PerkCategory | null;
  amount: number; // 0 means unspecified — still rank by % but skip dollar math
  perk?: Perk | null;
}

/**
 * Rank all financial cards in the wallet by effective return for the input.
 * Returns sorted (best first); excludes lifestyle/membership cards.
 */
export function rankCardsForPurchase(
  memberships: Membership[],
  input: RankInput,
): CardRecommendation[] {
  const financial = memberships.filter(m => m.category === 'financial');
  if (financial.length === 0) return [];

  const travelCard = findPrimaryTravelCard(financial);
  const discountPct = perkDiscountPct(input.perk);

  const recs: CardRecommendation[] = financial.map(m => {
    const profile = profileFromMembership(m);
    const cardReturnPct = effectiveReturnPct(profile, input.category);
    // Combined: discount applies first, then card earns on the reduced spend.
    const d = discountPct / 100;
    const c = cardReturnPct / 100;
    const combinedFraction = d + (1 - d) * c;
    const combinedReturnPct = combinedFraction * 100;
    const estimatedDollars = input.amount > 0 ? input.amount * combinedFraction : 0;
    return {
      membershipId: m.id,
      membershipName: m.name,
      brandColor: m.brand_color,
      tier: m.tier,
      cardReturnPct,
      perkDiscountPct: discountPct,
      combinedReturnPct,
      estimatedDollars,
      rateLabel: rateLabel(profile, input.category),
      currency: profile.currency,
      isTravelCard: travelCard?.id === m.id,
    };
  });

  return recs.sort((a, b) => b.combinedReturnPct - a.combinedReturnPct);
}
