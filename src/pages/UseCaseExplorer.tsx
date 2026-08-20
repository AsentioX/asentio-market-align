import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronRight, Compass, Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TopographicPattern from '@/components/TopographicPattern';
import ARBackground from '@/components/ARBackground';
import { useSeo } from '@/hooks/useSeo';
import { useHAIUseCases, groupByDomain, HAIUseCase } from '@/hooks/useHAIUseCases';
import { useXRCompanies } from '@/hooks/useXRCompanies';
import { companiesForUseCase } from '@/lib/haiMatching';
import UseCaseSolutionCard, { UseCaseIcon } from '@/components/directory/UseCaseSolutionCard';
import UseCaseFinderWidget from '@/components/directory/UseCaseFinderWidget';
import {
  DEFAULT_ROLES,
  HUMAN_GOALS,
  INDUSTRY_OPTIONS,
  UseCaseQuery,
  UseCaseRecommendation,
  findUseCaseMatches,
  jobsForGoal,
} from '@/lib/useCaseFinder';
import { HUMAN_INTERFACES, AI_CAPABILITIES } from '@/lib/haiFramework';
import { trackEvent, trackPageView } from '@/lib/analytics';

/* --------------------------------------------------------------- */
/* Ranked recommendation card                                        */
/* --------------------------------------------------------------- */

const RecommendationCard = ({
  rec,
  companyCount,
}: {
  rec: UseCaseRecommendation;
  companyCount?: number;
}) => (
  <Link
    to={`/hai-directory/use-cases/${rec.useCase.slug}`}
    className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-asentio-red/50 hover:shadow-md flex flex-col"
  >
    <div className="flex items-start justify-between gap-3 mb-3">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-muted text-asentio-blue group-hover:bg-asentio-red/10 group-hover:text-asentio-red transition-colors flex-shrink-0">
        <UseCaseIcon name={rec.useCase.icon} className="w-4 h-4" />
      </span>
      <span className="text-xs font-bold text-asentio-red whitespace-nowrap">{rec.score}% Match</span>
    </div>

    <h3 className="text-base font-semibold text-foreground leading-snug mb-1.5">{rec.useCase.name}</h3>
    {rec.useCase.summary && (
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{rec.useCase.summary}</p>
    )}

    {rec.typicalSolution.length > 0 && (
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Typical solution</p>
        <p className="text-xs text-foreground">{rec.typicalSolution.join(' + ')}</p>
      </div>
    )}

    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-asentio-red">
      Explore Use Case <ArrowRight className="w-3 h-3" />
      {typeof companyCount === 'number' && companyCount > 0 && (
        <span className="ml-auto text-muted-foreground font-normal">{companyCount} companies</span>
      )}
    </span>
  </Link>
);

/* --------------------------------------------------------------- */
/* Browse-all filter helpers                                         */
/* --------------------------------------------------------------- */

const overlap = (a?: string[] | null, b?: string[] | null) => (a || []).some((v) => (b || []).includes(v));

const matchesGoal = (uc: HAIUseCase, goal: string) => {
  const jobs = jobsForGoal(goal);
  return jobs.some(
    (j) =>
      overlap(j.human_activities, uc.human_activities) ||
      overlap(j.human_capabilities, uc.human_capabilities) ||
      overlap(j.ai_capabilities, uc.ai_capabilities)
  );
};

const matchesRole = (uc: HAIUseCase, roleValue: string) => {
  const r = DEFAULT_ROLES.find((o) => o.value === roleValue);
  if (!r) return true;
  return (
    overlap(r.human_activities, uc.human_activities) ||
    overlap(r.human_capabilities, uc.human_capabilities) ||
    overlap(r.ai_capabilities, uc.ai_capabilities)
  );
};

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <label className="flex flex-col gap-1 min-w-0">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-asentio-red"
    >
      <option value="">All</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

/* --------------------------------------------------------------- */

