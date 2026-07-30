import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DirectoryHeader from '@/components/directory/DirectoryHeader';
import DirectoryFilters from '@/components/directory/DirectoryFilters';
import DirectoryGrid from '@/components/directory/DirectoryGrid';
import DirectoryViewToggle, { ViewMode } from '@/components/directory/DirectoryViewToggle';
import CompanyGrid from '@/components/directory/CompanyGrid';
import HAIFilterPanel from '@/components/directory/HAIFilterPanel';
import AgencyGrid from '@/components/directory/AgencyGrid';
import UseCaseGrid from '@/components/directory/UseCaseGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { trackPageView, trackEvent } from '@/lib/analytics';
import { useSeo } from '@/hooks/useSeo';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useXRCompanies, CompanyFilters, HAISelections } from '@/hooks/useXRCompanies';
import { useXRProducts, ProductFilters } from '@/hooks/useXRProducts';
import { useXRAgencies, AgencyFilters } from '@/hooks/useXRAgencies';
import { useXRUseCases, UseCaseFilters } from '@/hooks/useXRUseCases';
import { HAI_DIMENSIONS, HAIDimensionKey } from '@/lib/haiFramework';
import { Building2, Package, Layers, Briefcase, Plus, Search, Compass, X } from 'lucide-react';

const Directory = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'companies';
  const [activeTab, setActiveTab] = useState(initialTab);

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

  const companyFilters: CompanyFilters = useMemo(
    () => ({ search: companySearch || undefined, selections, logic }),
    [companySearch, selections, logic]
  );

  const [productFilters, setProductFilters] = useState<ProductFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [agencyFilters] = useState<AgencyFilters>({});
  const [useCaseFilters] = useState<UseCaseFilters>({});

  const { data: companies, isLoading: companiesLoading } = useXRCompanies(companyFilters);
  const { data: products, isLoading: productsLoading } = useXRProducts(productFilters);
  const { data: agencies, isLoading: agenciesLoading } = useXRAgencies(agencyFilters);
  const { data: useCases, isLoading: useCasesLoading } = useXRUseCases(useCaseFilters);

  const activeChips = Object.entries(selections).flatMap(([key, values]) =>
    (values || []).map((value) => ({ key: key as HAIDimensionKey, value }))
  );

  const removeChip = (key: HAIDimensionKey, value: string) =>
    setSelections({ ...selections, [key]: (selections[key] || []).filter((v) => v !== value) });

  useSeo({
    title: 'HAI Directory — How Companies Augment Humans with AI | Asentio',
    description:
      'Browse the Asentio HAI Directory by human activity, human capability, AI capability, interface, platform, industry and ecosystem role — everything begins with the human.',
    canonicalPath: '/hai-directory',
  });

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
              <TabsTrigger value="use-cases" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Use Cases</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Link to="/hai-directory/solution-explorer">
                <Button variant="outline" className="whitespace-nowrap border-2">
                  <Compass className="w-4 h-4 mr-2" /> Solution Explorer
                </Button>
              </Link>
              <Link to="/hai-directory/submit">
                <Button className="bg-asentio-red hover:bg-asentio-red/90 text-white whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" /> Add your company
                </Button>
              </Link>
            </div>
          </div>

          <TabsContent value="companies">
            <CompanyHAIFilterBar
              search={companySearch}
              onSearchChange={setCompanySearch}
              selections={selections}
              onChange={setSelections}
              logic={logic}
              onLogicChange={setLogic}
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
              <CompanyGrid companies={companies} isLoading={companiesLoading} />
            </div>
          </TabsContent>


          <TabsContent value="products">
            <div className="flex items-center justify-between gap-4 mb-4">
              <DirectoryFilters filters={productFilters} onFilterChange={setProductFilters} />
              <DirectoryViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>
            <div className="py-4">
              <DirectoryGrid products={products} isLoading={productsLoading} view={viewMode} />
            </div>
          </TabsContent>

          <TabsContent value="agencies">
            <div className="py-8">
              <AgencyGrid agencies={agencies} isLoading={agenciesLoading} />
            </div>
          </TabsContent>

          <TabsContent value="use-cases">
            <div className="py-8">
              <UseCaseGrid useCases={useCases} isLoading={useCasesLoading} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Directory;

