import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-28 md:pt-36 pb-10 bg-muted">
        <TopographicPattern className="opacity-30" />
        <ARBackground />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
          <Link
            to="/hai-directory"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
          <div className="w-12 h-1 bg-asentio-red mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">What are you trying to build?</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Everything begins with the human. Choose the outcome someone is trying to achieve, and we will
            assemble the intelligence, interfaces and companies that make it possible.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="max-w-3xl mb-10">
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

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10">No use cases match that search.</p>
        ) : (
          <div className="space-y-14">
            {groups.map((group) => (
              <div key={group.domain}>
                <div className="flex items-baseline gap-3 mb-6">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-semibold text-foreground">
                    {group.domain}
                  </h2>
                  <span className="text-xs text-muted-foreground">{group.useCases.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.useCases.map((uc) => (
                    <UseCaseSolutionCard key={uc.id} useCase={uc} companyCount={countsByUseCase[uc.id]} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UseCaseExplorer;
