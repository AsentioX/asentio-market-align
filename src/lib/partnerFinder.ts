// Partner Finder taxonomy + matching.
//
// The four widget columns (I Offer / I'm Building / I Need / Target Market)
// are user-friendly front-ends. Every option carries a hidden HAI Framework
// profile (human activities, capabilities, AI capabilities, interface,
// industry, ecosystem role) which is what actually drives ranking and the
// dynamic prioritisation between columns.

import { HAIDimensionKey } from '@/lib/haiFramework';
import { HAIUseCase } from '@/hooks/useHAIUseCases';
import { XRCompany, companyValues } from '@/hooks/useXRCompanies';

export interface PFOption {
  value: string;
  label: string;
  group: string;
  human_activities?: string[];
  human_capabilities?: string[];
  ai_capabilities?: string[];
  human_interface?: string[];
  industry_focus?: string[];
  ecosystem_roles?: string[];
  /** Free-text keywords used to link options to use-case records. */
  keywords?: string[];
}

const profileValues = (o: PFOption | undefined, key: HAIDimensionKey): string[] =>
  ((o as unknown as Record<string, string[] | undefined>)?.[key] || []) as string[];

const overlap = (a?: string[] | null, b?: string[] | null): string[] =>
  (a || []).filter((v) => (b || []).includes(v));

/* ------------------------------------------------------------------ */
/* 1. I Offer                                                          */
/* ------------------------------------------------------------------ */

