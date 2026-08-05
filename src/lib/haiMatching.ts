// Human + AI compatibility engine.
// One source of truth for every "what fits with what" question in the HAI
// Directory: solution stacks, partner matches and the Partner Finder.

import { HAIDimensionKey } from '@/lib/haiFramework';
import { HAIUseCase } from '@/hooks/useHAIUseCases';
import { XRCompany, companyValues } from '@/hooks/useXRCompanies';

export interface DimensionMatch {
  key: HAIDimensionKey;
  label: string;
  values: string[];
}

export interface MatchResult<T> {
  item: T;
  score: number;
  matches: DimensionMatch[];
  reasons: string[];
}

/** How much each framework dimension counts toward a fit score. */
const DIMENSION_WEIGHTS: { key: HAIDimensionKey; label: string; weight: number }[] = [
  { key: 'human_activities', label: 'Human Activities', weight: 3 },
  { key: 'human_capabilities', label: 'Human Capabilities', weight: 2 },
  { key: 'ai_capabilities', label: 'AI Capabilities', weight: 2 },
  { key: 'human_interface', label: 'Human Interface', weight: 2 },
  { key: 'industry_focus', label: 'Industry Focus', weight: 1 },
];

const overlap = (a?: string[] | null, b?: string[] | null): string[] =>
  (a || []).filter((v) => (b || []).includes(v));

const useCaseValues = (useCase: HAIUseCase, key: HAIDimensionKey): string[] =>
  ((useCase as unknown as Record<string, string[] | null>)[key] || []) as string[];

/** Score a company against a use case using framework tag overlap. */
export const scoreCompanyForUseCase = (
  company: XRCompany,
  useCase: HAIUseCase
): MatchResult<XRCompany> => {
  const matches: DimensionMatch[] = [];
  let score = 0;

  DIMENSION_WEIGHTS.forEach(({ key, label, weight }) => {
    const shared = overlap(companyValues(company, key), useCaseValues(useCase, key));
    if (shared.length > 0) {
      score += shared.length * weight;
      matches.push({ key, label, values: shared });
    }
  });

  const reasons = matches.map((m) => `${m.label}: ${m.values.join(', ')}`);
  return { item: company, score, matches, reasons };
};

/** All companies that touch a use case, best fit first. */
export const companiesForUseCase = (
  companies: XRCompany[] | undefined,
  useCase: HAIUseCase | null | undefined
): MatchResult<XRCompany>[] => {
  if (!companies || !useCase) return [];
  return companies
    .map((c) => scoreCompanyForUseCase(c, useCase))
    .filter((r) => r.score > 0 && r.matches.length >= 2)
    .sort((a, b) => b.score - a.score);
};

