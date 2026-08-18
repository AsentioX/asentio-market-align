import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TopographicPattern from '@/components/TopographicPattern';
import ARBackground from '@/components/ARBackground';
import { useSeo } from '@/hooks/useSeo';
import { useHAIUseCases, groupByDomain } from '@/hooks/useHAIUseCases';
import { useXRCompanies } from '@/hooks/useXRCompanies';
import { companiesForUseCase } from '@/lib/haiMatching';
import UseCaseSolutionCard from '@/components/directory/UseCaseSolutionCard';
import { trackPageView } from '@/lib/analytics';

const UseCaseExplorer = () => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const { data: useCases, isLoading } = useHAIUseCases();
  const { data: allCompanies } = useXRCompanies({});

  useSeo({
    title: 'Use Cases — Human + AI Solution Discovery | Asentio',
    description:
      'Start with what the human is trying to accomplish. Browse Human + AI use cases and discover the companies, intelligence and interfaces that make each solution work.',
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return useCases || [];
    return (useCases || []).filter((uc) =>
      [uc.name, uc.summary, uc.domain, ...(uc.human_activities || [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [useCases, search]);

  const groups = useMemo(() => groupByDomain(filtered), [filtered]);

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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Use Cases</h1>
          <p className="text-base text-white/70 max-w-2xl">
            What are you trying to build? Everything begins with the human outcome.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 -mt-6 relative z-20 max-w-7xl">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search use cases — remote maintenance, translation, warehouse picking…"
              className="pl-9 h-12"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 max-w-7xl">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No use cases match that search.</p>
        ) : (
          <>
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {filtered.length} use case{filtered.length !== 1 ? 's' : ''}
            </h2>
            <p className="text-muted-foreground mb-8">
              Grouped by domain — expand a domain to explore the outcomes and the companies that enable them.
            </p>
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
          </>
        )}
      </section>
    </div>
  );
};

export default UseCaseExplorer;