export const OFFER_OPTIONS: PFOption[] = [
  // Devices
  { value: 'smart-glasses', label: 'Smart Glasses', group: 'Devices', human_interface: ['Personal Devices'], ecosystem_roles: ['Experience'], human_capabilities: ['Perceive'], human_activities: ['Observe', 'Collaborate', 'Learn', 'Navigate'], keywords: ['glasses', 'remote assist', 'inspection', 'training', 'navigation'] },
  { value: 'hearables', label: 'Hearables', group: 'Devices', human_interface: ['Personal Devices', 'Conversational'], ecosystem_roles: ['Experience'], human_capabilities: ['Communicate'], human_activities: ['Collaborate', 'Serve'], keywords: ['audio', 'translation', 'assistant'] },
  { value: 'smart-watch', label: 'Smart Watch', group: 'Devices', human_interface: ['Personal Devices'], ecosystem_roles: ['Experience'], human_activities: ['Observe', 'Protect'], keywords: ['fitness', 'wellness', 'wearable'] },
  { value: 'smart-ring', label: 'Smart Ring', group: 'Devices', human_interface: ['Personal Devices'], ecosystem_roles: ['Experience'], human_activities: ['Observe'], keywords: ['fitness', 'wellness', 'biometrics'] },
  { value: 'pendant', label: 'Pendant', group: 'Devices', human_interface: ['Personal Devices', 'Conversational'], ecosystem_roles: ['Experience'], human_activities: ['Collaborate'], keywords: ['assistant', 'memory'] },
  { value: 'mobile-device', label: 'Mobile Device', group: 'Devices', human_interface: ['Personal Devices'], ecosystem_roles: ['Experience'], keywords: ['phone', 'app'] },

  // Robotics
  { value: 'humanoid-robot', label: 'Humanoid Robot', group: 'Robotics', human_interface: ['Embodied'], ai_capabilities: ['Embody'], ecosystem_roles: ['Experience'], human_activities: ['Operate', 'Serve'], keywords: ['robot', 'material handling'] },
  { value: 'industrial-robot', label: 'Industrial Robot', group: 'Robotics', human_interface: ['Embodied'], ai_capabilities: ['Embody'], ecosystem_roles: ['Experience'], industry_focus: ['Manufacturing'], human_activities: ['Operate'], keywords: ['assembly', 'manufacturing'] },
  { value: 'service-robot', label: 'Service Robot', group: 'Robotics', human_interface: ['Embodied'], ai_capabilities: ['Embody'], ecosystem_roles: ['Experience'], human_activities: ['Serve'], keywords: ['hospitality', 'cleaning', 'delivery'] },
  { value: 'amr', label: 'AMR', group: 'Robotics', human_interface: ['Embodied'], ai_capabilities: ['Embody', 'Spatial'], ecosystem_roles: ['Experience'], industry_focus: ['Logistics'], human_activities: ['Operate', 'Navigate'], keywords: ['warehouse', 'logistics', 'picking'] },
  { value: 'drone', label: 'Drone', group: 'Robotics', human_interface: ['Embodied'], ai_capabilities: ['Embody', 'Perceive'], ecosystem_roles: ['Experience'], human_activities: ['Observe', 'Protect'], keywords: ['inspection', 'survey', 'security'] },
  { value: 'autonomous-vehicle', label: 'Autonomous Vehicle', group: 'Robotics', human_interface: ['Embodied'], ai_capabilities: ['Embody', 'Spatial'], ecosystem_roles: ['Experience'], industry_focus: ['Automotive'], human_activities: ['Navigate'], keywords: ['driving', 'mobility'] },

  // AI
  { value: 'ai-agents', label: 'AI Agents', group: 'AI', human_interface: ['Conversational'], ai_capabilities: ['Reason', 'Automate', 'Plan'], ecosystem_roles: ['Intelligence'], human_activities: ['Think'], keywords: ['assistant', 'agent', 'automation'] },
  { value: 'computer-vision', label: 'Computer Vision', group: 'AI', ai_capabilities: ['Perceive', 'Spatial'], ecosystem_roles: ['Intelligence'], human_capabilities: ['Perceive'], human_activities: ['Observe'], keywords: ['vision', 'inspection', 'quality'] },
  { value: 'voice-ai', label: 'Voice AI', group: 'AI', human_interface: ['Conversational'], ai_capabilities: ['Communicate', 'Perceive'], ecosystem_roles: ['Intelligence'], human_capabilities: ['Communicate'], keywords: ['speech', 'voice', 'assistant'] },
  { value: 'reasoning-llm', label: 'Reasoning / LLM', group: 'AI', ai_capabilities: ['Reason', 'Plan'], ecosystem_roles: ['Intelligence'], human_capabilities: ['Think'], human_activities: ['Think'], keywords: ['llm', 'reasoning', 'model'] },
  { value: 'knowledge-ai', label: 'Knowledge AI', group: 'AI', ai_capabilities: ['Reason'], ecosystem_roles: ['Intelligence'], human_capabilities: ['Think'], human_activities: ['Think', 'Learn'], keywords: ['knowledge', 'retrieval', 'search'] },
  { value: 'translation-ai', label: 'Translation AI', group: 'AI', ai_capabilities: ['Communicate'], ecosystem_roles: ['Intelligence'], human_capabilities: ['Communicate'], human_activities: ['Collaborate'], keywords: ['translation', 'language'] },
  { value: 'spatial-ai', label: 'Spatial AI', group: 'AI', ai_capabilities: ['Spatial', 'Perceive'], ecosystem_roles: ['Intelligence'], human_capabilities: ['Navigate'], human_activities: ['Navigate', 'Observe'], keywords: ['slam', 'digital twin', 'spatial'] },

  // Software & Platforms
  { value: 'enterprise-software', label: 'Enterprise Software', group: 'Software & Platforms', ai_capabilities: ['Automate', 'Plan'], ecosystem_roles: ['Experience'], industry_focus: ['Enterprise'], keywords: ['workflow', 'enterprise'] },
  { value: 'developer-platform', label: 'Developer Platform', group: 'Software & Platforms', ai_capabilities: ['Deploy'], ecosystem_roles: ['Intelligence'], keywords: ['sdk', 'platform', 'developer'] },
  { value: 'cloud-platform', label: 'Cloud Platform', group: 'Software & Platforms', ai_capabilities: ['Deploy', 'Automate'], ecosystem_roles: ['Intelligence'], keywords: ['cloud', 'infrastructure'] },

  // Components
  { value: 'semiconductor', label: 'Semiconductor', group: 'Components', ai_capabilities: ['Deploy'], ecosystem_roles: ['Intelligence'], keywords: ['chip', 'silicon', 'edge'] },
  { value: 'sensors', label: 'Sensors', group: 'Components', human_interface: ['Environment'], ai_capabilities: ['Perceive'], ecosystem_roles: ['Experience'], keywords: ['sensor', 'imu', 'lidar'] },
  { value: 'displays', label: 'Displays', group: 'Components', human_interface: ['Personal Devices', 'Environment'], ecosystem_roles: ['Experience'], keywords: ['display', 'microled', 'waveguide'] },
  { value: 'optics', label: 'Optics', group: 'Components', human_interface: ['Personal Devices'], ecosystem_roles: ['Experience'], keywords: ['optics', 'lens', 'waveguide'] },
  { value: 'connectivity', label: 'Connectivity', group: 'Components', ai_capabilities: ['Deploy'], ecosystem_roles: ['Intelligence'], keywords: ['5g', 'wireless', 'network'] },

  // Services
  { value: 'systems-integration', label: 'Systems Integration', group: 'Services', ecosystem_roles: ['Services', 'Experience'], industry_focus: ['Enterprise'], keywords: ['integration', 'deployment'] },
  { value: 'consulting', label: 'Consulting', group: 'Services', ecosystem_roles: ['Services'], keywords: ['advisory', 'consulting'] },
];

