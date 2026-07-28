// Asentio HAI Directory taxonomy — the shared vocabulary for the
// "Human Interface to AI" ecosystem. Used by filters, category pages,
// company cards, the market map and the admin forms.

export interface TaxonomyGroup {
  slug: string;
  label: string;
  blurb: string;
  children: string[];
}

export const TAXONOMY: TaxonomyGroup[] = [
  {
    slug: 'devices',
    label: 'Devices',
    blurb: 'The hardware people wear on their face, ears, wrist and hands.',
    children: [
      'AI Glasses',
      'AR Glasses',
      'VR/MR Headsets',
      'Hearables',
      'Smartwatches',
      'Smart Rings',
      'Other Wearables',
    ],
  },
  {
    slug: 'components',
    label: 'Components',
    blurb: 'The optics, silicon and sensing that make wearable computing possible.',
    children: [
      'Optics',
      'Waveguides',
      'Displays',
      'Cameras',
      'Sensors',
      'Audio',
      'Batteries',
      'Semiconductors',
    ],
  },
  {
    slug: 'artificial-intelligence',
    label: 'Artificial Intelligence',
    blurb: 'The intelligence layer turning sensors into understanding.',
    children: [
      'Multimodal AI',
      'Vision AI',
      'Contextual AI',
      'AI Assistants',
      'AI Agents',
      'Computer Vision',
      'Spatial AI',
      'Edge AI',
      'Voice AI',
    ],
  },
  {
    slug: 'platforms',
    label: 'Platforms',
    blurb: 'Operating systems, toolchains and spatial infrastructure.',
    children: [
      'Operating Systems',
      'SDKs',
      'Developer Tools',
      'Spatial Mapping',
      'Digital Twins',
      '3D Engines',
    ],
  },
  {
    slug: 'applications',
    label: 'Applications',
    blurb: 'Where the interface meets real human behavior.',
    children: [
      'Consumer',
      'Enterprise',
      'Industrial',
      'Healthcare',
      'Retail',
      'Navigation',
      'Accessibility',
      'Entertainment',
    ],
  },
  {
    slug: 'ecosystem',
    label: 'Ecosystem',
    blurb: 'Capital, manufacturing, distribution and research around the stack.',
    children: [
      'Investors',
      'Retailers',
      'Eyewear Companies',
      'OEM / ODM',
      'Manufacturing',
      'Research',
    ],
  },
];

/** Flat list of every leaf category. */
export const ALL_CATEGORIES: string[] = TAXONOMY.flatMap((g) => g.children);

/** The AI x XR discovery chips — the intersection Asentio cares most about. */
export const AI_XR_FILTERS: string[] = [
  'AI Glasses',
  'Multimodal AI',
  'Vision AI',
  'Egocentric Vision',
  'Contextual AI',
  'AI Assistants',
  'AI Agents',
  'Spatial AI',
  'Voice AI',
  'Translation',
  'Memory',
  'Computer Vision',
];

/** Ways a human actually interacts with a device. */
export const HUMAN_INTERFACE_MODES: string[] = [
  'Voice',
  'Vision',
  'Gesture',
  'Gaze',
  'Touch',
  'Audio',
  'Display',
  'Context',
];

export const COMPANY_TYPES: string[] = [
  'Device Maker',
  'Component Supplier',
  'AI Company',
  'Platform',
  'Application Developer',
  'Eyewear Company',
  'OEM / ODM',
  'Investor',
  'Research Institution',
  'Retailer',
];

export const FUNDING_STAGES: string[] = [
  'Bootstrapped',
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
  'Growth',
  'Public',
  'Subsidiary',
  'Acquired',
];

export const TARGET_MARKETS: string[] = [
  'Consumer',
  'Enterprise',
  'Industrial',
  'Healthcare',
  'Retail',
  'Education',
  'Defense',
  'Developer',
];

/** The market map stack, top (human) to bottom (applications). */
export const MARKET_STACK: { layer: string; items: string[] }[] = [
  { layer: 'Interface', items: ['Glasses', 'Audio', 'Wearables', 'Gesture', 'Voice'] },
  { layer: 'Devices', items: ['AI Glasses', 'AR Glasses', 'VR/MR Headsets', 'Hearables'] },
  { layer: 'Intelligence', items: ['Vision AI', 'Multimodal AI', 'AI Agents', 'Contextual AI', 'Spatial AI'] },
  { layer: 'Compute', items: ['Semiconductors', 'Edge AI', 'Sensors'] },
  { layer: 'Platforms', items: ['Operating Systems', 'SDKs', 'Spatial Mapping'] },
  { layer: 'Applications', items: ['Consumer', 'Enterprise', 'Industrial', 'Healthcare', 'Entertainment'] },
];

export const slugifyCategory = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const categoryFromSlug = (slug: string): string | undefined =>
  ALL_CATEGORIES.find((c) => slugifyCategory(c) === slug);

export const groupFromSlug = (slug: string): TaxonomyGroup | undefined =>
  TAXONOMY.find((g) => g.slug === slug);

/** SEO copy for a directory category page. */
export const categorySeo = (category: string) => ({
  title: `${category} Companies — HAI Directory | Asentio`,
  description: `Discover the ${category.toLowerCase()} companies building the human interface to AI. Products, technology, AI capabilities and market focus, tracked by Asentio.`,
});
