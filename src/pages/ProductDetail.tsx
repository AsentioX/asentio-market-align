import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Brain, MapPin, Package, Sparkles, Check, ChevronLeft, ChevronRight, Code2 } from 'lucide-react';
import { useXRProduct } from '@/hooks/useXRProducts';
import { useXRUseCases } from '@/hooks/useXRUseCases';
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

const UseCasesSection = () => {
  const { data: useCases, isLoading } = useXRUseCases();

  if (isLoading || !useCases || useCases.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-4">Use Cases</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {useCases.slice(0, 6).map((uc) => (
            <div key={uc.id} className="rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[16/10] bg-muted overflow-hidden">
                {uc.image_url ? (
                  <img src={uc.image_url} alt={uc.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <Package className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-foreground line-clamp-1">{uc.title}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="secondary" className="text-xs">{uc.device}</Badge>
                  {uc.agency && (
                    <span className="text-xs text-muted-foreground">by {uc.agency.name}</span>
                  )}
                </div>
                {uc.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{uc.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

import { XRProduct } from '@/hooks/useXRProducts';

const SpecRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
};

const BoolRow = ({ label, value }: { label: string; value: boolean | null | undefined }) => {
  if (value == null) return null;
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge variant={value ? 'default' : 'secondary'} className="text-xs">{value ? 'Yes' : 'No'}</Badge>
    </div>
  );
};

const SpecificationsSection = ({ product }: { product: XRProduct }) => {
  const sections = [
    {
      title: '🧠 Platform & Software',
      rows: [
        { type: 'text' as const, label: 'Operating System', value: product.operating_system },
        { type: 'text' as const, label: 'Standalone / Tethered', value: product.standalone_or_tethered },
        { type: 'text' as const, label: 'SDK Availability', value: product.sdk_availability },
        { type: 'bool' as const, label: 'OpenXR Compatible', value: product.openxr_compatible },
        { type: 'text' as const, label: 'App Store', value: product.app_store_availability },
        { type: 'bool' as const, label: 'Sideloading Allowed', value: product.sideloading_allowed },
      ],
    },
    {
      title: '👁 Display & Optics',
      rows: [
        { type: 'text' as const, label: 'Optics Type', value: product.optics_type },
        { type: 'text' as const, label: 'Field of View', value: product.field_of_view },
        { type: 'text' as const, label: 'Resolution per Eye', value: product.resolution_per_eye },
        { type: 'text' as const, label: 'Refresh Rate', value: product.refresh_rate },
        { type: 'text' as const, label: 'Brightness', value: product.brightness_nits },
      ],
    },
    {
      title: '📡 Sensors & Tracking',
      rows: [
        { type: 'text' as const, label: 'Tracking Type', value: product.tracking_type },
        { type: 'bool' as const, label: 'SLAM Support', value: product.slam_support },
        { type: 'bool' as const, label: 'Hand Tracking', value: product.hand_tracking },
        { type: 'bool' as const, label: 'Eye Tracking', value: product.eye_tracking },
        { type: 'bool' as const, label: 'Camera Access for Devs', value: product.camera_access_for_devs },
      ],
    },
    {
      title: '🤖 AI & Compute',
      rows: [
        { type: 'text' as const, label: 'SoC / Processor', value: product.soc_processor },
        { type: 'text' as const, label: 'RAM', value: product.ram },
        { type: 'bool' as const, label: 'On-device AI', value: product.on_device_ai },
        { type: 'text' as const, label: 'Voice Assistant', value: product.voice_assistant },
        { type: 'text' as const, label: 'Cloud Dependency', value: product.cloud_dependency },
      ],
    },
    {
      title: '🔋 Hardware & Connectivity',
      rows: [
        { type: 'text' as const, label: 'Battery Life', value: product.battery_life },
        { type: 'text' as const, label: 'Weight', value: product.weight },
        { type: 'text' as const, label: 'WiFi / Bluetooth', value: product.wifi_bluetooth_version },
        { type: 'bool' as const, label: '5G / Cellular', value: product.cellular_5g },
      ],
    },
  ];

  // Only show sections that have at least one non-null value
  const visibleSections = sections.filter(s => s.rows.some(r => r.value != null));
  if (visibleSections.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6">Technical Specifications</h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
          {visibleSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-medium text-foreground mb-3">{section.title}</h3>
              <div>
                {section.rows.map((row) =>
                  row.type === 'bool' ? (
                    <BoolRow key={row.label} label={row.label} value={row.value as boolean | null} />
                  ) : (
                    <SpecRow key={row.label} label={row.label} value={row.value as string | null} />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
        {product.developer_docs_url && (
          <div className="mt-6 pt-4 border-t border-border">
            <a href={product.developer_docs_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-asentio-blue hover:underline">
              <Code2 className="w-4 h-4" />
              Developer Documentation →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
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



                  {product.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Technical Specifications */}
              <SpecificationsSection product={product} />

              {/* Use Cases */}
              <UseCasesSection />
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

                    {product.developer_resources_url && (
                      <a
                        href={product.developer_resources_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-3"
                      >
                        <Button variant="outline" className="w-full">
                          Developer Resources
                          <Code2 className="ml-2 w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Developer Readiness Score */}
              {(product.open_ecosystem_score || product.ai_access_score || product.spatial_capability_score || product.monetization_score || product.platform_viability_score) && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Developer Readiness</h3>
                    <div className="space-y-3">
                      {([
                        { label: 'Open Ecosystem', value: product.open_ecosystem_score },
                        { label: 'AI Access', value: product.ai_access_score },
                        { label: 'Spatial Capability', value: product.spatial_capability_score },
                        { label: 'Monetization', value: product.monetization_score },
                        { label: 'Platform Viability', value: product.platform_viability_score },
                      ] as const).filter(s => s.value != null).map(({ label, value }) => (
                        <div key={label}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-semibold text-foreground">{value}/5</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-asentio-blue rounded-full transition-all"
                              style={{ width: `${(value! / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