/* ------------------------------------------------------------------ */
/* 2. I'm Building — concrete use cases                                */
/* ------------------------------------------------------------------ */

export const BUILDING_OPTIONS: PFOption[] = [
  // Field Operations
  { value: 'remote-assistance', label: 'Remote Assistance', group: 'Field Operations', human_activities: ['Collaborate'], human_capabilities: ['Communicate', 'Perceive'], ai_capabilities: ['Communicate', 'Perceive'], human_interface: ['Personal Devices'], keywords: ['remote assist', 'remote assistance', 'expert'] },
  { value: 'inspection', label: 'Inspection', group: 'Field Operations', human_activities: ['Observe'], human_capabilities: ['Perceive', 'Supervise'], ai_capabilities: ['Perceive'], keywords: ['inspection', 'quality'] },
  { value: 'maintenance-repair', label: 'Maintenance & Repair', group: 'Field Operations', human_activities: ['Operate', 'Observe'], human_capabilities: ['Act', 'Perceive'], ai_capabilities: ['Perceive', 'Reason'], keywords: ['maintenance', 'repair', 'equipment'] },
  { value: 'field-service', label: 'Field Service', group: 'Field Operations', human_activities: ['Operate', 'Serve'], human_capabilities: ['Act'], ai_capabilities: ['Plan', 'Automate'], keywords: ['field service', 'technician'] },
  { value: 'training', label: 'Training', group: 'Field Operations', human_activities: ['Learn'], human_capabilities: ['Think'], ai_capabilities: ['Communicate', 'Reason'], keywords: ['training', 'onboarding', 'learning'] },

  // Manufacturing & Logistics
  { value: 'assembly-guidance', label: 'Assembly Guidance', group: 'Manufacturing & Logistics', human_activities: ['Operate'], human_capabilities: ['Act'], ai_capabilities: ['Perceive', 'Spatial'], industry_focus: ['Manufacturing'], keywords: ['assembly', 'guidance'] },
  { value: 'quality-inspection', label: 'Quality Inspection', group: 'Manufacturing & Logistics', human_activities: ['Observe'], human_capabilities: ['Supervise', 'Perceive'], ai_capabilities: ['Perceive'], industry_focus: ['Manufacturing'], keywords: ['quality', 'defect', 'inspection'] },
  { value: 'warehouse-picking', label: 'Warehouse Picking', group: 'Manufacturing & Logistics', human_activities: ['Operate'], human_capabilities: ['Act', 'Navigate'], ai_capabilities: ['Perceive', 'Embody'], industry_focus: ['Logistics'], keywords: ['picking', 'warehouse'] },
  { value: 'inventory-management', label: 'Inventory Management', group: 'Manufacturing & Logistics', human_activities: ['Think', 'Observe'], ai_capabilities: ['Plan', 'Automate'], industry_focus: ['Logistics', 'Retail'], keywords: ['inventory', 'stock'] },
  { value: 'material-handling', label: 'Material Handling', group: 'Manufacturing & Logistics', human_activities: ['Operate'], human_capabilities: ['Act'], ai_capabilities: ['Embody'], industry_focus: ['Logistics', 'Manufacturing'], keywords: ['material handling', 'palletizing'] },

  // Knowledge & Communication
  { value: 'ai-assistant', label: 'AI Assistant', group: 'Knowledge & Communication', human_activities: ['Think'], human_capabilities: ['Think'], ai_capabilities: ['Reason', 'Communicate'], human_interface: ['Conversational'], keywords: ['assistant', 'copilot'] },
  { value: 'knowledge-retrieval', label: 'Knowledge Retrieval', group: 'Knowledge & Communication', human_activities: ['Think', 'Learn'], human_capabilities: ['Think'], ai_capabilities: ['Reason'], keywords: ['knowledge', 'search', 'retrieval'] },
  { value: 'meetings', label: 'Meetings', group: 'Knowledge & Communication', human_activities: ['Collaborate'], human_capabilities: ['Communicate'], ai_capabilities: ['Communicate', 'Perceive'], keywords: ['meeting', 'notes', 'transcription'] },
  { value: 'translation', label: 'Translation', group: 'Knowledge & Communication', human_activities: ['Collaborate'], human_capabilities: ['Communicate'], ai_capabilities: ['Communicate'], keywords: ['translation', 'language'] },
  { value: 'customer-support', label: 'Customer Support', group: 'Knowledge & Communication', human_activities: ['Serve'], human_capabilities: ['Communicate'], ai_capabilities: ['Communicate', 'Reason'], human_interface: ['Conversational'], keywords: ['support', 'service desk'] },

  // Consumer & Personal
  { value: 'personal-ai-assistant', label: 'Personal AI Assistant', group: 'Consumer & Personal', human_activities: ['Think'], ai_capabilities: ['Reason', 'Communicate'], human_interface: ['Conversational', 'Personal Devices'], industry_focus: ['Consumer'], keywords: ['personal assistant'] },
  { value: 'navigation', label: 'Navigation', group: 'Consumer & Personal', human_activities: ['Navigate'], human_capabilities: ['Navigate'], ai_capabilities: ['Spatial'], industry_focus: ['Consumer'], keywords: ['navigation', 'wayfinding'] },
  { value: 'photography-video', label: 'Photography & Video', group: 'Consumer & Personal', human_activities: ['Create'], human_capabilities: ['Create'], ai_capabilities: ['Perceive'], industry_focus: ['Consumer', 'Media'], keywords: ['camera', 'capture', 'video'] },
  { value: 'fitness-wellness', label: 'Fitness & Wellness', group: 'Consumer & Personal', human_activities: ['Observe', 'Learn'], ai_capabilities: ['Perceive', 'Plan'], industry_focus: ['Consumer', 'Sports'], keywords: ['fitness', 'wellness', 'health'] },
  { value: 'accessibility', label: 'Accessibility', group: 'Consumer & Personal', human_activities: ['Observe', 'Collaborate'], human_capabilities: ['Perceive', 'Communicate'], ai_capabilities: ['Perceive', 'Communicate'], industry_focus: ['Consumer'], keywords: ['accessibility', 'assistive'] },

  // Healthcare
  { value: 'clinical-documentation', label: 'Clinical Documentation', group: 'Healthcare', human_activities: ['Serve', 'Think'], ai_capabilities: ['Communicate', 'Automate'], industry_focus: ['Healthcare'], keywords: ['clinical', 'documentation', 'scribe'] },
  { value: 'patient-assistance', label: 'Patient Assistance', group: 'Healthcare', human_activities: ['Serve'], ai_capabilities: ['Communicate', 'Reason'], industry_focus: ['Healthcare'], human_interface: ['Conversational'], keywords: ['patient', 'care'] },
  { value: 'medical-training', label: 'Medical Training', group: 'Healthcare', human_activities: ['Learn'], ai_capabilities: ['Spatial', 'Communicate'], industry_focus: ['Healthcare', 'Education'], keywords: ['medical training', 'simulation'] },
  { value: 'remote-care', label: 'Remote Care', group: 'Healthcare', human_activities: ['Collaborate', 'Serve'], ai_capabilities: ['Communicate', 'Perceive'], industry_focus: ['Healthcare'], keywords: ['telehealth', 'remote care'] },

  // Safety & Security
  { value: 'situational-awareness', label: 'Situational Awareness', group: 'Safety & Security', human_activities: ['Observe', 'Protect'], human_capabilities: ['Perceive'], ai_capabilities: ['Perceive', 'Spatial'], keywords: ['situational awareness'] },
  { value: 'security', label: 'Security', group: 'Safety & Security', human_activities: ['Protect'], ai_capabilities: ['Perceive'], industry_focus: ['Government', 'Defense'], keywords: ['security', 'surveillance'] },
  { value: 'emergency-response', label: 'Emergency Response', group: 'Safety & Security', human_activities: ['Protect'], ai_capabilities: ['Perceive', 'Plan'], industry_focus: ['Government'], keywords: ['emergency', 'first responder'] },
  { value: 'worker-safety', label: 'Worker Safety', group: 'Safety & Security', human_activities: ['Protect', 'Observe'], human_capabilities: ['Supervise'], ai_capabilities: ['Perceive'], industry_focus: ['Manufacturing', 'Construction'], keywords: ['safety', 'ppe', 'worker'] },
];

