import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Brain, Sparkles, Package, MapPin } from 'lucide-react';
import { XRProduct } from '@/hooks/useXRProducts';

interface ProductCardProps {
  product: XRProduct;
}

const getAIBadgeColor = (ai: string) => {
  switch (ai) {
    case 'Yes':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Partial':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

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

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/xr-directory/${product.slug}`} className="block">
    <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 border flex flex-col ${
      product.is_editors_pick ? 'border-asentio-blue/30 bg-gradient-to-br from-blue-50/50 to-white' : 'border-border'
    }`}>
      {/* Product Image */}
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Package className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
        {product.is_editors_pick && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-asentio-blue text-white px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs font-semibold">Editor's Pick</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-asentio-blue transition-colors line-clamp-1">
                {product.name}
              </h3>
            <p className="text-sm text-muted-foreground">{product.company}</p>
          </div>
          
          {product.link && (
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(product.link!, '_blank', 'noopener,noreferrer');
              }}
              className="p-2 rounded-full bg-muted hover:bg-asentio-blue hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </span>
          )}
        </div>
        
        
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{product.region}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              <Badge className={`text-xs ${getStatusBadgeColor(product.shipping_status)}`}>
                {product.shipping_status}
              </Badge>
            </div>
          </div>
          
          {product.price_range && (
            <span className="font-semibold text-sm text-foreground">
              {product.price_range}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
    </Link>
  );
};

export default ProductCard;
