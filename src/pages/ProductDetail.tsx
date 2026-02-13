import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Brain, MapPin, Package, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useXRProduct } from '@/hooks/useXRProducts';
import DirectoryCTA from '@/components/directory/DirectoryCTA';

const ProductImageCarousel = ({ imageUrl, name }: { imageUrl: string; name: string }) => {
  // Currently single image; ready for multiple images when DB supports it
  const images = [imageUrl];
  const [current, setCurrent] = useState(0);

  return (
    <div className="relative w-full bg-muted">
      <div className="container mx-auto">
        <div className="relative aspect-[21/9] max-h-[400px] overflow-hidden">
          <img
            src={images[current]}
            alt={`${name} - image ${current + 1}`}
            className="w-full h-full object-contain"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrent(i => (i - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrent(i => (i + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors shadow-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      idx === current ? 'bg-asentio-blue' : 'bg-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useXRProduct(slug || '');

  // SEO meta tags
  useEffect(() => {
    if (product) {
      document.title = `${product.name} - XR Directory | Asentio`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', product.description || `${product.name} by ${product.company} - ${product.category}`);
    }

    return () => {
      document.title = 'Asentio';
    };
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-asentio-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/xr-directory">
          <Button>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-background pt-24">
        {/* Product Image Carousel */}
        {product.image_url && (
          <ProductImageCarousel imageUrl={product.image_url} name={product.name} />
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link to="/xr-directory" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card>
                <CardContent className="p-6 md:p-8">
                  {product.is_editors_pick && (
                    <div className="flex items-center gap-2 text-asentio-blue mb-4">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-semibold uppercase tracking-wide">Editor's Pick</span>
                    </div>
                  )}
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {product.name}
                  </h1>
                  
                  <p className="text-lg text-muted-foreground mb-6">
                    by {product.company}
                  </p>

                  {product.editors_note && (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                      <p className="text-asentio-blue italic">{product.editors_note}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {product.category}
                    </Badge>
                    <Badge className={`text-sm px-3 py-1 ${
                      product.ai_integration === 'Yes' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : product.ai_integration === 'Partial'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Brain className="w-3.5 h-3.5 mr-1.5" />
                      AI: {product.ai_integration}
                    </Badge>
                  </div>

                  {product.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Key Features */}
              {product.key_features && product.key_features.length > 0 && (
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-4">Key Features</h2>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {product.key_features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-asentio-blue/10 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-asentio-blue" />
                          </div>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {product.price_range && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Price Range</p>
                        <p className="text-2xl font-bold text-foreground">{product.price_range}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-sm">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={`${
                        product.shipping_status === 'Available' || product.shipping_status === 'Shipping'
                          ? 'bg-green-100 text-green-700'
                          : product.shipping_status === 'Preorder'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {product.shipping_status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Region:</span>
                      <span className="text-foreground">{product.region}</span>
                    </div>

                    {product.link && (
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-6"
                      >
                        <Button className="w-full bg-asentio-blue hover:bg-asentio-blue/90">
                          Visit Product Website
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* CTA Card */}
              <Card className="bg-gradient-to-br from-asentio-blue to-asentio-blue/90 text-white">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Interested in this product?</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Let Asentio help you evaluate and integrate XR solutions for your business.
                  </p>
                  <Link to="/contact">
                    <Button variant="secondary" className="w-full">
                      Talk to an Expert
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <DirectoryCTA />
        </div>
      </div>
  );
};

export default ProductDetail;