/* ------------------------------------------------------------------ */
/* 3. I Need — multi-select                                            */
/* ------------------------------------------------------------------ */

export const NEED_MULTI_OPTIONS: PFOption[] = [
  { value: 'need-ai-agents', label: 'AI Agents', group: 'AI Intelligence', ai_capabilities: ['Reason', 'Automate'], ecosystem_roles: ['Intelligence'], human_interface: ['Conversational'] },
  { value: 'need-computer-vision', label: 'Computer Vision', group: 'AI Intelligence', ai_capabilities: ['Perceive', 'Spatial'], ecosystem_roles: ['Intelligence'] },
  { value: 'need-voice-ai', label: 'Voice AI', group: 'AI Intelligence', ai_capabilities: ['Communicate', 'Perceive'], ecosystem_roles: ['Intelligence'], human_interface: ['Conversational'] },
  { value: 'need-reasoning', label: 'Reasoning', group: 'AI Intelligence', ai_capabilities: ['Reason', 'Plan'], ecosystem_roles: ['Intelligence'] },
  { value: 'need-knowledge-ai', label: 'Knowledge AI', group: 'AI Intelligence', ai_capabilities: ['Reason'], ecosystem_roles: ['Intelligence'] },
  { value: 'need-translation', label: 'Translation', group: 'AI Intelligence', ai_capabilities: ['Communicate'], human_capabilities: ['Communicate'], ecosystem_roles: ['Intelligence'] },
  { value: 'need-spatial-ai', label: 'Spatial AI', group: 'AI Intelligence', ai_capabilities: ['Spatial'], ecosystem_roles: ['Intelligence'] },

  { value: 'need-enterprise-software', label: 'Enterprise Software', group: 'Software & Platforms', ai_capabilities: ['Automate', 'Plan'], industry_focus: ['Enterprise'], ecosystem_roles: ['Experience'] },
  { value: 'need-developer-platform', label: 'Developer Platform', group: 'Software & Platforms', ai_capabilities: ['Deploy'], ecosystem_roles: ['Intelligence'] },
  { value: 'need-cloud-platform', label: 'Cloud Platform', group: 'Software & Platforms', ai_capabilities: ['Deploy'], ecosystem_roles: ['Intelligence'] },
  { value: 'need-workflow-automation', label: 'Workflow Automation', group: 'Software & Platforms', ai_capabilities: ['Automate', 'Plan'], ecosystem_roles: ['Intelligence', 'Experience'] },

  { value: 'need-semiconductor', label: 'Semiconductor', group: 'Components', ai_capabilities: ['Deploy'], ecosystem_roles: ['Intelligence'] },
  { value: 'need-sensors', label: 'Sensors', group: 'Components', ai_capabilities: ['Perceive'], human_interface: ['Environment'], ecosystem_roles: ['Experience'] },
  { value: 'need-displays', label: 'Displays', group: 'Components', human_interface: ['Personal Devices'], ecosystem_roles: ['Experience'] },
  { value: 'need-optics', label: 'Optics', group: 'Components', human_interface: ['Personal Devices'], ecosystem_roles: ['Experience'] },
  { value: 'need-connectivity', label: 'Connectivity', group: 'Components', ai_capabilities: ['Deploy'], ecosystem_roles: ['Intelligence'] },

  { value: 'need-systems-integrator', label: 'Systems Integrator', group: 'Business Partners', ecosystem_roles: ['Services', 'Experience'], industry_focus: ['Enterprise'] },
  { value: 'need-distributor', label: 'Distributor', group: 'Business Partners', ecosystem_roles: ['Distribution'] },
  { value: 'need-implementation-partner', label: 'Implementation Partner', group: 'Business Partners', ecosystem_roles: ['Services'] },
  { value: 'need-oem-odm', label: 'OEM / ODM', group: 'Business Partners', ecosystem_roles: ['Experience', 'Distribution'] },
];