/** The use cases a company plausibly supports, best fit first. */
export const useCasesForCompany = (
  company: XRCompany | null | undefined,
  useCases: HAIUseCase[] | undefined,
  limit = 8
): MatchResult<HAIUseCase>[] => {
  if (!company || !useCases) return [];
  return useCases
    .map((uc) => {
      const r = scoreCompanyForUseCase(company, uc);
      return { item: uc, score: r.score, matches: r.matches, reasons: r.reasons };
    })
    .filter((r) => r.score > 0 && r.matches.length >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/* ------------------------------------------------------------------ */
/* Partner compatibility                                               */
/* ------------------------------------------------------------------ */

export interface PartnerProfile {
  value: string;
  label: string;
  human_interface?: string[];
  ai_capabilities?: string[];
  ecosystem_roles?: string[];
  industry_focus?: string[];
  human_capabilities?: string[];
}

/** "I have…" — what the visitor already builds. */
export const HAVE_OPTIONS: PartnerProfile[] = [
  { value: 'smart-glasses', label: 'Smart Glasses', human_interface: ['Personal Devices'], ecosystem_roles: ['Experience'] },
  { value: 'robot', label: 'Robot', human_interface: ['Embodied'], ai_capabilities: ['Embody'], ecosystem_roles: ['Experience'] },
  { value: 'voice-ai', label: 'Voice AI', human_interface: ['Conversational'], ai_capabilities: ['Communicate', 'Perceive'], ecosystem_roles: ['Intelligence'] },
  { value: 'computer-vision', label: 'Computer Vision', ai_capabilities: ['Perceive', 'Spatial'], ecosystem_roles: ['Intelligence'] },
  { value: 'ai-agent', label: 'AI Agent', human_interface: ['Conversational'], ai_capabilities: ['Reason', 'Automate', 'Plan'], ecosystem_roles: ['Intelligence'] },
  { value: 'enterprise-software', label: 'Enterprise Software', ai_capabilities: ['Automate', 'Plan'], ecosystem_roles: ['Experience'], industry_focus: ['Enterprise'] },
  { value: 'sensors', label: 'Sensors', human_interface: ['Environment'], ai_capabilities: ['Perceive', 'Deploy'], ecosystem_roles: ['Experience'] },
  { value: 'semiconductor', label: 'Semiconductor', ai_capabilities: ['Deploy'], ecosystem_roles: ['Intelligence'] },
];

/** "I need…" — the capability or route to market the visitor is missing. */
export const NEED_OPTIONS: PartnerProfile[] = [
  { value: 'voice-ai', label: 'Voice AI', ai_capabilities: ['Communicate', 'Perceive'], human_interface: ['Conversational'], ecosystem_roles: ['Intelligence'] },
  { value: 'computer-vision', label: 'Computer Vision', ai_capabilities: ['Perceive', 'Spatial'], ecosystem_roles: ['Intelligence'] },
  { value: 'enterprise-customers', label: 'Enterprise Customers', industry_focus: ['Enterprise'], ecosystem_roles: ['Distribution', 'Services'] },
  { value: 'manufacturing', label: 'Manufacturing', industry_focus: ['Manufacturing'], ecosystem_roles: ['Experience', 'Services'] },
  { value: 'healthcare', label: 'Healthcare', industry_focus: ['Healthcare'], ecosystem_roles: ['Experience', 'Services'] },
  { value: 'distribution', label: 'Distribution', ecosystem_roles: ['Distribution'] },
  { value: 'retail', label: 'Retail', industry_focus: ['Retail'], ecosystem_roles: ['Distribution', 'Experience'] },
  { value: 'translation', label: 'Translation', ai_capabilities: ['Communicate'], human_capabilities: ['Communicate'], ecosystem_roles: ['Intelligence'] },
];

export const profileByValue = (options: PartnerProfile[], value?: string) =>
  options.find((o) => o.value === value);

const PROFILE_KEYS: { key: HAIDimensionKey; label: string }[] = [
  { key: 'ai_capabilities', label: 'AI Capabilities' },
  { key: 'human_interface', label: 'Human Interface' },
  { key: 'industry_focus', label: 'Industry Focus' },
  { key: 'ecosystem_roles', label: 'Ecosystem Role' },
  { key: 'human_capabilities', label: 'Human Capabilities' },
];

export interface PartnerMatchResult extends MatchResult<XRCompany> {
  /** 1–5 fit rating derived from the compatibility score. */
  rating: number;
  sharedUseCases: HAIUseCase[];
}

const profileValues = (profile: PartnerProfile | undefined, key: HAIDimensionKey): string[] =>
  ((profile as unknown as Record<string, string[] | undefined>)?.[key] || []) as string[];

/**
 * Rank companies as potential partners for someone who *has* one thing and
 * *needs* another. Companies score for delivering what is needed, and for
 * being complementary rather than a mirror image of the visitor.
 */
export const findPartners = (
  companies: XRCompany[] | undefined,
  haveValue: string | undefined,
  needValue: string | undefined,
  useCases?: HAIUseCase[]
): PartnerMatchResult[] => {
  if (!companies || (!haveValue && !needValue)) return [];
  const have = profileByValue(HAVE_OPTIONS, haveValue);
  const need = profileByValue(NEED_OPTIONS, needValue);

  const results = companies.map((company) => {
    const matches: DimensionMatch[] = [];
    const reasons: string[] = [];
    let score = 0;

    // 1. Does the company deliver what is needed?
    PROFILE_KEYS.forEach(({ key, label }) => {
      const shared = overlap(companyValues(company, key), profileValues(need, key));
      if (shared.length > 0) {
        score += shared.length * 4;
        matches.push({ key, label, values: shared });
      }
    });
    if (need && matches.length > 0) {
      reasons.push(`Delivers ${need.label.toLowerCase()} through ${matches[0].values.join(', ')}`);
    }

    // 2. Complementary rather than competing with what the visitor already has.
    if (have) {
      const interfaceOverlap = overlap(company.human_interface, have.human_interface);
      const roleOverlap = overlap(company.ecosystem_roles, have.ecosystem_roles);
      if (interfaceOverlap.length === 0 && (company.human_interface || []).length > 0) {
        score += 3;
        reasons.push(`Complements your ${have.label.toLowerCase()} with a different human interface`);
      }
      if (roleOverlap.length === 0 && (company.ecosystem_roles || []).length > 0) {
        score += 2;
        reasons.push(`Sits in a different layer of the stack: ${(company.ecosystem_roles || []).join(', ')}`);
      }
      const aiOverlap = overlap(company.ai_capabilities, have.ai_capabilities);
      if (aiOverlap.length > 0) {
        score += 1;
        reasons.push(`Shared technical ground in ${aiOverlap.join(', ')}`);
      }
    }

    // 3. Shared human use cases — the strongest signal of a real partnership.
    const sharedUseCases = (useCases || [])
      .filter((uc) => {
        const companyFit = scoreCompanyForUseCase(company, uc);
        if (companyFit.matches.length < 3) return false;
        const needFit =
          !need ||
          PROFILE_KEYS.some(({ key }) => overlap(useCaseValues(uc, key), profileValues(need, key)).length > 0);
        const haveFit =
          !have ||
          PROFILE_KEYS.some(({ key }) => overlap(useCaseValues(uc, key), profileValues(have, key)).length > 0);
        return needFit && haveFit;
      })
      .slice(0, 4);
    if (sharedUseCases.length > 0) {
      score += sharedUseCases.length * 2;
      reasons.push(`Shared use cases: ${sharedUseCases.map((u) => u.name).join(', ')}`);
    }

    const rating = Math.max(1, Math.min(5, Math.round(score / 6)));
    return { item: company, score, matches, reasons, rating, sharedUseCases };
  });

  return results.filter((r) => r.score >= 6).sort((a, b) => b.score - a.score);
};

/** Best partner matches for a company already in the directory. */
export const partnersForCompany = (
  company: XRCompany | null | undefined,
  all: XRCompany[] | undefined,
  useCases?: HAIUseCase[],
  limit = 6
): PartnerMatchResult[] => {
  if (!company || !all) return [];
  const results = all
    .filter((c) => c.id !== company.id)
    .map((candidate) => {
      const reasons: string[] = [];
      const matches: DimensionMatch[] = [];
      let score = 0;

      // Complementary interface / ecosystem role.
      const interfaceOverlap = overlap(candidate.human_interface, company.human_interface);
      if (interfaceOverlap.length === 0 && (candidate.human_interface || []).length > 0) {
        score += 3;
        reasons.push(`Different human interface: ${(candidate.human_interface || []).join(', ')}`);
      }
      const roleOverlap = overlap(candidate.ecosystem_roles, company.ecosystem_roles);
      if (roleOverlap.length === 0 && (candidate.ecosystem_roles || []).length > 0) {
        score += 3;
        reasons.push(`Fills a different layer: ${(candidate.ecosystem_roles || []).join(', ')}`);
      }

      // Complementary AI capability the company does not already have.
      const newAI = (candidate.ai_capabilities || []).filter(
        (v) => !(company.ai_capabilities || []).includes(v)
      );
      if (newAI.length > 0) {
        score += newAI.length;
        matches.push({ key: 'ai_capabilities', label: 'Adds AI Capabilities', values: newAI });
      }

      // Shared ground: activities and industries.
      const sharedActivities = overlap(candidate.human_activities, company.human_activities);
      if (sharedActivities.length > 0) {
        score += sharedActivities.length * 3;
        matches.push({ key: 'human_activities', label: 'Shared Human Activities', values: sharedActivities });
      }
      const sharedIndustries = overlap(candidate.industry_focus, company.industry_focus);
      if (sharedIndustries.length > 0) {
        score += sharedIndustries.length * 2;
        matches.push({ key: 'industry_focus', label: 'Shared Industries', values: sharedIndustries });
      }

      const sharedUseCases = (useCases || [])
        .filter(
          (uc) =>
            scoreCompanyForUseCase(company, uc).matches.length >= 3 &&
            scoreCompanyForUseCase(candidate, uc).matches.length >= 3
        )
        .slice(0, 3);
      if (sharedUseCases.length > 0) {
        score += sharedUseCases.length * 2;
        reasons.push(`Both serve ${sharedUseCases.map((u) => u.name).join(', ')}`);
      }

      const rating = Math.max(1, Math.min(5, Math.round(score / 6)));
      return { item: candidate, score, matches, reasons, rating, sharedUseCases };
    })
    .filter((r) => r.score >= 8 && (r.matches.length > 0 || r.sharedUseCases.length > 0));

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
};
