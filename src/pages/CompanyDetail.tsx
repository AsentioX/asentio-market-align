import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useXRProducts, XRProduct } from '@/hooks/useXRProducts';
import { XRCompany } from '@/hooks/useXRCompanies';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TopographicPattern from '@/components/TopographicPattern';
import { useSeo } from '@/hooks/useSeo';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Package,
  Loader2,
  Sparkles,
  Cpu,
  Hand,
  Users,
  Calendar,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { trackPageView, trackEvent } from '@/lib/analytics';

const CompanyDetail = () => {
  const { companyName } = useParams<{ companyName: string }>();
  const key = decodeURIComponent(companyName || '');
  const { data: allProducts, isLoading: productsLoading } = useXRProducts({});

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['xr-company-profile', key],
    enabled: !!key,
    queryFn: async () => {
      const { data: bySlug } = await supabase
        .from('xr_companies')
        .select('*')
        .eq('slug', key)
        .maybeSingle();
      if (bySlug) return bySlug as XRCompany;

      const { data: byName } = await supabase
        .from('xr_companies')
        .select('*')
        .eq('name', key)
        .maybeSingle();
      return (byName as XRCompany) || null;
    },
  });

  const displayName = company?.name || key;

  const companyProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts
      .filter(
        (p) =>
          p.company === displayName ||
          (company && (p as XRProduct & { company_id?: string }).company_id === company.id)
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allProducts, displayName, company]);

  useSeo({
    title: `${displayName} — Company Profile | Asentio HAI Directory`,
    description:
      company?.description ||
      `${displayName} in the Asentio HAI Directory: products, technology, AI capabilities and market focus.`,
    canonicalPath: `/hai-directory/company/${encodeURIComponent(company?.slug || key)}`,
    ogImage: company?.logo_url || undefined,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!displayName) return;
    trackPageView(`/hai-directory/company/${key}`);
    trackEvent('directory_view', {
      item_type: 'company',
      name: displayName,
      product_count: companyProducts.length,
    });
  }, [displayName, key, companyProducts.length]);

  if (companyLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  if (!company && companyProducts.length === 0) {
    return (
      <div className="min-h-screen pt-32">
        <div className="container mx-auto px-4">
          <Link to="/hai-directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Company not found</h1>
          <p className="text-muted-foreground">
            We don't have a profile for “{key}” yet.{' '}
            <Link to="/hai-directory/submit" className="text-asentio-blue hover:underline">
              Add it to the directory.
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const categories = [company?.primary_category, ...(company?.subcategories || [])].filter(Boolean) as string[];
  const productCategories = [...new Set(companyProducts.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative pt-28 md:pt-36 pb-8 md:pb-12 bg-muted">
        <TopographicPattern className="opacity-30" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <Link to="/hai-directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${displayName} logo`}
                className="w-20 h-20 object-contain rounded-xl bg-background p-2 border border-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-background border border-border flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">{displayName.charAt(0)}</span>
              </div>
            )}

            <div className="flex-1">
              <div className="w-12 h-1 bg-asentio-red mb-4" />
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">{displayName}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {company?.company_type && (
                  <span className="font-medium text-asentio-blue">{company.company_type}</span>
                )}
                {company?.hq_location && (
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {company.hq_location}</span>
                )}
                {company?.founded_year && (
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Founded {company.founded_year}</span>
                )}
                {company?.company_size && (
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {company.company_size}</span>
                )}
                {companyProducts.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" /> {companyProducts.length} product
                    {companyProducts.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {company?.description && (
                <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed mb-4">
                  {company.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-5">
                {(categories.length ? categories : productCategories).map((cat) => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {company?.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-asentio-blue hover:bg-asentio-blue/90">
                      <ExternalLink className="w-4 h-4 mr-2" /> Visit website
                    </Button>
                  </a>
                )}
                <Link
                  to={`/hai-directory/submit?claim=${encodeURIComponent(company?.id || key)}&company=${encodeURIComponent(displayName)}`}
                >
                  <Button variant="outline" className="border-2">
                    <ShieldCheck className="w-4 h-4 mr-2" /> Claim this profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asentio Take */}
      {company?.asentio_take && (
        <section className="container mx-auto px-4 md:px-6 py-8">
          <div className="rounded-xl border-l-4 border-asentio-red bg-card border border-border p-6 md:p-8 max-w-4xl">
            <p className="text-xs uppercase tracking-wide text-asentio-red font-semibold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> The Asentio Take
            </p>
            <p className="text-foreground leading-relaxed">{company.asentio_take}</p>
          </div>
        </section>
      )}

      {/* Intelligence panels */}
      <section className="container mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Panel icon={Cpu} title="AI capabilities" items={company?.ai_capabilities} />
          <Panel icon={Hand} title="Human interface" items={company?.human_interface} />
          <Panel icon={Package} title="Technologies" items={company?.technologies} />
          <Panel icon={Landmark} title="Target markets" items={company?.target_markets} />
        </div>

        {(company?.funding_stage ||
          (company?.key_investors || []).length > 0 ||
          (company?.key_partnerships || []).length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            {company?.funding_stage && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-foreground mb-2">Funding stage</h2>
                <p className="text-muted-foreground text-sm">{company.funding_stage}</p>
              </div>
            )}
            <Panel title="Key investors" items={company?.key_investors} />
            <Panel title="Partnerships" items={company?.key_partnerships} />
          </div>
        )}

        {company?.products_summary && (
          <div className="bg-card border border-border rounded-xl p-6 mt-5">
            <h2 className="text-sm font-semibold text-foreground mb-2">Products</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{company.products_summary}</p>
          </div>
        )}
      </section>

      {/* Product timeline */}
      {companyProducts.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 pb-16">
          <h2 className="text-xl font-semibold text-foreground mb-6">Product timeline</h2>
          <div className="relative">
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-8">
              {companyProducts.map((product) => (
                <TimelineItem key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const Panel = ({
  icon: Icon,
  title,
  items,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  items?: string[] | null;
}) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-asentio-red" />}
        {title}
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
        ))}
      </div>
    </div>
  );
};

const TimelineItem = ({ product }: { product: XRProduct }) => {
  const date = new Date(product.created_at);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="relative flex gap-4 md:gap-6 pl-2">
      <div className="relative z-10 mt-1.5 w-5 h-5 rounded-full bg-asentio-blue border-2 border-background flex-shrink-0" />

      <Card className="flex-1 hover:shadow-md transition-shadow">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to={`/hai-directory/${product.slug}`}
                  className="font-semibold text-foreground hover:text-asentio-red transition-colors"
                >
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
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                className="w-20 h-20 object-cover rounded-md flex-shrink-0 hidden sm:block"
              />
            )}
          </div>
          {product.link && (
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-asentio-blue hover:underline mt-2"
            >
              <ExternalLink className="w-3 h-3" /> Visit Product
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDetail;