/* ------------------------------------------------------------------ */
/* 4. Target Market — optional                                         */
/* ------------------------------------------------------------------ */

export const MARKET_OPTIONS: PFOption[] = [
  { value: 'Enterprise', label: 'Enterprise', group: 'Market', industry_focus: ['Enterprise'] },
  { value: 'Consumer', label: 'Consumer', group: 'Market', industry_focus: ['Consumer'] },
  ...['Manufacturing', 'Healthcare', 'Construction', 'Logistics', 'Retail', 'Automotive', 'Agriculture', 'Energy', 'Education', 'Government', 'Defense', 'Hospitality', 'Sports', 'Media'].map(
    (m): PFOption => ({ value: m, label: m, group: 'Industries', industry_focus: [m] })
  ),
];

export const optionByValue = (options: PFOption[], value?: string | null) =>
  options.find((o) => o.value === value);

/* ------------------------------------------------------------------ */
/* Dynamic prioritisation between columns                              */
/* ------------------------------------------------------------------ */

const PRIORITY_KEYS: HAIDimensionKey[] = [
  'human_activities',
  'human_capabilities',
  'ai_capabilities',
  'human_interface',
  'industry_focus',
];

/** Affinity between two options, based on shared hidden framework tags. */
export const optionAffinity = (a?: PFOption, b?: PFOption): number => {
  if (!a || !b) return 0;
  return PRIORITY_KEYS.reduce(
    (sum, key) => sum + overlap(profileValues(a, key), profileValues(b, key)).length,
    0
  );
};