const UseCaseExplorer = () => {
  const [query, setQuery] = useState<UseCaseQuery | null>(null);
  const [search, setSearch] = useState('');
  const [goal, setGoal] = useState('');
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [iface, setIface] = useState('');
  const [aiCap, setAiCap] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const { data: useCases, isLoading } = useHAIUseCases();
  const { data: allCompanies } = useXRCompanies({});

  useSeo({
    title: 'Use Case Finder — Human + AI Use Cases by Role | Asentio',
    description:
      'Tell us your industry, your role and what you need to do. The Asentio Use Case Finder ranks the Human + AI use cases, technologies and partners that can help.',
    canonicalPath: '/hai-directory/use-cases',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/hai-directory/use-cases');
  }, []);

  const countsByUseCase = useMemo(() => {
    const counts: Record<string, number> = {};
    (useCases || []).forEach((uc) => {
      counts[uc.id] = companiesForUseCase(allCompanies, uc).length;
    });
    return counts;
  }, [useCases, allCompanies]);

  const recommendations = useMemo(
    () => (query ? findUseCaseMatches(useCases, query, 6) : []),
    [useCases, query]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const industryValues = INDUSTRY_OPTIONS.find((o) => o.value === industry)?.industry_focus || [];
    return (useCases || []).filter((uc) => {
      if (
        q &&
        ![uc.name, uc.summary, uc.domain, ...(uc.human_activities || [])]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
        return false;
      if (goal && !matchesGoal(uc, goal)) return false;
      if (industry && !overlap(industryValues, uc.industry_focus)) return false;
      if (role && !matchesRole(uc, role)) return false;
      if (iface && !(uc.human_interface || []).includes(iface)) return false;
      if (aiCap && !(uc.ai_capabilities || []).includes(aiCap)) return false;
      return true;
    });
  }, [useCases, search, goal, industry, role, iface, aiCap]);

  const groups = useMemo(() => groupByDomain(filtered), [filtered]);
  const toggle = (domain: string) => setOpen((p) => ({ ...p, [domain]: !p[domain] }));

  const hasFilters = !!(search || goal || industry || role || iface || aiCap);
  const clearFilters = () => {
    setSearch('');
    setGoal('');
    setIndustry('');
    setRole('');
    setIface('');
    setAiCap('');
  };

  const handleSubmit = (q: UseCaseQuery) => {
    setQuery(q);
    trackEvent(
      'use_case_finder_query',
      { industry: q.industry, role: q.role, jobs: q.jobs.join('|') },
      '/hai-directory/use-cases'
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-28 md:pt-32 pb-10 bg-[#0a0f1f] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1f] via-[#111a2e] to-[#0a0f1f]" />
        <TopographicPattern variant="darkBg" className="opacity-50" />
        <ARBackground />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
          <Link
            to="/hai-directory"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> HAI Directory
          </Link>
          <div className="w-12 h-1 bg-asentio-red mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Use Case Finder</h1>
          <p className="text-base text-white/70 max-w-2xl">
            Tell us your industry, your role and what you need to do — we will show the Human + AI use cases
            that help.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 -mt-6 relative z-20 max-w-7xl">
        <UseCaseFinderWidget onSubmit={handleSubmit} onReset={() => setQuery(null)} />
      </section>

      {/* Ranked recommendations */}
      <section className="container mx-auto px-4 md:px-6 pt-12 max-w-7xl">
        {query &&
          (isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-10">
              <Compass className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No strong matches yet — try a different job, or browse the full library below.
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-1 bg-asentio-red mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-1">Recommended use cases</h2>
              <p className="text-muted-foreground mb-8">{recommendations[0].context}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.useCase.id}
                    rec={rec}
                    companyCount={countsByUseCase[rec.useCase.id]}
                  />
                ))}
              </div>
            </>
          ))}
      </section>

      {/* Browse all */}
      <section className="container mx-auto px-4 md:px-6 py-12 max-w-7xl">
        <div className="w-12 h-1 bg-asentio-red mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-1">Browse all use cases</h2>
        <p className="text-muted-foreground mb-6">
          Prefer to explore on your own? Filter the full library by goal, industry, role or technology.
        </p>

        <div className="rounded-2xl border border-border bg-card/40 p-4 md:p-5 mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search use cases — remote maintenance, translation, warehouse picking…"
              className="pl-9 h-11"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <FilterSelect
              label="Human Goal"
              value={goal}
              onChange={setGoal}
              options={HUMAN_GOALS.map((g) => ({ value: g, label: g }))}
            />
            <FilterSelect
              label="Industry"
              value={industry}
              onChange={setIndustry}
              options={INDUSTRY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <FilterSelect
              label="Role"
              value={role}
              onChange={setRole}
              options={DEFAULT_ROLES.map((o) => ({ value: o.value, label: o.label }))}
            />
            <FilterSelect
              label="Human Interface"
              value={iface}
              onChange={setIface}
              options={HUMAN_INTERFACES.map((v) => ({ value: v, label: v }))}
            />
            <FilterSelect
              label="AI Capability"
              value={aiCap}
              onChange={setAiCap}
              options={AI_CAPABILITIES.map((v) => ({ value: v, label: v }))}
            />
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No use cases match those filters.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.domain} className="rounded-2xl border border-border bg-card/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(group.domain)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
                >
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                      open[group.domain] ? 'rotate-90' : ''
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{group.domain}</h3>
                      <span className="text-xs font-bold text-asentio-red">{group.useCases.length}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {group.useCases.map((uc) => uc.name).join(' · ')}
                    </p>
                  </div>
                </button>
                {open[group.domain] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5 pt-0">
                    {group.useCases.map((uc) => (
                      <UseCaseSolutionCard key={uc.id} useCase={uc} companyCount={countsByUseCase[uc.id]} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UseCaseExplorer;
