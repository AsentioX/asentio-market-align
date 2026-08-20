import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import {
  SOLUTION_LAYERS,
  haiActivityLabel,
  haiAICapabilityLabel,
  haiCapabilityLabel,
  haiInterfaceLabel,
} from '@/lib/haiFramework';
import { Button } from '@/components/ui/button';
import { useXRProducts } from '@/hooks/useXRProducts';
import TopographicPattern from '@/components/TopographicPattern';
import ARBackground from '@/components/ARBackground';
import { useSeo } from '@/hooks/useSeo';
import { useHAIUseCase } from '@/hooks/useHAIUseCases';
import { useXRCompanies } from '@/hooks/useXRCompanies';
import { companiesForUseCase } from '@/lib/haiMatching';
import { UseCaseIcon } from '@/components/directory/UseCaseSolutionCard';
import { trackPageView } from '@/lib/analytics';
import type { MatchResult } from '@/lib/haiMatching';
import type { XRCompany } from '@/hooks/useXRCompanies';

const ResultCard = ({ match }: { match: MatchResult<XRCompany> }) => {
  const c = match.item;
  const href = `/hai-directory/company/${encodeURIComponent(c.slug || c.name)}`;
  const provides = match.matches.find((m) => m.key === 'ai_capabilities' || m.key === 'human_interface');
  const markets = match.matches.find((m) => m.key === 'industry_focus');

  return (
    <Link
      to={href}
      className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-asentio-red/40 hover:shadow-md flex flex-col"
    >
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
        {provides && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-20 flex-shrink-0">Provides</dt>
            <dd className="text-foreground">{provides.values.slice(0, 3).join(', ')}</dd>
          </div>
        )}
        {markets && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-20 flex-shrink-0">Market</dt>
            <dd className="text-foreground">{markets.values.slice(0, 3).join(', ')}</dd>
          </div>
        )}
      </dl>

      {match.reasons.find((r) => !r.startsWith('Human Activities')) && (
        <p className="mt-3 text-sm text-muted-foreground flex-1">
          {match.reasons.find((r) => !r.startsWith('Human Activities'))}
        </p>
      )}
    </Link>
  );
};

