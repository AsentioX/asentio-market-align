import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { SOLUTION_LAYERS } from '@/lib/haiFramework';
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
