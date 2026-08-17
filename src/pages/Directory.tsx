import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DirectoryHeader from '@/components/directory/DirectoryHeader';
import DirectoryFilters from '@/components/directory/DirectoryFilters';
import DirectoryGrid from '@/components/directory/DirectoryGrid';
import DirectoryViewToggle, { ViewMode } from '@/components/directory/DirectoryViewToggle';
import CompanyGrid from '@/components/directory/CompanyGrid';
import CompanyHAIFilterBar from '@/components/directory/CompanyHAIFilterBar';
import AgencyGrid from '@/components/directory/AgencyGrid';
import UseCaseSolutionCard from '@/components/directory/UseCaseSolutionCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { trackPageView, trackEvent } from '@/lib/analytics';
import { useSeo } from '@/hooks/useSeo';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useXRCompanies, CompanyFilters, HAISelections } from '@/hooks/useXRCompanies';
import { useXRProducts, ProductFilters } from '@/hooks/useXRProducts';
import { useXRAgencies, AgencyFilters } from '@/hooks/useXRAgencies';
import { useHAIUseCases, groupByDomain } from '@/hooks/useHAIUseCases';
import { companiesForUseCase } from '@/lib/haiMatching';
import { HAI_DIMENSIONS, HAIDimensionKey } from '@/lib/haiFramework';
import { Building2, Package, Layers, Briefcase, Plus, Compass, X, Search, Loader2 } from 'lucide-react';