/**
 * Sort options so the ones most relevant to earlier selections float to the
 * top of their group, without hiding anything.
 */
export const prioritizeOptions = (options: PFOption[], context: (PFOption | undefined)[]) => {
  const active = context.filter(Boolean) as PFOption[];
  if (active.length === 0) return options.map((o) => ({ option: o, suggested: false }));
  const scored = options.map((o) => ({
    option: o,
    score: active.reduce((s, c) => s + optionAffinity(o, c), 0),
  }));
  const max = Math.max(...scored.map((s) => s.score));
  return scored
    .slice()
    .sort((a, b) => b.score - a.score)
    .map((s) => ({ option: s.option, suggested: max > 0 && s.score >= Math.max(2, max * 0.6) }));
};

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

export interface PartnerQuery {
  offer?: string;
  building?: string;
  needs: string[];
  market?: string;
}

export interface PartnerRecommendation {
  company: XRCompany;
  /** 0–100 match score. */
  score: number;
  /** What the company provides that is relevant to the request. */
  provides: string[];
  /** Matching use case from the HAI directory, if any. */
  useCase?: HAIUseCase;
  markets: string[];
  explanation: string;
}

const titleCase = (list: string[]) => list.join(', ');

/** Find the directory use case that best expresses what the user is building. */
const matchUseCase = (
  building: PFOption | undefined,
  useCases: HAIUseCase[] | undefined,
  company: XRCompany
): HAIUseCase | undefined => {
  if (!building || !useCases) return undefined;
  const kw = (building.keywords || []).concat(building.label.toLowerCase());
  const scored = useCases
    .map((uc) => {
      const text = `${uc.name} ${uc.summary || ''}`.toLowerCase();
      let s = kw.some((k) => text.includes(k.toLowerCase())) ? 6 : 0;
      s += PRIORITY_KEYS.reduce(
        (sum, key) =>
          sum +
          overlap(profileValues(building, key), (uc as unknown as Record<string, string[] | null>)[key] || []).length,
        0
      );
      // Only surface a use case the company itself plausibly serves.
      s += PRIORITY_KEYS.reduce(
        (sum, key) =>
          sum +
          overlap(companyValues(company, key), (uc as unknown as Record<string, string[] | null>)[key] || []).length,
        0
      );
      return { uc, s };
    })
    .sort((a, b) => b.s - a.s);
  return scored[0] && scored[0].s >= 6 ? scored[0].uc : undefined;
};

