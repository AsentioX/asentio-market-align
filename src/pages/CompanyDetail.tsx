import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useXRProducts, XRProduct } from "@/hooks/useXRProducts";
import { XRCompany, useXRCompanies, companyValues } from "@/hooks/useXRCompanies";
import RelatedCompanies from "@/components/directory/RelatedCompanies";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TopographicPattern from "@/components/TopographicPattern";
import { useSeo } from "@/hooks/useSeo";
import { HAI_DIMENSIONS } from "@/lib/haiFramework";
import { ExternalLink, MapPin, Package, Loader2, Sparkles, Users, Calendar, Landmark } from "lucide-react";
import { trackPageView, trackEvent } from "@/lib/analytics";

const CompanyDetail = () => {
  const { companyName } = useParams<{ companyName: string }>();
  const key = decodeURIComponent(companyName || "");
  const { data: allProducts, isLoading: productsLoading } = useXRProducts({});
  const { data: allCompanies } = useXRCompanies({});

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["xr-company-profile", key],
    enabled: !!key,
    queryFn: async () => {
      const { data: bySlug } = await supabase.from("xr_companies").select("*").eq("slug", key).maybeSingle();
      if (bySlug) return bySlug as unknown as XRCompany;

      const { data: byName } = await supabase.from("xr_companies").select("*").eq("name", key).maybeSingle();
      return (byName as unknown as XRCompany) || null;
    },
  });

  const displayName = company?.name || key;

  const companyProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts
      .filter(
        (p) =>
          p.company === displayName ||
          (company && (p as XRProduct & { company_id?: string }).company_id === company.id),
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allProducts, displayName, company]);

  useSeo({
    title: `${displayName} — Company Profile | Asentio HAI Directory`,
    description:
      company?.description ||
      `${displayName} in the Asentio HAI Directory: the human activities, capabilities, AI and interfaces it augments.`,
    canonicalPath: `/hai-directory/company/${encodeURIComponent(company?.slug || key)}`,
    ogImage: company?.logo_url || undefined,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!displayName) return;
    trackPageView(`/hai-directory/company/${key}`);
    trackEvent("directory_view", {
      item_type: "company",
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Company not found</h1>
          <p className="text-muted-foreground">
            We don't have a profile for “{key}” yet.{" "}
            <Link to="/hai-directory/submit" className="text-asentio-blue hover:underline">
              Add it to the directory.
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const perspective = company?.asentio_perspective;

  return (
    <div className="min-h-screen bg-background">
      {/* Overview header with cover image */}
      <section className={`relative pt-28 md:pt-36 h-[30vh] flex flex-col ${company?.cover_image_url ? "bg-muted" : "bg-[#0a0f1f]"}`}>
        {company?.cover_image_url ? (
          <div className="absolute inset-0">
            <img src={company.cover_image_url} alt={`${displayName} cover`} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1f] via-[#111a2e] to-[#0a0f1f]" />
            <TopographicPattern className="opacity-20" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
          </>
        )}
        <div className="container mx-auto px-4 md:px-6 relative z-10 flex-1 flex flex-col">
          <div className="mt-auto pt-16 pb-6 md:pb-8 flex items-center gap-4 md:gap-6">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${displayName} logo`}
                className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl bg-background p-2 border border-border flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-muted-foreground">{displayName.charAt(0)}</span>
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">{displayName}</h1>
          </div>
        </div>
      </section>

      {/* Mission, meta, description and website link */}
      <section className="container mx-auto px-4 md:px-6 pt-6 md:pt-8">
        <div className="w-12 h-1 bg-asentio-red mb-4" />

        {company?.mission && (
          <p className="text-lg md:text-xl text-foreground/90 max-w-3xl leading-relaxed mb-3 italic">
            {company.mission}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          {company?.hq_location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {company.hq_location}
            </span>
          )}
          {company?.founded_year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Founded {company.founded_year}
            </span>
          )}
          {company?.company_size && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" /> {company.company_size}
            </span>
          )}
          {companyProducts.length > 0 && (
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4" /> {companyProducts.length} product
              {companyProducts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {(company?.description || company?.website) && (
          <div className="flex flex-col md:flex-row md:items-start gap-6 max-w-5xl">
            {company?.description && (
              <p className="text-base text-muted-foreground leading-relaxed flex-1">{company.description}</p>
            )}
            {company?.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <Button className="bg-asentio-blue hover:bg-asentio-blue/90">
                  <ExternalLink className="w-4 h-4 mr-2" /> Visit website
                </Button>
              </a>
            )}
          </div>
        )}
      </section>

      {/* Human-AI Framework */}
      <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="w-12 h-1 bg-asentio-red mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-1">Human-AI profile</h2>
        <p className="text-sm text-muted-foreground mb-6">How {displayName} augments human capability through AI.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {HAI_DIMENSIONS.map((dimension) => {
            const values = company ? companyValues(company, dimension.key) : [];
            if (values.length === 0) return null;
            return (
              <div key={dimension.key} className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground">{dimension.label}</h3>
                <p className="text-[11px] text-muted-foreground mb-3">{dimension.question}</p>
                <div className="flex flex-wrap gap-1.5">
                  {values.map((v) => (
                    <Link
                      key={v}
                      to={`/hai-directory?${dimension.key}=${encodeURIComponent(v)}`}
                      className="inline-flex"
                    >
                      <Badge
                        variant="secondary"
                        className="text-xs hover:bg-asentio-red hover:text-primary-foreground transition-colors"
                      >
                        {v}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Asentio Perspective — proprietary commentary */}
      {perspective && (
        <section className="container mx-auto px-4 md:px-6 pb-10">
          <div className="rounded-2xl bg-asentio-blue/5 border border-asentio-red/30 border-l-4 border-l-asentio-red p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-asentio-red font-semibold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Asentio Perspective
            </p>
            <p className="text-foreground text-lg leading-relaxed whitespace-pre-line font-light">{perspective}</p>
            <p className="text-xs text-muted-foreground mt-4">Proprietary analysis by Asentio.</p>
          </div>
        </section>
      )}

      {/* Related companies */}
      {company && <RelatedCompanies company={company} all={allCompanies} />}

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

const ChipPanel = ({ title, items }: { title: string; items?: string[] | null }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="text-xs">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const TimelineItem = ({ product }: { product: XRProduct }) => {
  const date = new Date(product.created_at);
  const dateStr = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

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
                {product.is_editors_pick && <Badge className="bg-asentio-blue text-white text-xs">Editor's Pick</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{dateStr}</p>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <Badge variant="outline">{product.category}</Badge>
                <Badge variant="outline">{product.shipping_status}</Badge>
                {product.price_range && (
                  <span className="font-medium text-foreground">
                    {product.price_range}
                    {product.price_type === "subscription" ? `/${product.billing_period === "year" ? "yr" : "mo"}` : ""}
                  </span>
                )}
                {product.region && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {product.region}
                  </span>
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
