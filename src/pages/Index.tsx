import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import TopographicPattern from "@/components/TopographicPattern";
import LatestInsights from "@/components/home/LatestInsights";
import MarketMap from "@/components/home/MarketMap";
import NewsCarousel from "@/components/directory/NewsCarousel";
import NewsletterSignup from "@/components/NewsletterSignup";
import ARBackground from "@/components/ARBackground";
import WorldTimeMarquee from "@/components/WorldTimeMarquee";
import { useXRCompanies } from "@/hooks/useXRCompanies";
import { useSeo } from "@/hooks/useSeo";
import { ArrowRight, Glasses, Brain, Activity, Compass, Search } from "lucide-react";
import { initSession, trackPageView, trackCTAClick, createScrollTracker, trackTimeOnPage } from "@/lib/analytics";

const CONVERGENCE = [
  {
    icon: Glasses,
    title: "XR & Wearables",
    body: "Glasses, headsets, hearables and rings — the hardware that puts computing on the body.",
  },
  {
    icon: Brain,
    title: "Artificial Intelligence",
    body: "Multimodal, contextual and on-device models that turn raw sensing into understanding.",
  },
  {
    icon: Activity,
    title: "Human-Centered Design",
    body: "The behavior, ergonomics and trust work that decides whether any of it gets worn twice.",
  },
  {
    icon: Compass,
    title: "Market Strategy",
    body: "Positioning, channel and go-to-market for categories that don't exist yet.",
  },
];

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
                XR · AI · Wearables · Strategy
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-foreground mb-6">
              The Human AI Interface
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mb-4">
              AI needs a body in the world. Glasses, wearables and sensing are becoming how people actually reach
              intelligence.
            </p>
            <p className="text-base md:text-lg text-muted-foreground/90 max-w-2xl mb-8">
              Start with the HAI Directory: devices, components, artificial intelligence, platforms, applications and the
              ecosystem around them.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link to="/hai-directory" onClick={() => trackCTAClick("Explore the HAI Directory", true)}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-asentio-blue hover:bg-asentio-blue/90 px-8 py-6 text-base font-medium shadow-lg shadow-asentio-blue/20"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Explore the HAI Directory
                </Button>
              </Link>
              <Link to="/work-with-us">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base font-medium border-2"
                >
                  Work with Asentio
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

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
      <AnimatedSection className="py-12 md:py-20 bg-asentio-blue relative overflow-hidden">
        <TopographicPattern variant="dark" className="opacity-100" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-asentio-red/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mb-10">
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-3">
              Four forces, one convergence
            </h2>
            <p className="text-primary-foreground/80 text-base md:text-lg leading-relaxed">
              Asentio works at the point where hardware, intelligence, human behavior and market strategy stop being
              separate problems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONVERGENCE.map((item) => (
              <div
                key={item.title}
                className="bg-background/10 backdrop-blur-sm rounded-xl p-6 border border-background/20"
              >
                <item.icon className="w-6 h-6 text-asentio-red mb-4" />
                <h3 className="text-primary-foreground font-semibold mb-2">{item.title}</h3>
                <p className="text-primary-foreground/75 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ---------------- The Human Interface Stack ---------------- */}
      <AnimatedSection id="market-map" className="py-12 md:py-20 bg-muted relative">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <MarketMap />
        </div>
      </AnimatedSection>

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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-asentio-red/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-asentio-red">A</span>
                </div>
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
