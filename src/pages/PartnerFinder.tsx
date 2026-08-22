import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { SOLUTION_LAYERS } from '@/lib/haiFramework';

import TopographicPattern from '@/components/TopographicPattern';
import ARBackground from '@/components/ARBackground';
import PartnerFinderWidget from '@/components/directory/PartnerFinderWidget';
import { useSeo } from '@/hooks/useSeo';
import { useXRCompanies, XRCompany } from '@/hooks/useXRCompanies';
import { useHAIUseCases, useHAIUseCase } from '@/hooks/useHAIUseCases';
import {
  findPartnerMatches,
  PartnerQuery,
  PartnerRecommendation,
  partnerQueryForUseCase,
} from '@/lib/partnerFinder';
import { trackPageView, trackEvent } from '@/lib/analytics';

const ResultCard = ({ match }: { match: PartnerRecommendation }) => {
  const c = match.company;
  const href = `/hai-directory/company/${encodeURIComponent(c.slug || c.name)}`;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-asentio-red/40 hover:shadow-md flex flex-col">
      <div className="flex items-start gap-4">
        {c.logo_url ? (
          <img
            src={c.logo_url}
            alt={`${c.name} logo`}
            loading="lazy"
            className="w-12 h-12 rounded-lg object-contain bg-background border border-border p-1 flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-muted-foreground">{c.name.charAt(0)}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
          {c.mission && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{c.mission}</p>
          )}
        </div>
      </div>

      <dl className="mt-4 space-y-1 text-xs">
        {match.provides.length > 0 && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-20 flex-shrink-0">Provides</dt>
            <dd className="text-foreground">{match.provides.slice(0, 3).join(', ')}</dd>
          </div>
        )}
        {match.useCase && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-20 flex-shrink-0">Use Case</dt>
            <dd className="text-foreground">{match.useCase.name}</dd>
          </div>
        )}
        {match.markets.length > 0 && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-20 flex-shrink-0">Market</dt>
            <dd className="text-foreground">{match.markets.slice(0, 3).join(', ')}</dd>
          </div>
        )}
      </dl>

      {match.explanation && <p className="mt-3 text-sm text-muted-foreground flex-1">{match.explanation}</p>}
    </div>
  );
};

/** Every company as a minimal recommendation, so the no-query state shows the
 *  full solution stack the same way the Use Case Finder shows all use cases. */
const allAsRecs = (companies: XRCompany[] | undefined): PartnerRecommendation[] =>
  (companies || []).map((company) => ({
    company,
    score: 0,
    provides: (company.ai_capabilities || []).slice(0, 2),
    useCase: undefined,
    markets: (company.industry_focus || []).slice(0, 2),
    explanation: '',
  }));

const PartnerFinder = () => {
  const [searchParams] = useSearchParams();
  const useCaseSlug = searchParams.get('useCase') || undefined;
  const [query, setQuery] = useState<PartnerQuery>({ needs: [] });

  const { data: companies, isLoading } = useXRCompanies({});
  const { data: useCases } = useHAIUseCases();
  const { data: seedUseCase } = useHAIUseCase(useCaseSlug);

  // Arriving from a use case: pre-populate the widget and run the search.
  const initial = useMemo(
    () => (seedUseCase ? partnerQueryForUseCase(seedUseCase) : undefined),
    [seedUseCase]
  );

  useEffect(() => {
    if (initial) setQuery(initial);
  }, [initial]);

  useSeo({
    title: 'Partner Finder — Find Your Human + AI Partners | Asentio',
    description:
      'Tell us what you offer, what you are building and what you need. The Asentio Partner Finder matches you with complementary companies across the Human + AI ecosystem.',
    canonicalPath: '/hai-directory/partner-finder',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/hai-directory/partner-finder');
  }, []);

  const handleChange = useCallback((q: PartnerQuery) => setQuery(q), []);

  const hasSelection = !!query.offer || !!query.building || query.needs.length > 0 || !!query.market;

  // Debounced analytics for the live finder.
  const timer = useRef<number>();
  useEffect(() => {
    if (!hasSelection) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      trackEvent(
        'partner_finder_query',
        { offer: query.offer, building: query.building, needs: query.needs.join('|'), market: query.market },
        '/hai-directory/partner-finder'
      );
    }, 1200);
    return () => window.clearTimeout(timer.current);
  }, [query, hasSelection]);

  const results = useMemo(
    () => (hasSelection ? findPartnerMatches(companies, query, useCases) : allAsRecs(companies)),
    [companies, query, useCases, hasSelection]
  );

  const groups = useMemo(() => {
    const layers = SOLUTION_LAYERS.map((l) => ({
      label: l.label,
      description: l.description,
      matches: results.filter((m) => (m.company.ecosystem_roles || []).some((r) => l.roles.includes(r))),
    }));
    const claimed = new Set(layers.flatMap((l) => l.matches.map((m) => m.company.id)));
    const other = results.filter((m) => !claimed.has(m.company.id));
    if (other.length) {
      layers.push({
        label: 'Other',
        description: 'Companies that fit your request but are not yet mapped to a stack layer.',
        matches: other,
      });
    }
    return layers;
  }, [results]);

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (label: string) => setOpen((p) => ({ ...p, [label]: !p[label] }));

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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Partner Finder</h1>
          <p className="text-base text-white/70 max-w-2xl">
            {seedUseCase
              ? `Partners who can help you deliver ${seedUseCase.name}.`
              : 'Who should you partner with to build your Human + AI solution?'}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 -mt-6 relative z-20 max-w-7xl">
        <PartnerFinderWidget onChange={handleChange} initial={initial} />
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 max-w-7xl">
        <div className="mb-6" />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const count = group.matches.length;
              const empty = count === 0;
              return (
                <div
                  key={group.label}
                  className={`rounded-2xl border border-border bg-card/40 overflow-hidden ${
                    empty ? 'opacity-50' : ''
                  }`}
                >
                  <button
                    type="button"
                    disabled={empty}
                    onClick={() => toggle(group.label)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <ChevronRight
                      className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                        open[group.label] && !empty ? 'rotate-90' : ''
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{group.label}</h3>
                        <span className="text-xs font-bold text-asentio-red">{count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {empty ? 'No partners for this selection' : group.description}
                      </p>
                    </div>
                  </button>
                  {open[group.label] && !empty && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5 pt-0">
                      {group.matches.map((m) => (
                        <ResultCard key={m.company.id} match={m} />
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

export default PartnerFinder;
