/**
 * Resolve a brand logo URL from a card/membership name.
 * Uses Clearbit's free logo API (no key required) with a curated
 * domain map for common membership programs whose names don't map
 * directly to a domain.
 */

const DOMAIN_MAP: Record<string, string> = {
  // Travel / loyalty
  'aaa': 'aaa.com',
  'aarp': 'aarp.org',
  'costco': 'costco.com',
  'sams club': 'samsclub.com',
  'sam\u2019s club': 'samsclub.com',
  'bjs': 'bjs.com',
  'bj\u2019s': 'bjs.com',
  // Credit cards
  'amex': 'americanexpress.com',
  'american express': 'americanexpress.com',
  'amex platinum': 'americanexpress.com',
  'amex gold': 'americanexpress.com',
  'chase': 'chase.com',
  'chase sapphire': 'chase.com',
  'chase sapphire reserve': 'chase.com',
  'chase sapphire preferred': 'chase.com',
  'capital one': 'capitalone.com',
  'capital one venture': 'capitalone.com',
  'citi': 'citi.com',
  'citibank': 'citi.com',
  'discover': 'discover.com',
  'wells fargo': 'wellsfargo.com',
  'bank of america': 'bankofamerica.com',
  'visa': 'visa.com',
  'mastercard': 'mastercard.com',
  // Airlines
  'delta': 'delta.com',
  'united': 'united.com',
  'american airlines': 'aa.com',
  'southwest': 'southwest.com',
  'jetblue': 'jetblue.com',
  'alaska': 'alaskaair.com',
  // Hotels
  'marriott': 'marriott.com',
  'marriott bonvoy': 'marriott.com',
  'hilton': 'hilton.com',
  'hilton honors': 'hilton.com',
  'hyatt': 'hyatt.com',
  'world of hyatt': 'hyatt.com',
  'ihg': 'ihg.com',
  'wyndham': 'wyndhamhotels.com',
  // Shopping / lifestyle
  'amazon': 'amazon.com',
  'amazon prime': 'amazon.com',
  'target': 'target.com',
  'walmart': 'walmart.com',
  'best buy': 'bestbuy.com',
  'rei': 'rei.com',
  'starbucks': 'starbucks.com',
  // Streaming / digital
  'netflix': 'netflix.com',
  'spotify': 'spotify.com',
  'apple': 'apple.com',
  'apple one': 'apple.com',
  'youtube': 'youtube.com',
  'disney': 'disneyplus.com',
  'disney+': 'disneyplus.com',
};

const guessDomainFromName = (name: string): string | null => {
  const cleaned = name.trim().toLowerCase();
  if (!cleaned) return null;

  // Direct match
  if (DOMAIN_MAP[cleaned]) return DOMAIN_MAP[cleaned];

  // Try progressively shorter prefixes (e.g. "Chase Sapphire Reserve Visa")
  const words = cleaned.split(/\s+/);
  for (let n = words.length; n >= 1; n--) {
    const key = words.slice(0, n).join(' ');
    if (DOMAIN_MAP[key]) return DOMAIN_MAP[key];
  }

  // Substring matches (e.g. anything containing "marriott")
  for (const key of Object.keys(DOMAIN_MAP)) {
    if (cleaned.includes(key)) return DOMAIN_MAP[key];
  }

  // Fallback: first word as a .com guess (e.g. "Hertz" -> hertz.com)
  const first = words[0].replace(/[^a-z0-9-]/g, '');
  if (first.length >= 3) return `${first}.com`;

  return null;
};

export const getBrandLogoUrl = (name: string, size = 128): string | null => {
  const domain = guessDomainFromName(name);
  if (!domain) return null;
  // Clearbit Logo API — free, no auth required
  return `https://logo.clearbit.com/${domain}?size=${size}`;
};
