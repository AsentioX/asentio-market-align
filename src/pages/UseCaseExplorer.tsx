import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import TopographicPattern from '@/components/TopographicPattern';
import ARBackground from '@/components/ARBackground';
import { useSeo } from '@/hooks/useSeo';
import { useHAIUseCases, groupByDomain, HAIUseCase } from '@/hooks/useHAIUseCases';
import { useXRCompanies } from '@/hooks/useXRCompanies';
import { companiesForUseCase } from '@/lib/haiMatching';
import UseCaseSolutionCard from '@/components/directory/UseCaseSolutionCard';
import UseCaseFinderWidget from '@/components/directory/UseCaseFinderWidget';
import { UseCaseQuery, findUseCaseMatches } from '@/lib/useCaseFinder';
import { trackEvent, trackPageView } from '@/lib/analytics';

const UseCaseExplorer = () => {
  const [query, setQuery] = useState<UseCaseQuery>({ jobs: [] });
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

  const handleChange = useCallback((q: UseCaseQuery) => setQuery(q), []);

  const hasSelection = !!query.industry || !!query.role || query.jobs.length > 0;

  // Debounced analytics for the live finder.
  const timer = useRef<number>();
  useEffect(() => {
    if (!hasSelection) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      trackEvent(
        'use_case_finder_query',
        { industry: query.industry, role: query.role, jobs: query.jobs.join('|') },
        '/hai-directory/use-cases'
      );
    }, 1200);
    return () => window.clearTimeout(timer.current);
  }, [query, hasSelection]);

  const countsByUseCase = useMemo(() => {
    const counts: Record<string, number> = {};
    (useCases || []).forEach((uc) => {
      counts[uc.id] = companiesForUseCase(allCompanies, uc).length;
    });
    return counts;
  }, [useCases, allCompanies]);

  /** Use cases matching the current selection, ranked highest-fit first. */
  const matched: HAIUseCase[] = useMemo(() => {
    if (!hasSelection) return useCases || [];
    return findUseCaseMatches(useCases, query, Number.MAX_SAFE_INTEGER).map((r) => r.useCase);
  }, [useCases, query, hasSelection]);

  const matchedIds = useMemo(() => new Set(matched.map((uc) => uc.id)), [matched]);

  /** Every domain always shows; its list is the filtered subset, in ranked order. */
  const groups = useMemo(() => {
    const order = new Map(matched.map((uc, i) => [uc.id, i]));
    return groupByDomain(useCases).map((g) => ({
      domain: g.domain,
      total: g.useCases.length,
      useCases: g.useCases
        .filter((uc) => matchedIds.has(uc.id))
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)),
    }));
  }, [useCases, matched, matchedIds]);

  const toggle = (domain: string) => setOpen((p) => ({ ...p, [domain]: !p[domain] }));

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
        <UseCaseFinderWidget onChange={handleChange} />
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 max-w-7xl">
        <div className="w-12 h-1 bg-asentio-red mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-1">Browse all use cases</h2>
        <p className="text-muted-foreground mb-6">
          {hasSelection
            ? `${matched.length} use case${matched.length === 1 ? '' : 's'} match your selection. Expand a category to explore them.`
            : 'Expand a category to explore the full Human + AI use case library.'}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const count = group.useCases.length;
              const empty = count === 0;
              return (
                <div
                  key={group.domain}
                  className={`rounded-2xl border border-border bg-card/40 overflow-hidden ${
                    empty ? 'opacity-50' : ''
                  }`}
                >
                  <button
                    type="button"
                    disabled={empty}
                    onClick={() => toggle(group.domain)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <ChevronRight
                      className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                        open[group.domain] && !empty ? 'rotate-90' : ''
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{group.domain}</h3>
                        <span className="text-xs font-bold text-asentio-red">{count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {empty
                          ? 'No matching use cases for this selection'
                          : group.useCases.map((uc) => uc.name).join(' · ')}
                      </p>
                    </div>
                  </button>
                  {open[group.domain] && !empty && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5 pt-0">
                      {group.useCases.map((uc) => (
                        <UseCaseSolutionCard key={uc.id} useCase={uc} companyCount={countsByUseCase[uc.id]} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default UseCaseExplorer;
