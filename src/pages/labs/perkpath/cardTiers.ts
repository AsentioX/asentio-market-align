/**
 * Curated tier catalog for popular membership / credit card programs.
 * Used to suggest the available levels once the user types a card name,
 * so they can pick rather than guess the exact wording.
 */

interface TierCatalogEntry {
  /** Lowercase substrings that should match the user's card name */
  match: string[];
  /** Ordered list of tiers, lowest → highest where applicable */
  tiers: string[];
}

const CATALOG: TierCatalogEntry[] = [
  // ---------- Warehouse / auto / lifestyle memberships ----------
  { match: ['aaa'], tiers: ['Classic', 'Plus', 'Premier'] },
  { match: ['aarp'], tiers: ['Standard', 'Lifetime'] },
  { match: ['costco'], tiers: ['Gold Star', 'Executive', 'Business', 'Business Executive'] },
  { match: ['sams club', 'sam\u2019s club', "sam's club"], tiers: ['Club', 'Plus', 'Business'] },
  { match: ['bjs', 'bj\u2019s', "bj's"], tiers: ['Club', 'Club+'] },
  { match: ['rei'], tiers: ['Co-op Member'] },

  // ---------- Credit cards ----------
  { match: ['amex', 'american express'], tiers: ['Green', 'Gold', 'Platinum', 'Business Gold', 'Business Platinum', 'Centurion (Black)', 'Delta SkyMiles Gold', 'Delta SkyMiles Platinum', 'Delta SkyMiles Reserve', 'Hilton Honors', 'Hilton Honors Surpass', 'Hilton Honors Aspire', 'Marriott Bonvoy Brilliant'] },
  { match: ['chase sapphire'], tiers: ['Sapphire', 'Sapphire Preferred', 'Sapphire Reserve'] },
  { match: ['chase'], tiers: ['Freedom', 'Freedom Unlimited', 'Freedom Flex', 'Sapphire Preferred', 'Sapphire Reserve', 'Ink Business Cash', 'Ink Business Unlimited', 'Ink Business Preferred', 'United Explorer', 'United Quest', 'United Club Infinite', 'Marriott Bonvoy Boundless', 'Marriott Bonvoy Bountiful', 'World of Hyatt'] },
  { match: ['capital one venture'], tiers: ['VentureOne', 'Venture', 'Venture X'] },
  { match: ['capital one'], tiers: ['Quicksilver', 'SavorOne', 'Savor', 'VentureOne', 'Venture', 'Venture X', 'Spark Cash', 'Spark Miles'] },
  { match: ['citi'], tiers: ['Custom Cash', 'Double Cash', 'Premier', 'Prestige (legacy)', 'Strata Premier', 'AAdvantage Platinum Select', 'AAdvantage Executive'] },
  { match: ['discover'], tiers: ['it Cash Back', 'it Miles', 'it Chrome', 'it Student'] },
  { match: ['wells fargo'], tiers: ['Active Cash', 'Autograph', 'Autograph Journey', 'Reflect', 'Bilt'] },
  { match: ['bank of america'], tiers: ['Customized Cash Rewards', 'Travel Rewards', 'Premium Rewards', 'Premium Rewards Elite'] },

  // ---------- Airlines ----------
  { match: ['delta', 'skymiles'], tiers: ['Member', 'Silver Medallion', 'Gold Medallion', 'Platinum Medallion', 'Diamond Medallion'] },
  { match: ['united', 'mileageplus'], tiers: ['Member', 'Premier Silver', 'Premier Gold', 'Premier Platinum', 'Premier 1K', 'Global Services'] },
  { match: ['american airlines', 'aadvantage'], tiers: ['Member', 'Gold', 'Platinum', 'Platinum Pro', 'Executive Platinum', 'ConciergeKey'] },
  { match: ['southwest', 'rapid rewards'], tiers: ['Member', 'A-List', 'A-List Preferred', 'Companion Pass'] },
  { match: ['jetblue', 'trublue'], tiers: ['Member', 'Mosaic 1', 'Mosaic 2', 'Mosaic 3', 'Mosaic 4'] },
  { match: ['alaska', 'mileage plan'], tiers: ['Member', 'MVP', 'MVP Gold', 'MVP Gold 75K', 'MVP Gold 100K'] },

  // ---------- Hotels ----------
  { match: ['marriott', 'bonvoy'], tiers: ['Member', 'Silver Elite', 'Gold Elite', 'Platinum Elite', 'Titanium Elite', 'Ambassador Elite'] },
  { match: ['hilton', 'honors'], tiers: ['Member', 'Silver', 'Gold', 'Diamond'] },
  { match: ['hyatt'], tiers: ['Member', 'Discoverist', 'Explorist', 'Globalist'] },
  { match: ['ihg', 'one rewards'], tiers: ['Club', 'Silver Elite', 'Gold Elite', 'Platinum Elite', 'Diamond Elite'] },
  { match: ['wyndham'], tiers: ['Blue', 'Gold', 'Platinum', 'Diamond', 'Titanium'] },
  { match: ['choice', 'choice privileges'], tiers: ['Member', 'Gold', 'Platinum', 'Diamond'] },
  { match: ['best western'], tiers: ['Blue', 'Gold', 'Platinum', 'Diamond', 'Diamond Select'] },

  // ---------- Streaming / digital ----------
  { match: ['amazon prime'], tiers: ['Monthly', 'Annual', 'Student', 'Prime Access (EBT)'] },
  { match: ['netflix'], tiers: ['Standard with Ads', 'Standard', 'Premium'] },
  { match: ['spotify'], tiers: ['Free', 'Individual', 'Duo', 'Family', 'Student'] },
  { match: ['apple one'], tiers: ['Individual', 'Family', 'Premier'] },
  { match: ['youtube premium', 'youtube'], tiers: ['Individual', 'Family', 'Student'] },
  { match: ['disney+', 'disney plus'], tiers: ['Basic (with Ads)', 'Premium', 'Disney Bundle Duo', 'Disney Bundle Trio'] },
  { match: ['hbo', 'max'], tiers: ['With Ads', 'Ad-Free', 'Ultimate Ad-Free'] },

  // ---------- Coffee / shopping loyalty ----------
  { match: ['starbucks'], tiers: ['Star Member', 'Green', 'Gold'] },
  { match: ['target', 'circle'], tiers: ['Circle', 'Circle 360'] },
  { match: ['walmart', 'walmart+'], tiers: ['Walmart+'] },
  { match: ['best buy', 'my best buy'], tiers: ['My Best Buy', 'Plus', 'Total'] },
];

/**
 * Return the curated tier list for a given card name, or null if no match.
 */
export const getSuggestedTiers = (name: string): string[] | null => {
  const cleaned = name.trim().toLowerCase();
  if (cleaned.length < 2) return null;

  // Prefer the longest matching key so "Chase Sapphire" beats "Chase"
  let best: TierCatalogEntry | null = null;
  let bestLen = 0;
  for (const entry of CATALOG) {
    for (const key of entry.match) {
      if (cleaned.includes(key) && key.length > bestLen) {
        best = entry;
        bestLen = key.length;
      }
    }
  }
  return best ? best.tiers : null;
};
