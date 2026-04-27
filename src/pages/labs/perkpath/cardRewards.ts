/**
 * Curated reward profiles for popular credit cards.
 *
 * These power "Pay with which card?" recommendations. Each profile lists:
 *  - per-category multipliers (e.g. dining 4x, travel 3x)
 *  - a base catch-all rate (everything else)
 *  - the rewards currency (cashback %, or points/miles)
 *  - the redemption value of 1 point in cents
 *
 * Multipliers are stored as the literal X-rate (3 = "3x") for points cards,
 * and as the literal % (2 = "2% back") for cashback cards. The engine knows
 * which one to convert to dollars based on `rewards_currency`.
 *
 * Numbers are publicly published rates as of late 2024/early 2025; users can
 * always override per card in the wallet editor.
 */
import type { PerkCategory } from '@/hooks/usePerkPath';

export type RewardsCurrency = 'cashback' | 'points';
export type RewardRates = Partial<Record<PerkCategory, number>>;

export interface RewardProfile {
  /** Per-category rate. Missing categories fall back to baseRate. */
  rewardRates: RewardRates;
  /** Catch-all rate for anything not in rewardRates. */
  baseRate: number;
  /** Cashback (% back) or points/miles (Nx). */
  currency: RewardsCurrency;
  /** Cents per point/mile when redeemed (e.g. 1.5 = 1.5¢ per point). */
  pointsValueCents: number;
}

/**
 * Catalog keyed by lowercase "name + tier" substrings. We match the longest
 * key first so "chase sapphire reserve" beats "chase".
 */
interface CatalogEntry {
  /** Lowercase tokens to match against `${name} ${tier}`.toLowerCase(). All must be present. */
  match: string[][];
  profile: RewardProfile;
}

const C = (
  rewardRates: RewardRates,
  baseRate: number,
  currency: RewardsCurrency,
  pointsValueCents: number,
): RewardProfile => ({ rewardRates, baseRate, currency, pointsValueCents });