const Directory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'use-cases';
  const [activeTab, setActiveTab] = useState(initialTab);
  const useCaseSlug = searchParams.get('useCase');

  const initialSelections = useMemo(() => {
    const next: HAISelections = {};
    HAI_DIMENSIONS.forEach((d) => {
      const values = searchParams.getAll(d.key);
      if (values.length > 0) next[d.key] = values;
    });
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selections, setSelections] = useState<HAISelections>(initialSelections);
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [companySearch, setCompanySearch] = useState('');
  const [useCaseSearch, setUseCaseSearch] = useState('');

  const companyFilters: CompanyFilters = useMemo(
    () => ({ search: companySearch || undefined, selections, logic }),
    [companySearch, selections, logic]
  );

  const [productFilters, setProductFilters] = useState<ProductFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [agencyFilters] = useState<AgencyFilters>({});

  const { data: companies, isLoading: companiesLoading } = useXRCompanies(companyFilters);
  const { data: allCompanies } = useXRCompanies({});
  const { data: products, isLoading: productsLoading } = useXRProducts(productFilters);
  const { data: agencies, isLoading: agenciesLoading } = useXRAgencies(agencyFilters);
  const { data: useCases, isLoading: useCasesLoading } = useHAIUseCases();

  /* ---- Use-case scoped ecosystem results ---- */
  const activeUseCase = useMemo(
    () => (useCaseSlug ? (useCases || []).find((u) => u.slug === useCaseSlug) || null : null),
    [useCases, useCaseSlug]
  );

  const useCaseMatches = useMemo(
    () => companiesForUseCase(allCompanies, activeUseCase),
    [allCompanies, activeUseCase]
  );

  const scopedCompanies = useMemo(() => {
    if (!activeUseCase) return companies;
    const q = companySearch.trim().toLowerCase();
    const items = useCaseMatches.map((m) => m.item);
    if (!q) return items;
    return items.filter((c) =>
      [c.name, c.description, c.hq_location].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [activeUseCase, companies, useCaseMatches, companySearch]);

  const scopedCompanyNames = useMemo(
    () => new Set(useCaseMatches.map((m) => m.item.name.toLowerCase())),
    [useCaseMatches]
  );

  const scopedProducts = useMemo(() => {
    if (!activeUseCase) return products;
    return (products || []).filter((p) => scopedCompanyNames.has((p.company || '').toLowerCase()));
  }, [activeUseCase, products, scopedCompanyNames]);

  const clearUseCase = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('useCase');
    setSearchParams(next, { replace: true });
  };

  const activeChips = Object.entries(selections).flatMap(([key, values]) =>
    (values || []).map((value) => ({ key: key as HAIDimensionKey, value }))
  );

  const removeChip = (key: HAIDimensionKey, value: string) =>
    setSelections({ ...selections, [key]: (selections[key] || []).filter((v) => v !== value) });

  useSeo({
    title: 'HAI Directory — Human + AI Solution Discovery | Asentio',
    description:
      'Start with what the human is trying to accomplish. Explore Human + AI use cases and discover the companies, intelligence and interfaces that make each solution work.',
    canonicalPath: '/hai-directory',
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) setActiveTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    trackPageView('/hai-directory');
  }, []);

  useEffect(() => {
    trackEvent('directory_tab_view', { tab: activeTab }, '/hai-directory');
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <DirectoryHeader />

      <div className="container mx-auto px-4 py-10 md:py-14">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <TabsList className="grid w-full sm:max-w-2xl grid-cols-4">
              <TabsTrigger value="use-cases" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Use Cases</span>
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Companies</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="agencies" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Agencies</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Link to="/hai-directory/partner-finder">
                <Button variant="outline" className="whitespace-nowrap border-2">
                  <Compass className="w-4 h-4 mr-2" /> Partner Finder
                </Button>
              </Link>
              <Link to="/hai-directory/submit">
                <Button className="bg-asentio-red hover:bg-asentio-red/90 text-white whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" /> Add your company
                </Button>
              </Link>
            </div>
          </div>

          {activeUseCase && (
            <div className="mb-8 rounded-2xl border border-asentio-red/30 bg-asentio-red/5 p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-asentio-red font-semibold mb-1">
                    Filtered by use case
                  </p>
                  <h2 className="text-xl font-bold text-foreground">{activeUseCase.name}</h2>
                  {activeUseCase.summary && (
                    <p className="text-sm text-muted-foreground max-w-2xl mt-1">{activeUseCase.summary}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {[
                      ...(activeUseCase.human_activities || []),
                      ...(activeUseCase.ai_capabilities || []),
                      ...(activeUseCase.human_interface || []),
                    ]
                      .slice(0, 8)
                      .map((v) => (
                        <Badge key={v} variant="secondary" className="text-[10px]">
                          {v}
                        </Badge>
                      ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {scopedCompanies?.length || 0} companies · {scopedProducts?.length || 0} products matched
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/hai-directory/solutions/${activeUseCase.slug}`}>
                    <Button variant="outline" className="whitespace-nowrap">
                      Full solution stack
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={clearUseCase} className="whitespace-nowrap">
                    <X className="w-4 h-4 mr-1" /> Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- Use cases: the front door ---------------- */}
          <TabsContent value="use-cases">
            <div className="max-w-3xl mb-10">
              <div className="w-12 h-1 bg-asentio-red mb-5" />
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
                What are you trying to build?
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                Everything begins with the human. Choose the outcome someone is trying to achieve, and we
                will assemble the intelligence, interfaces and companies that make it possible.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={useCaseSearch}
                  onChange={(e) => setUseCaseSearch(e.target.value)}
                  placeholder="Search use cases — remote maintenance, translation, warehouse picking…"
                  className="pl-9 h-12"
                />
              </div>
            </div>

            {useCasesLoading ? (
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
                      <h3 className="text-sm uppercase tracking-[0.2em] font-semibold text-foreground">
                        {group.domain}
                      </h3>
                      <span className="text-xs text-muted-foreground">{group.useCases.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {group.useCases.map((uc) => (
                        <UseCaseSolutionCard
                          key={uc.id}
                          useCase={uc}
                          companyCount={countsByUseCase[uc.id]}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="companies">
            <CompanyHAIFilterBar
              search={companySearch}
              onSearchChange={setCompanySearch}
              selections={selections}
              onChange={setSelections}
            />

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-4">
                {activeChips.map(({ key, value }) => (
                  <Badge
                    key={`${key}-${value}`}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeChip(key, value)}
                  >
                    {value} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}

            <div className="py-6">
              <CompanyGrid companies={scopedCompanies} isLoading={companiesLoading} />
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="flex items-center justify-between gap-4 mb-4">
              <DirectoryFilters filters={productFilters} onFilterChange={setProductFilters} />
              <DirectoryViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>
            <div className="py-4">
              <DirectoryGrid products={scopedProducts} isLoading={productsLoading} view={viewMode} />
            </div>
          </TabsContent>

          <TabsContent value="agencies">
            <div className="py-8">
              <AgencyGrid agencies={agencies} isLoading={agenciesLoading} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Directory;
