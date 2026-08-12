import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XRProduct } from '@/hooks/useXRProducts';

interface Props {
  products: XRProduct[];
  companyName: string;
}

/** "Products & Platforms" — the most concrete way to understand a company. */
const CompanyProducts = ({ products, companyName }: Props) => {
  if (products.length === 0) return null;

  return (
    <section id="products" className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="w-12 h-1 bg-asentio-red mb-4" />
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Products &amp; platforms</h2>
      <p className="text-muted-foreground max-w-2xl mb-8">What {companyName} actually ships.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <article
            key={product.id}
            className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-asentio-red/40 hover:shadow-lg"
          >
            <div className="aspect-[16/10] bg-muted overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={`${product.name} product image`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground">{product.name}</h3>
                {product.is_editors_pick && (
                  <Badge className="bg-asentio-blue text-white text-[10px]">Editor's Pick</Badge>
                )}
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-4">
                {product.category && (
                  <Badge variant="outline" className="text-[10px]">
                    {product.category}
                  </Badge>
                )}
                {(product.key_features || []).slice(0, 3).map((f) => (
                  <Badge key={f} variant="secondary" className="text-[10px]">
                    {f}
                  </Badge>
                ))}
              </div>

              <div className="mt-auto">
                <Link to={`/hai-directory/${product.slug}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View product
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CompanyProducts;
