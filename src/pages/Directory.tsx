import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DirectoryHeader from '@/components/directory/DirectoryHeader';
import DirectoryFilters from '@/components/directory/DirectoryFilters';
import DirectoryGrid from '@/components/directory/DirectoryGrid';
import DirectoryCTA from '@/components/directory/DirectoryCTA';
import { useXRProducts, ProductFilters } from '@/hooks/useXRProducts';

const Directory = () => {
  const [filters, setFilters] = useState<ProductFilters>({});
  const { data: products, isLoading } = useXRProducts(filters);

  return (
    <>
      <Helmet>
        <title>AI-Powered Consumer XR Products & Services Directory | Asentio</title>
        <meta 
          name="description" 
          content="Discover the world's most innovative XR and AI consumer products. Browse AR glasses, VR headsets, smart glasses, and spatial apps curated by Asentio's strategic team." 
        />
        <meta name="keywords" content="best AI smart glasses, consumer AR directory, XR products 2026, AI glasses comparison, AR/VR launch support, smart glasses, mixed reality" />
        <link rel="canonical" href="https://asentio.com/xr-directory" />
        
        {/* Open Graph */}
        <meta property="og:title" content="AI-Powered Consumer XR Products & Services Directory | Asentio" />
        <meta property="og:description" content="Discover the world's most innovative XR and AI consumer products curated by Asentio." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://asentio.com/xr-directory" />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "XR & AI Consumer Products Directory",
            "description": "Curated directory of XR and AI consumer products",
            "url": "https://asentio.com/xr-directory",
            "numberOfItems": products?.length || 0,
            "itemListElement": products?.map((product, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": product.name,
                "description": product.description,
                "brand": {
                  "@type": "Brand",
                  "name": product.company
                },
                "category": product.category,
                "url": `https://asentio.com/xr-directory/${product.slug}`
              }
            })) || []
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <DirectoryHeader />
        <DirectoryFilters filters={filters} onFilterChange={setFilters} />
        
        <main className="container mx-auto px-4 py-12">
          <DirectoryGrid products={products} isLoading={isLoading} />
        </main>
        
        <DirectoryCTA />
      </div>
    </>
  );
};

export default Directory;
