import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, Loader2, Package, Compass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TopographicPattern from '@/components/TopographicPattern';
import ARBackground from '@/components/ARBackground';
import { UseCaseIcon } from '@/components/directory/UseCaseSolutionCard';
import UseCaseSolutionCard from '@/components/directory/UseCaseSolutionCard';
import { useSeo } from '@/hooks/useSeo';
import { useHAIUseCase, useHAIUseCases } from '@/hooks/useHAIUseCases';
import { useXRCompanies, XRCompany } from '@/hooks/useXRCompanies';
import { useXRProducts } from '@/hooks/useXRProducts';
import { companiesForUseCase, MatchResult } from '@/lib/haiMatching';
import { SOLUTION_LAYERS, SOLUTION_STEPS, dimensionByKey, HAIDimensionKey } from '@/lib/haiFramework';
import { trackPageView } from '@/lib/analytics';

const useCaseValues = (uc: Record<string, unknown>, key: HAIDimensionKey): string[] =>
  ((uc[key] as string[] | null) || []) as string[];

const CompanyMatchCard = ({ match }: { match: MatchResult<XRCompany> }) => {
  const c = match.item;
  return (
    <Link
      to={`/hai-directory/company/${encodeURIComponent(c.slug || c.name)}`}
      className="group flex gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-asentio-red/40 hover:shadow-md"
    >
      {c.logo_url ? (
        <img
          src={c.logo_url}
          alt={`${c.name} logo`}
          className="w-11 h-11 rounded-lg object-contain bg-background border border-border p-1 flex-shrink-0"
        />
      ) : (
        <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-muted-foreground">{c.name.charAt(0)}</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="font-semibold text-foreground group-hover:text-asentio-red transition-colors">{c.name}</p>
        {c.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {match.matches.slice(0, 3).flatMap((m) =>
            m.values.slice(0, 2).map((v) => (
              <Badge key={`${m.key}-${v}`} variant="secondary" className="text-[10px]">
                {v}
              </Badge>
            ))
          )}
        </div>
      </div>
    </Link>
  );
};

const SolutionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: useCase, isLoading } = useHAIUseCase(slug);
  const { data: useCases } = useHAIUseCases();
  const { data: companies } = useXRCompanies({});
  const { data: products } = useXRProducts({});

  useSeo({
    title: useCase
      ? `${useCase.name} — Human + AI Solution Stack | Asentio`
      : 'Human + AI Solution | Asentio',
    description:
      useCase?.summary ||
      'Explore the companies, technologies and interfaces that make this human use case work.',
    canonicalPath: `/hai-directory/solutions/${slug}`,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) trackPageView(`/hai-directory/solutions/${slug}`);
  }, [slug]);

  const matches = useMemo(() => companiesForUseCase(companies, useCase), [companies, useCase]);

  const layers = useMemo(
    () =>
      SOLUTION_LAYERS.map((layer) => ({
        ...layer,
        matches: matches.filter((m) =>
          (m.item.ecosystem_roles || []).some((r) => layer.roles.includes(r))
        ),
      })).filter((l) => l.matches.length > 0),
    [matches]
  );

  const matchedCompanyNames = useMemo(
    () => new Set(matches.slice(0, 20).map((m) => m.item.name.toLowerCase())),
    [matches]
  );

  const relevantProducts = useMemo(
    () =>
      (products || [])
        .filter((p) => matchedCompanyNames.has((p.company || '').toLowerCase()))
        .slice(0, 8),
    [products, matchedCompanyNames]
  );

  const related = useMemo(() => {
    if (!useCase || !useCases) return [];
    return useCases
      .filter((u) => u.id !== useCase.id)
      .map((u) => ({
        u,
        score:
          (u.domain === useCase.domain ? 3 : 0) +
          (u.human_activities || []).filter((v) => (useCase.human_activities || []).includes(v)).length +
          (u.ai_capabilities || []).filter((v) => (useCase.ai_capabilities || []).includes(v)).length,
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.u);
  }, [useCase, useCases]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!useCase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">This use case could not be found.</p>
        <Link to="/hai-directory">
          <Button variant="outline">Back to the HAI Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-12 md:pb-16 bg-[#0a0f1f] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1f] via-[#111a2e] to-[#0a0f1f]" />
        <TopographicPattern variant="darkBg" className="opacity-50" />
        <ARBackground />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
          <Link
            to="/hai-directory"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> All use cases
          </Link>

          <p className="text-xs uppercase tracking-[0.25em] text-asentio-red font-semibold mb-4">
            {useCase.domain}
          </p>
          <div className="flex items-start gap-4">
            <span className="hidden md:inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 text-white flex-shrink-0">
              <UseCaseIcon name={useCase.icon} className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">{useCase.name}</h1>
              {useCase.summary && (
                <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl">{useCase.summary}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {useCase.description && (
        <section className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-3xl">
          <div className="w-12 h-1 bg-asentio-red mb-6" />
          <p className="text-lg md:text-xl text-foreground/90 leading-relaxed font-light whitespace-pre-line">
            {useCase.description}
          </p>
        </section>
      )}

      {/* Framework strip */}
      <section className="border-y border-border bg-muted/40">
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-12">
          <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-8">
            The Human + AI Framework behind it
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {SOLUTION_STEPS.map((key, i) => {
              const dimension = dimensionByKey(key);
              const values = useCaseValues(useCase as unknown as Record<string, unknown>, key);
              if (values.length === 0) return null;
              return (
                <div key={key}>
                  <p className="text-2xl font-bold text-asentio-red mb-1">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <p className="text-sm font-semibold text-foreground mb-3">{dimension.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {values.map((v) => (
                      <Link key={v} to={`/hai-directory?${key}=${encodeURIComponent(v)}`}>
                        <Badge
                          variant="secondary"
                          className="text-xs hover:bg-asentio-red hover:text-primary-foreground transition-colors"
                        >
                          {v}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution stack */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="w-12 h-1 bg-asentio-red mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">The solution stack</h2>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          {matches.length} companies in the directory match this use case, grouped by where they sit in
          the Human + AI value chain.
        </p>

        {layers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No companies match this use case yet. As the directory grows this stack fills in automatically.
          </p>
        ) : (
          <div className="space-y-12">
            {layers.map((layer) => (
              <div key={layer.label}>
                <div className="flex items-baseline gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{layer.label}</h3>
                  <span className="text-xs text-muted-foreground">{layer.matches.length}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-5">{layer.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {layer.matches.slice(0, 9).map((m) => (
                    <CompanyMatchCard key={m.item.id} match={m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Products */}
      {relevantProducts.length > 0 && (
        <section className="border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" /> Products in this space
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relevantProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/hai-directory/${p.slug}`}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:border-asentio-red/40 transition-colors"
                >
                  {p.image_url && (
                    <div className="aspect-[16/10] bg-muted overflow-hidden">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">{p.company}</p>
                    <p className="font-semibold text-foreground group-hover:text-asentio-red transition-colors">
                      {p.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partner finder CTA */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="rounded-2xl border border-asentio-red/30 border-l-4 border-l-asentio-red bg-asentio-blue/5 p-6 md:p-10 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              Building for {useCase.name.toLowerCase()}?
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Tell us what you already have and what you are missing, and we will find the companies that
              complete your stack.
            </p>
          </div>
          <Link to="/hai-directory/partner-finder" className="flex-shrink-0">
            <Button className="bg-asentio-red hover:bg-asentio-red/90 text-white">
              <Compass className="w-4 h-4 mr-2" /> Open Partner Finder
            </Button>
          </Link>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 pb-16 md:pb-24">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            Related use cases <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((u) => (
              <UseCaseSolutionCard key={u.id} useCase={u} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SolutionDetail;
