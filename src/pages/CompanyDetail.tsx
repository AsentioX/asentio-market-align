import { useParams, Link } from 'react-router-dom';
import { useXRProducts, XRProduct } from '@/hooks/useXRProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, MapPin, Package, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

const CompanyDetail = () => {
  const { companyName } = useParams<{ companyName: string }>();
  const decodedName = decodeURIComponent(companyName || '');
  const { data: allProducts, isLoading } = useXRProducts({});

  const companyProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts
      .filter(p => p.company === decodedName)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allProducts, decodedName]);

  const companyHQ = companyProducts.find(p => p.company_hq)?.company_hq;
  const categories = [...new Set(companyProducts.map(p => p.category))];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  if (companyProducts.length === 0) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <Link to="/xr-directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
          <p className="text-muted-foreground">No products found for this company.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Link to="/xr-directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>

        {/* Company Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{decodedName}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            {companyHQ && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {companyHQ}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4" /> {companyProducts.length} product{companyProducts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map(cat => (
              <Badge key={cat} variant="secondary">{cat}</Badge>
            ))}
          </div>
        </div>

        {/* Product Timeline */}
        <h2 className="text-xl font-semibold text-foreground mb-6">Product Timeline</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-8">
            {companyProducts.map((product, idx) => (
              <TimelineItem key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({ product }: { product: XRProduct }) => {
  const date = new Date(product.created_at);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="relative flex gap-4 md:gap-6 pl-2">
      {/* Dot */}
      <div className="relative z-10 mt-1.5 w-5 h-5 rounded-full bg-asentio-blue border-2 border-background flex-shrink-0" />

      <Card className="flex-1 hover:shadow-md transition-shadow">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link to={`/xr-directory/${product.slug}`} className="font-semibold text-foreground hover:text-asentio-blue transition-colors">
                  {product.name}
                </Link>
                {product.is_editors_pick && (
                  <Badge className="bg-asentio-blue text-white text-xs">Editor's Pick</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{dateStr}</p>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <Badge variant="outline">{product.category}</Badge>
                <Badge variant="outline">{product.shipping_status}</Badge>
                {product.price_range && <span className="font-medium text-foreground">{product.price_range}</span>}
                {product.region && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{product.region}</span>
                )}
              </div>
            </div>
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0 hidden sm:block" />
            )}
          </div>
          {product.link && (
            <a href={product.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-asentio-blue hover:underline mt-2">
              <ExternalLink className="w-3 h-3" /> Visit Product
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDetail;
