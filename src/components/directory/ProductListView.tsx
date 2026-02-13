import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Package, MapPin, Sparkles } from 'lucide-react';
import { XRProduct } from '@/hooks/useXRProducts';

interface ProductListViewProps {
  products: XRProduct[];
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Available':
    case 'Shipping':
      return 'bg-green-100 text-green-700';
    case 'Preorder':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const ProductListView = ({ products }: ProductListViewProps) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b border-border">
        <span>Product</span>
        <span>Category</span>
        <span>Status</span>
        <span>Region</span>
        <span>Price</span>
        <span className="w-8" />
      </div>

      {/* Rows */}
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/xr-directory/${product.slug}`}
          className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors items-center"
        >
          {/* Product info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm text-foreground truncate">{product.name}</span>
                {product.is_editors_pick && <Sparkles className="w-3 h-3 text-asentio-blue shrink-0" />}
              </div>
              <span className="text-xs text-muted-foreground">{product.company}</span>
            </div>
          </div>

          {/* Category */}
          <span className="text-xs text-muted-foreground hidden md:block">{product.category}</span>

          {/* Status */}
          <div className="hidden md:block">
            <Badge className={`text-xs ${getStatusBadgeColor(product.shipping_status)}`}>
              {product.shipping_status}
            </Badge>
          </div>

          {/* Region */}
          <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{product.region}</span>
          </div>

          {/* Price */}
          <span className="text-sm font-semibold text-foreground hidden md:block">
            {product.price_range || '—'}
          </span>

          {/* Link */}
          <div className="hidden md:block">
            {product.link && (
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(product.link!, '_blank', 'noopener,noreferrer');
                }}
                className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer inline-flex"
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            )}
          </div>

          {/* Mobile meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground md:hidden">
            <span>{product.category}</span>
            <Badge className={`text-xs ${getStatusBadgeColor(product.shipping_status)}`}>
              {product.shipping_status}
            </Badge>
            {product.price_range && <span className="font-semibold text-foreground">{product.price_range}</span>}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductListView;
