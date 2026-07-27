import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DirectoryHeader from '@/components/directory/DirectoryHeader';
import NewsCarousel from '@/components/directory/NewsCarousel';
import DirectoryFilters from '@/components/directory/DirectoryFilters';
import DirectoryGrid from '@/components/directory/DirectoryGrid';
import DirectoryViewToggle, { ViewMode } from '@/components/directory/DirectoryViewToggle';
import CompanyGrid from '@/components/directory/CompanyGrid';
import CompanyFilterBar from '@/components/directory/CompanyFilterBar';
import AgencyGrid from '@/components/directory/AgencyGrid';
import UseCaseGrid from '@/components/directory/UseCaseGrid';
import DirectoryCategoryTiles from '@/components/home/DirectoryCategoryTiles';
import { Button } from '@/components/ui/button';
import { trackPageView, trackEvent } from '@/lib/analytics';
import { useSeo } from '@/hooks/useSeo';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useXRCompanies, CompanyFilters } from '@/hooks/useXRCompanies';
import { useXRProducts, ProductFilters } from '@/hooks/useXRProducts';
import { useXRAgencies, AgencyFilters } from '@/hooks/useXRAgencies';
import { useXRUseCases, UseCaseFilters } from '@/hooks/useXRUseCases';
import { Building2, Package, Layers, Briefcase, Plus } from 'lucide-react';

const Directory = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'companies';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [companyFilters, setCompanyFilters] = useState<CompanyFilters>({
    category: searchParams.get('category') || undefined,
    aiCapability: searchParams.get('ai') || undefined,
    group: searchParams.get('group') || undefined,
  });
  const [productFilters, setProductFilters] = useState<ProductFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [agencyFilters, setAgencyFilters] = useState<AgencyFilters>({});
  const [useCaseFilters, setUseCaseFilters] = useState<UseCaseFilters>({});

  const { data: companies, isLoading: companiesLoading } = useXRCompanies(companyFilters);
  const { data: products, isLoading: productsLoading } = useXRProducts(productFilters);
  const { data: agencies, isLoading: agenciesLoading } = useXRAgencies(agencyFilters);
  const { data: useCases, isLoading: useCasesLoading } = useXRUseCases(useCaseFilters);

  useSeo({
    title: 'XR Directory — Companies Building the Human Interface to AI | Asentio',
    description:
      'Browse the Asentio XR Directory: devices, components, artificial intelligence, platforms, applications and ecosystem companies building the human interface to AI.',
    canonicalPath: '/xr-directory',
  });

  useEffect(() => {
    trackPageView('/xr-directory');
  }, []);

  useEffect(() => {
    trackEvent('directory_tab_view', { tab: activeTab }, '/xr-directory');
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <DirectoryHeader />
      <NewsCarousel />

      {/* Category tiles — the primary way in */}
      <div className="container mx-auto px-4 pt-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <div className="w-12 h-1 bg-asentio-red mb-3" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Browse by layer of the stack</h2>
            <p className="text-muted-foreground mt-1">
              Six layers between a person and an AI system.
            </p>
          </div>
          <Link to="/xr-directory/submit">
            <Button className="bg-asentio-red hover:bg-asentio-red/90 text-white whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" /> Add your company
            </Button>
          </Link>
        </div>
        <DirectoryCategoryTiles />
      </div>

      <div className="container mx-auto px-4 py-10 md:py-14">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8">
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

          <TabsContent value="companies">
            <CompanyFilterBar filters={companyFilters} onChange={setCompanyFilters} />
            <div className="py-8">
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
