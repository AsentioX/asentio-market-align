import { useState, useEffect } from 'react';
import DirectoryHeader from '@/components/directory/DirectoryHeader';
import DirectoryFilters from '@/components/directory/DirectoryFilters';
import DirectoryGrid from '@/components/directory/DirectoryGrid';
import DirectoryCTA from '@/components/directory/DirectoryCTA';
import { useXRProducts, ProductFilters } from '@/hooks/useXRProducts';

const Directory = () => {
  const [filters, setFilters] = useState<ProductFilters>({});
  const { data: products, isLoading } = useXRProducts(filters);

  // SEO meta tags
  useEffect(() => {
    document.title = 'AI-Powered Consumer XR Products & Services Directory | Asentio';
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Discover the world\'s most innovative XR and AI consumer products. Browse AR glasses, VR headsets, smart glasses, and spatial apps curated by Asentio\'s strategic team.');

    return () => {
      document.title = 'Asentio';
    };
  }, []);
  return (
      <div className="min-h-screen bg-background">
        <DirectoryHeader />
        <DirectoryFilters filters={filters} onFilterChange={setFilters} />
        
        <main className="container mx-auto px-4 py-12">
          <DirectoryGrid products={products} isLoading={isLoading} />
        </main>
        
        <DirectoryCTA />
      </div>
  );
};

export default Directory;