const CATALOG: CatalogEntry[] = [
  // ───────────── Chase ─────────────
  {
    match: [['chase', 'sapphire', 'reserve']],
    profile: C({ travel: 3, dining: 3 }, 1, 'points', 1.5),
  },
  {
    match: [['chase', 'sapphire', 'preferred']],
    profile: C({ travel: 2, dining: 3, entertainment: 3, services: 3 }, 1, 'points', 1.25),
  },
  {
    match: [['chase', 'freedom', 'unlimited']],
    profile: C({ travel: 5, dining: 3, health: 3 }, 1.5, 'cashback', 1),
  },
  {
    match: [['chase', 'freedom', 'flex']],
    profile: C({ travel: 5, dining: 3, health: 3 }, 1, 'cashback', 1),
  },
  {
    match: [['ink', 'business', 'preferred']],
    profile: C({ travel: 3, services: 3, shopping: 3 }, 1, 'points', 1.25),
  },

  // ───────────── American Express ─────────────
  {
    match: [['amex', 'platinum'], ['american express', 'platinum']],
    profile: C({ travel: 5, dining: 1 }, 1, 'points', 2),
  },
  {
    match: [['amex', 'gold'], ['american express', 'gold']],
    profile: C({ dining: 4, shopping: 4, travel: 3 }, 1, 'points', 2),
  },
  {
    match: [['amex', 'green'], ['american express', 'green']],
    profile: C({ travel: 3, dining: 3 }, 1, 'points', 1.5),
  },
  {
    match: [['amex', 'blue', 'cash'], ['blue cash', 'preferred']],
    profile: C({ shopping: 6, entertainment: 6, auto: 3, travel: 3 }, 1, 'cashback', 1),
  },

  // ───────────── Capital One ─────────────
  {
    match: [['venture', 'x']],
    profile: C({ travel: 5 }, 2, 'points', 1.85),
  },
  {
    match: [['capital one', 'venture']],
    profile: C({ travel: 5 }, 2, 'points', 1.85),
  },
  {
    match: [['savor']],
    profile: C({ dining: 4, entertainment: 4 }, 1, 'cashback', 1),
  },
  {
    match: [['quicksilver']],
    profile: C({}, 1.5, 'cashback', 1),
  },

  // ───────────── Citi ─────────────
  {
    match: [['citi', 'double cash']],
    profile: C({}, 2, 'cashback', 1),
  },
  {
    match: [['citi', 'custom cash']],
    profile: C({ dining: 5, auto: 5, travel: 5, entertainment: 5, shopping: 5 }, 1, 'cashback', 1),
  },
  {
    match: [['citi', 'strata', 'premier'], ['citi', 'premier']],
    profile: C({ travel: 3, dining: 3, auto: 3, entertainment: 3 }, 1, 'points', 1.25),
  },

  // ───────────── Wells Fargo / BofA / Discover ─────────────
  {
    match: [['active cash']],
    profile: C({}, 2, 'cashback', 1),
  },
  {
    match: [['autograph', 'journey']],
    profile: C({ travel: 5, dining: 4 }, 1, 'points', 1.25),
  },
  {
    match: [['autograph']],
    profile: C({ travel: 3, dining: 3, auto: 3, entertainment: 3, services: 3 }, 1, 'points', 1.25),
  },
  {
    match: [['bilt']],
    profile: C({ dining: 3, travel: 2 }, 1, 'points', 1.5),
  },
  {
    match: [['premium rewards', 'elite']],
    profile: C({ travel: 2, dining: 2 }, 1.5, 'points', 1),
  },
  {
    match: [['premium rewards']],
    profile: C({ travel: 2, dining: 2 }, 1.5, 'points', 1),
  },
  {
    match: [['discover']],
    profile: C({}, 1, 'cashback', 1),
  },

  // ───────────── Co-branded travel ─────────────
  {
    match: [['delta', 'reserve']],
    profile: C({ travel: 3, dining: 1 }, 1, 'points', 1.2),
  },
  {
    match: [['delta', 'platinum']],
    profile: C({ travel: 3, dining: 2, shopping: 2 }, 1, 'points', 1.2),
  },
  {
    match: [['united', 'club', 'infinite']],
    profile: C({ travel: 4, dining: 2 }, 1, 'points', 1.2),
  },
  {
    match: [['united', 'quest']],
    profile: C({ travel: 3, dining: 2 }, 1, 'points', 1.2),
  },
  {
    match: [['marriott', 'bonvoy']],
    profile: C({ travel: 6, dining: 3 }, 2, 'points', 0.8),
  },
  {
    match: [['hilton', 'aspire']],
    profile: C({ travel: 7, dining: 7, entertainment: 7 }, 3, 'points', 0.5),
  },
  {
    match: [['hilton', 'surpass']],
    profile: C({ travel: 6, dining: 6, shopping: 4 }, 3, 'points', 0.5),
  },
  {
    match: [['world of hyatt']],
    profile: C({ travel: 4, dining: 2, services: 2 }, 1, 'points', 1.7),
  },
];

/** Find the best-matching profile for a given card name + tier (case-insensitive). */
export function getRewardProfile(name: string, tier?: string | null): RewardProfile | null {
  const haystack = `${name} ${tier ?? ''}`.toLowerCase();
  let best: CatalogEntry | null = null;
  let bestScore = 0;
  for (const entry of CATALOG) {
    for (const tokens of entry.match) {
      if (tokens.every(t => haystack.includes(t))) {
        // Score by total token length so more specific matches win
        const score = tokens.reduce((a, t) => a + t.length, 0);
        if (score > bestScore) {
          best = entry;
          bestScore = score;
        }
      }
    }
  }
  return best ? best.profile : null;
}

/**
 * Compute the effective % return a card earns on a given category.
 * Returns a percentage (e.g. 4.5 means 4.5% back).
 */
export function effectiveReturnPct(
  profile: Pick<RewardProfile, 'rewardRates' | 'baseRate' | 'currency' | 'pointsValueCents'>,
  category: PerkCategory | null | undefined,
): number {
  const rate = (category && profile.rewardRates[category]) ?? profile.baseRate;
  if (profile.currency === 'cashback') return rate; // already a %
  // Points: rate × cents-per-point ≈ effective % back per dollar spent
  return rate * profile.pointsValueCents;
}

/** Human label for the rate ("3x points · 1.5¢ each" or "2% cash back"). */
export function rateLabel(
  profile: Pick<RewardProfile, 'rewardRates' | 'baseRate' | 'currency' | 'pointsValueCents'>,
  category: PerkCategory | null | undefined,
): string {
  const rate = (category && profile.rewardRates[category]) ?? profile.baseRate;
  if (profile.currency === 'cashback') return `${rate}% cash back`;
  const cpp = profile.pointsValueCents;
  return `${rate}x points · ${cpp.toFixed(cpp % 1 === 0 ? 0 : 2)}¢ each`;
}