/**
 * Rank companies as complementary partners for the request.
 * Complementarity is explicit: overlap with what the user already offers is
 * penalised, while delivering the missing capability is rewarded.
 */
export const findPartnerMatches = (
  companies: XRCompany[] | undefined,
  query: PartnerQuery,
  useCases?: HAIUseCase[],
  limit = 24
): PartnerRecommendation[] => {
  if (!companies) return [];
  const offer = optionByValue(OFFER_OPTIONS, query.offer);
  const building = optionByValue(BUILDING_OPTIONS, query.building);
  const market = optionByValue(MARKET_OPTIONS, query.market);
  const needs = query.needs
    .map((n) => optionByValue(NEED_MULTI_OPTIONS, n))
    .filter(Boolean) as PFOption[];

  if (!offer && !building && needs.length === 0 && !market) return [];

  const maxRaw =
    (needs.length > 0 ? needs.length * 12 : 0) + (building ? 14 : 0) + (offer ? 10 : 0) + (market ? 8 : 0);

  const results = companies.map((company) => {
    let raw = 0;
    const provides: string[] = [];
    const reasons: string[] = [];

    // 1. Delivers what is needed — the strongest signal.
    needs.forEach((need) => {
      const hits = PRIORITY_KEYS.reduce(
        (sum, key) => sum + overlap(companyValues(company, key), profileValues(need, key)).length,
        0
      );
      const roleHit = overlap(company.ecosystem_roles, need.ecosystem_roles).length;
      if (hits + roleHit > 0) {
        raw += Math.min(12, hits * 4 + roleHit * 3);
        provides.push(need.label);
      }
    });

    // 2. Fits what the user is building.
    if (building) {
      const fit = PRIORITY_KEYS.reduce(
        (sum, key) => sum + overlap(companyValues(company, key), profileValues(building, key)).length,
        0
      );
      raw += Math.min(14, fit * 3);
    }

    // 3. Complementary to — not a clone of — what the user already offers.
    if (offer) {
      const interfaceClash = overlap(company.human_interface, offer.human_interface).length;
      const roleClash = overlap(company.ecosystem_roles, offer.ecosystem_roles).length;
      const aiClash = overlap(company.ai_capabilities, offer.ai_capabilities).length;
      if (interfaceClash === 0 && (company.human_interface || []).length > 0) raw += 5;
      if (roleClash === 0 && (company.ecosystem_roles || []).length > 0) raw += 5;
      raw -= aiClash * 3;
      raw -= interfaceClash * 2;
      if (interfaceClash === 0 && roleClash === 0) {
        reasons.push(`complements your ${offer.label.toLowerCase()} rather than competing with it`);
      }
    }

    // 4. Target market.
    const markets = market ? overlap(company.industry_focus, market.industry_focus) : [];
    if (market && markets.length > 0) raw += 8;

    const useCase = matchUseCase(building, useCases, company);
    if (useCase) raw += 4;

    const score = Math.max(0, Math.min(99, Math.round((raw / Math.max(1, maxRaw)) * 100)));

    const providesText = provides.length > 0 ? provides.slice(0, 2).join(' and ').toLowerCase() : null;
    const explanation = [
      providesText
        ? `Their ${providesText} capability fills the gap in your${offer ? ` ${offer.label.toLowerCase()}` : ''} stack`
        : `Their capabilities extend your${offer ? ` ${offer.label.toLowerCase()}` : ''} stack`,
      building ? `for ${building.label.toLowerCase()}` : null,
      market && markets.length > 0 ? `in ${market.label.toLowerCase()}` : null,
    ]
      .filter(Boolean)
      .join(' ') +
      (reasons.length > 0 ? ` — it ${reasons[0]}.` : '.');

    return {
      company,
      score,
      provides: provides.length > 0 ? provides : (company.ai_capabilities || []).slice(0, 2),
      useCase,
      markets: markets.length > 0 ? markets : (company.industry_focus || []).slice(0, 2),
      explanation,
    };
  });

  return results
    .filter((r) => r.score >= 25 && (r.provides.length > 0 || r.useCase))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export const providesLabel = (r: PartnerRecommendation) => titleCase(r.provides.slice(0, 3));

/* ------------------------------------------------------------------ */
/* Prefill: derive a Partner Finder query from a use case              */
/* ------------------------------------------------------------------ */

const bestOption = (options: PFOption[], uc: HAIUseCase): PFOption | undefined => {
  const text = `${uc.name} ${uc.summary || ''}`.toLowerCase();
  const scored = options
    .map((o) => {
      let s = (o.keywords || []).concat(o.label.toLowerCase()).some((k) => text.includes(k.toLowerCase())) ? 6 : 0;
      s += PRIORITY_KEYS.reduce(
        (sum, key) =>
          sum +
          overlap(
            profileValues(o, key),
            ((uc as unknown as Record<string, string[] | null>)[key] || []) as string[]
          ).length,
        0
      );
      return { o, s };
    })
    .sort((a, b) => b.s - a.s);
  return scored[0] && scored[0].s > 0 ? scored[0].o : undefined;
};

/**
 * Pre-populate the Partner Finder from a use case: what is being built, the
 * intelligence and interfaces it requires, and the market it serves.
 */
export const partnerQueryForUseCase = (uc: HAIUseCase): PartnerQuery => {
  const building = bestOption(BUILDING_OPTIONS, uc);
  const needs = NEED_MULTI_OPTIONS.filter(
    (n) =>
      overlap(n.ai_capabilities, uc.ai_capabilities).length > 0 ||
      overlap(n.human_interface, uc.human_interface).length > 0
  )
    .slice(0, 4)
    .map((n) => n.value);
  const market = MARKET_OPTIONS.find((m) => overlap(m.industry_focus, uc.industry_focus).length > 0);
  return { building: building?.value, needs, market: market?.value };
};
