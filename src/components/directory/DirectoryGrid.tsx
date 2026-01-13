import { XRProduct } from '@/hooks/useXRProducts';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';

interface DirectoryGridProps {
  products: XRProduct[] | undefined;
  isLoading: boolean;
}

const DirectoryGrid = ({ products, isLoading }: DirectoryGridProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  // Separate editor's picks from regular products
  const editorsPicks = products.filter(p => p.is_editors_pick);
  const regularProducts = products.filter(p => !p.is_editors_pick);

  return (
    <div className="space-y-12">
      {/* Editor's Picks Section */}
      {editorsPicks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-asentio-blue rounded-full" />
            <h2 className="text-xl font-semibold text-foreground">Editor's Picks</h2>
            <span className="text-sm text-muted-foreground">({editorsPicks.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editorsPicks.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* All Products Section */}
      {regularProducts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-muted-foreground rounded-full" />
            <h2 className="text-xl font-semibold text-foreground">All Products</h2>
            <span className="text-sm text-muted-foreground">({regularProducts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DirectoryGrid;
