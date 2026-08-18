import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useXRProducts, XRProduct } from "@/hooks/useXRProducts";
import { XRCompany, useXRCompanies } from "@/hooks/useXRCompanies";
import { useHAIUseCases } from "@/hooks/useHAIUseCases";
import {
  useCasesForCompany,
  partnersForCompany,
  partnerGroupsForCompany,
  similarCompanies,
  solutionPartnersForCompany,
} from "@/lib/haiMatching";
import CompanyUseCases from "@/components/directory/company/CompanyUseCases";
import CompanyProducts from "@/components/directory/company/CompanyProducts";
import CompanyPartners from "@/components/directory/company/CompanyPartners";
import CompanySolutionFit from "@/components/directory/company/CompanySolutionFit";
import CompanyCapabilities from "@/components/directory/company/CompanyCapabilities";
import CompanyEcosystem from "@/components/directory/company/CompanyEcosystem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TopographicPattern from "@/components/TopographicPattern";
import ARBackground from "@/components/ARBackground";
import { useSeo } from "@/hooks/useSeo";
import { HAI_CATEGORIES } from "@/lib/haiFramework";
import { ExternalLink, MapPin, Package, Loader2, Sparkles, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { trackPageView, trackEvent } from "@/lib/analytics";

/** Derive the top-level Category label from the company's interfaces / AI capabilities. */
const categoryFor = (company?: XRCompany | null): string | null => {
  if (!company) return null;
  const match = HAI_CATEGORIES.find(
    (c) =>
      c.human_interface.some((v) => (company.human_interface || []).includes(v)) ||
      (c.ai_capabilities || []).some((v) => (company.ai_capabilities || []).includes(v)),
  );
  return match?.value || null;
};

const CompanyDetail = () => {
  const { companyName } = useParams<{ companyName: string }>();
  const key = decodeURIComponent(companyName || "");
  const { data: allProducts, isLoading: productsLoading } = useXRProducts({});
  const { data: allCompanies } = useXRCompanies({});
  const { data: haiUseCases } = useHAIUseCases();

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

  const matchedUseCases = useMemo(
    () => useCasesForCompany(company, haiUseCases, 8),
    [company, haiUseCases],
  );
  const partnerGroups = useMemo(
    () => partnerGroupsForCompany(company, allCompanies, haiUseCases),
    [company, allCompanies, haiUseCases],
  );
  const partners = useMemo(
    () => partnersForCompany(company, allCompanies, haiUseCases, 6),
    [company, allCompanies, haiUseCases],
  );
  const similar = useMemo(() => similarCompanies(company, allCompanies), [company, allCompanies]);
  const solutionPartners = useMemo(
    () => solutionPartnersForCompany(company, allCompanies, haiUseCases),
    [company, allCompanies, haiUseCases],
  );

  useSeo({
    title: `${displayName} — Company Profile | Asentio HAI Directory`,
    description:
      company?.description ||
      `${displayName} in the Asentio HAI Directory: the use cases it enables, the products it ships and the partners it should work with.`,
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
  const category = categoryFor(company);
  const primaryRole = (company?.ecosystem_roles || [])[0];

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Company overview */}
      <section
        className={`relative pt-28 md:pt-36 h-[30vh] flex flex-col ${company?.cover_image_url ? "bg-muted" : "bg-[#0a0f1f]"}`}
      >
        {company?.cover_image_url ? (
          <div className="absolute inset-0">
            <img src={company.cover_image_url} alt={`${displayName} cover`} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1f] via-[#111a2e] to-[#0a0f1f]" />
            <TopographicPattern variant="darkBg" className="opacity-60" />
            <ARBackground />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
          </>
        )}
        <div className="container mx-auto px-4 md:px-6 relative z-10 flex-1 flex flex-col">
          <div className="pt-24 md:pt-28">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-muted-foreground hover:text-foreground bg-background/60 backdrop-blur-sm hover:bg-background/80"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Directory
            </Button>
          </div>
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

      <section className="container mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-10 md:pb-12">
        <div className="w-12 h-1 bg-asentio-red mb-4" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            {(category || primaryRole) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {category && <Badge className="bg-asentio-blue text-white">{category}</Badge>}
                {primaryRole && <Badge variant="outline">{primaryRole}</Badge>}
              </div>
            )}

            {company?.mission && (
              <p className="text-lg md:text-xl text-foreground/90 leading-relaxed mb-3 italic">{company.mission}</p>
            )}
            {company?.description && (
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{company.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-6">
              {company?.hq_location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {company.hq_location}
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
              {company?.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-asentio-blue hover:underline"
                >
                  <ExternalLink className="w-4 h-4" /> Website
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:pt-1">
            {companyProducts.length > 0 && (
              <a href="#products">
                <Button className="w-full bg-asentio-blue hover:bg-asentio-blue/90">
                  View products <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            )}
            <a href="#partners">
              <Button variant="outline" className="w-full">
                Find partner matches
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 2. What they enable */}
      {company && (
        <CompanyUseCases company={company} companyName={displayName} useCases={matchedUseCases} />
      )}

      {/* 3. Products & platforms */}
      <CompanyProducts products={companyProducts} companyName={displayName} />

      {/* 4. Who should they work with? */}
      <CompanyPartners companyName={displayName} groups={partnerGroups} />

      {/* 5. Human + AI solution fit */}
      {company && (
        <CompanySolutionFit company={company} companyName={displayName} useCases={matchedUseCases} />
      )}

      {/* Asentio Perspective — proprietary commentary */}
      {perspective && (
        <section className="container mx-auto px-4 md:px-6 pb-12">
          <div className="rounded-2xl bg-asentio-blue/5 border border-asentio-red/30 border-l-4 border-l-asentio-red p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-asentio-red font-semibold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Asentio Perspective
            </p>
            <p className="text-foreground text-lg leading-relaxed whitespace-pre-line font-light">{perspective}</p>
            <p className="text-xs text-muted-foreground mt-4">Proprietary analysis by Asentio.</p>
          </div>
        </section>
      )}

      {/* 6. Detailed capabilities & taxonomy */}
      {company && <CompanyCapabilities company={company} />}

      {/* 7. Explore the ecosystem */}
      <CompanyEcosystem
        companyName={displayName}
        partners={partners}
        similar={similar}
        solutionPartners={solutionPartners}
      />
    </div>
  );
};

export default CompanyDetail;