const HAIUseCaseResults = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: useCase, isLoading: loadingUseCase } = useHAIUseCase(slug);
  const { data: companies, isLoading: loadingCompanies } = useXRCompanies({});
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useSeo({
    title: useCase ? `${useCase.name} — Solution Stack | Asentio` : 'Use Case — Asentio',
    description:
      useCase?.summary ||
      'Explore the companies that make this Human + AI use case possible, grouped by solution stack layer.',
    canonicalPath: `/hai-directory/use-cases/${slug}`,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(`/hai-directory/use-cases/${slug}`);
  }, [slug]);

  const results = useMemo(() => companiesForUseCase(companies, useCase), [companies, useCase]);

  const { data: allProducts } = useXRProducts({});
  const products = useMemo(() => {
    const names = new Set(results.slice(0, 20).map((r) => r.item.name.toLowerCase()));
    return (allProducts || []).filter((p) => names.has((p.company || '').toLowerCase())).slice(0, 6);
  }, [allProducts, results]);

  const groups = useMemo(() => {
    const layers = SOLUTION_LAYERS.map((l) => ({
      label: l.label,
      description: l.description,
      matches: results.filter((m) => (m.item.ecosystem_roles || []).some((r) => l.roles.includes(r))),
    }));
    const claimed = new Set(layers.flatMap((l) => l.matches.map((m) => m.item.id)));
    const other = results.filter((m) => !claimed.has(m.item.id));
    if (other.length) {
      layers.push({
        label: 'Other',
        description: 'Companies that fit this use case but are not yet mapped to a stack layer.',
        matches: other,
      });
    }
    return layers.filter((l) => l.matches.length > 0);
  }, [results]);

  const toggle = (label: string) => setOpen((p) => ({ ...p, [label]: !p[label] }));
  const isLoading = loadingUseCase || loadingCompanies;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-28 md:pt-32 pb-10 bg-[#0a0f1f] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1f] via-[#111a2e] to-[#0a0f1f]" />
        <TopographicPattern variant="darkBg" className="opacity-50" />
        <ARBackground />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
          <Link
            to="/hai-directory/use-cases"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Use Cases
          </Link>
          <div className="w-12 h-1 bg-asentio-red mb-4" />
          <div className="flex items-start gap-4">
            {useCase && (
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white flex-shrink-0">
                <UseCaseIcon name={useCase.icon} className="w-5 h-5" />
              </span>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {useCase?.name || 'Use Case'}
              </h1>
              {useCase?.summary && <p className="text-base text-white/70 max-w-2xl">{useCase.summary}</p>}
            </div>
          </div>
        </div>
      </section>


      {/* How this use case works — the framework, told as a story */}
      {useCase && (
        <section className="container mx-auto px-4 md:px-6 pt-12 max-w-7xl">
          <div className="rounded-2xl border border-border bg-card/40 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  What the person is accomplishing
                </p>
                <ul className="space-y-1 text-sm text-foreground">
                  {(useCase.human_activities || []).map((v) => (
                    <li key={v}>{haiActivityLabel(v)}</li>
                  ))}
                  {(useCase.human_activities || []).length === 0 && (
                    <li className="text-muted-foreground">Not yet mapped</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  How AI helps the human
                </p>
                <ul className="space-y-1 text-sm text-foreground">
                  {(useCase.human_capabilities || []).map((v) => (
                    <li key={v}>{haiCapabilityLabel(v)}</li>
                  ))}
                  {(useCase.human_capabilities || []).length === 0 && (
                    <li className="text-muted-foreground">Not yet mapped</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  AI capabilities required
                </p>
                <ul className="space-y-1 text-sm text-foreground">
                  {(useCase.ai_capabilities || []).map((v) => (
                    <li key={v}>{haiAICapabilityLabel(v)}</li>
                  ))}
                  {(useCase.ai_capabilities || []).length === 0 && (
                    <li className="text-muted-foreground">Not yet mapped</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  Best interfaces
                </p>
                <ul className="space-y-1 text-sm text-foreground">
                  {(useCase.human_interface || []).map((v) => (
                    <li key={v}>{haiInterfaceLabel(v)}</li>
                  ))}
                  {(useCase.human_interface || []).length === 0 && (
                    <li className="text-muted-foreground">Not yet mapped</li>
                  )}
                </ul>
              </div>
            </div>

            {useCase.description && (
              <p className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground leading-relaxed">
                {useCase.description}
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Building this? See which companies complete the stack around you.
              </p>
              <Button asChild className="bg-asentio-red hover:bg-asentio-red/90 text-white">
                <Link to={`/hai-directory/partner-finder?useCase=${useCase.slug}`}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find Partners for This Use Case
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Relevant products */}
      {products.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 pt-12 max-w-7xl">
          <div className="w-12 h-1 bg-asentio-red mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-1">Relevant products</h2>
          <p className="text-muted-foreground mb-6">Shipping products from companies enabling this use case.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <Link
                key={p.id}
                to={`/hai-directory/${p.slug}`}
                className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-asentio-red/40 hover:shadow-md"
              >
                <p className="text-xs text-muted-foreground">{p.company}</p>
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                {p.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 md:px-6 py-12 max-w-7xl">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No companies mapped to this use case yet.
            </p>
          </div>
        ) : (
          <>
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {results.length} compan{results.length !== 1 ? 'ies' : 'y'} enabling this use case
            </h2>
            <p className="text-muted-foreground mb-8">
              Grouped by solution stack layer — expand a layer to see who fills it.
            </p>
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.label} className="rounded-2xl border border-border bg-card/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggle(group.label)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
                  >
                    <ChevronRight
                      className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                        open[group.label] ? 'rotate-90' : ''
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{group.label}</h3>
                        <span className="text-xs font-bold text-asentio-red">{group.matches.length}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{group.description}</p>
                    </div>
                  </button>
                  {open[group.label] && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5 pt-0">
                      {group.matches.map((m) => (
                        <ResultCard key={m.item.id} match={m} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default HAIUseCaseResults;
