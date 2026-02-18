import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DirectoryHeader from '@/components/directory/DirectoryHeader';
import DirectoryFilters from '@/components/directory/DirectoryFilters';
import DirectoryGrid from '@/components/directory/DirectoryGrid';
import DirectoryViewToggle, { ViewMode } from '@/components/directory/DirectoryViewToggle';
import DerivedCompanyGrid from '@/components/directory/DerivedCompanyGrid';
import AgencyGrid from '@/components/directory/AgencyGrid';
import UseCaseGrid from '@/components/directory/UseCaseGrid';
import DirectoryCTA from '@/components/directory/DirectoryCTA';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useXRProducts, ProductFilters } from '@/hooks/useXRProducts';
import { useXRAgencies, AgencyFilters } from '@/hooks/useXRAgencies';
import { useXRUseCases, UseCaseFilters } from '@/hooks/useXRUseCases';
import { Package, Building, Building2, Layers } from 'lucide-react';

const Directory = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'products';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [productFilters, setProductFilters] = useState<ProductFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [agencyFilters, setAgencyFilters] = useState<AgencyFilters>({});
  const [useCaseFilters, setUseCaseFilters] = useState<UseCaseFilters>({});
  
  const { data: products, isLoading: productsLoading } = useXRProducts(productFilters);
  const { data: allProducts, isLoading: allProductsLoading } = useXRProducts({});
  const { data: agencies, isLoading: agenciesLoading } = useXRAgencies(agencyFilters);
  const { data: useCases, isLoading: useCasesLoading } = useXRUseCases(useCaseFilters);

  // SEO meta tags
  useEffect(() => {
    document.title = 'XR Products, Agencies & Use Cases Directory | Asentio';
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Discover XR products, find top XR agencies, and explore real-world use cases. Your complete resource for enterprise XR solutions—devices, tech stacks, and implementation partners.');

    return () => {
      document.title = 'Asentio';
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DirectoryHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Companies</span>
            </TabsTrigger>
            <TabsTrigger value="agencies" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Agencies</span>
            </TabsTrigger>
            <TabsTrigger value="use-cases" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Use Cases</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <div className="flex items-center justify-between gap-4 mb-4">
              <DirectoryFilters filters={productFilters} onFilterChange={setProductFilters} />
              <DirectoryViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>
            <div className="py-4">
              <DirectoryGrid products={products} isLoading={productsLoading} view={viewMode} />
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <div className="py-8">
              <DerivedCompanyGrid products={allProducts} isLoading={allProductsLoading} />
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
      
      <DirectoryCTA />
    </div>
  );
};

export default Directory;
