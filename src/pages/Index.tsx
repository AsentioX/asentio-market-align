import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import TopographicPattern from "@/components/TopographicPattern";
import LatestInsights from "@/components/home/LatestInsights";
import HumanAIFramework from "@/components/home/HumanAIFramework";


import NewsCarousel from "@/components/directory/NewsCarousel";
import NewsletterSignup from "@/components/NewsletterSignup";
import ARBackground from "@/components/ARBackground";
import WorldTimeMarquee from "@/components/WorldTimeMarquee";
import { useXRCompanies } from "@/hooks/useXRCompanies";
import { useSeo } from "@/hooks/useSeo";
import { initSession, trackPageView, createScrollTracker, trackTimeOnPage } from "@/lib/analytics";
import asentioMark from "@/assets/a-doc-mark.png.asset.json";



const Index = () => {
  const { data: companies } = useXRCompanies();

  useSeo({
    title: "Asentio: Interfacing Humans and AI",
    description:
      "Asentio tracks and advises the companies bridging the human to AI. Explore the HAI Directory of devices, components, AI, platforms, applications and ecosystem.",
    canonicalPath: "/",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    initSession().then(() => trackPageView("/"));
    const start = Date.now();
    const onScroll = createScrollTracker("/");
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      trackTimeOnPage(Date.now() - start, "/");
    };
  }, []);

  const companyCount = companies?.length ?? 0;

  return (
    <div className="overflow-x-hidden relative">
      {/* ---------------- World clock marquee ---------------- */}
      <WorldTimeMarquee />

      {/* ---------------- Hero: the directory front door ---------------- */}
      <section className="relative bg-background pt-12 md:pt-16 pb-14 md:pb-20 overflow-hidden">
        <TopographicPattern className="opacity-60" />
        <ARBackground />
        <div className="absolute top-0 left-0 w-1 h-40 bg-gradient-to-b from-asentio-red to-transparent" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full mb-6">
              <span className="w-2 h-2 bg-asentio-red rounded-full animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                AI · WEARABLES · STRATEGY
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-foreground mb-6">
              The Human AI Interface
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mb-4">
              AI needs a body in the world. Glasses, rings, watches and other wearables are becoming how people actually reach
              intelligence.
            </p>
            <p className="text-base md:text-lg text-muted-foreground/90 max-w-2xl mb-8">
              Start with the HAI Directory: devices, components, artificial intelligence, platforms, applications and the
              ecosystem around them.
            </p>


            {companyCount > 0 && (
              <p className="mt-6 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{companyCount}</span> companies tracked across six
                layers of the stack.
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ---------------- Convergence thesis ---------------- */}
      {/* ---------------- Human + AI Framework ---------------- */}
      <HumanAIFramework />



      {/* ---------------- Latest insights ---------------- */}
      <AnimatedSection className="py-12 md:py-20 bg-background relative">
        <TopographicPattern className="opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <LatestInsights limit={3} subheading="Analysis on the convergence of wearables" />
        </div>
      </AnimatedSection>

      {/* ---------------- Latest HAI News ---------------- */}
      <NewsCarousel />

      {/* ---------------- The Human AI Interface Briefing ---------------- */}
      <AnimatedSection className="py-12 md:py-20 bg-asentio-blue relative overflow-hidden">
        <TopographicPattern variant="dark" className="opacity-100" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-asentio-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-asentio-red/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <NewsletterSignup source="homepage" />
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="text-center text-primary-foreground/80">
                <img
                  src={asentioMark.url}
                  alt="Asentio mark"
                  className="w-20 h-20 mx-auto mb-4 object-contain"
                />

                <p className="text-sm font-medium tracking-wider uppercase text-primary-foreground/60">
                  Asentio Briefing
                </p>
                <p className="text-primary-foreground/40 text-sm mt-1">
                  At the intersection of Humans and AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Index;
