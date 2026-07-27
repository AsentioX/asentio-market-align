import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import TopographicPattern from "@/components/TopographicPattern";
import LatestInsights from "@/components/home/LatestInsights";
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
    title: "Asentio — Interfacing Humans and AI",
    description:
      "Asentio tracks and advises the companies bridging the human to AI. Explore the XR Directory of devices, components, AI, platforms, applications and ecosystem.",
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
              The Human Interface to AI
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mb-4">
              AI needs a body in the world. Glasses, wearables and sensing are becoming how people actually reach
              intelligence.
            </p>
            <p className="text-base md:text-lg text-muted-foreground/90 max-w-2xl mb-8">
              Start with the XR Directory: devices, components, artificial intelligence, platforms, applications and the
              ecosystem around them.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link to="/xr-directory" onClick={() => trackCTAClick("Explore the XR Directory", true)}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-asentio-blue hover:bg-asentio-blue/90 px-8 py-6 text-base font-medium shadow-lg shadow-asentio-blue/20"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Explore the XR Directory
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
          <div className="max-w-3xl mb-10 md:mb-14">
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-3">
              Four forces, one convergence
            </h2>
            <p className="text-primary-foreground/80 text-base md:text-lg leading-relaxed">
              Asentio works at the point where hardware, intelligence, human behavior and market strategy stop being
              separate problems.
            </p>
          </div>

          {/* Mobile: stacked with a central convergence point */}
          <div className="md:hidden flex flex-col items-center gap-4">
            {CONVERGENCE.map((item, i) => (
              <div key={item.title} className="w-full">
                <div className="bg-background/10 backdrop-blur-sm rounded-xl p-5 border border-background/20">
                  <item.icon className="w-6 h-6 text-asentio-red mb-3" />
                  <h3 className="text-primary-foreground font-semibold mb-1">{item.title}</h3>
                  <p className="text-primary-foreground/75 text-sm leading-relaxed">{item.body}</p>
                </div>
                {i < CONVERGENCE.length - 1 && (
                  <div className="flex justify-center py-2">
                    <svg width="20" height="32" viewBox="0 0 20 32" fill="none">
                      <path
                        d="M10 0V28M10 28L3 21M10 28L17 21"
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            <div className="mt-2 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-asentio-red/20 border border-asentio-red/40 flex items-center justify-center mb-2">
                <span className="text-asentio-red font-bold text-xs tracking-widest uppercase">Asentio</span>
              </div>
              <p className="text-primary-foreground/60 text-xs tracking-wide uppercase">Convergence</p>
            </div>
          </div>

          {/* Desktop: 4 arrows converging into one central spot */}
          <div className="hidden md:block relative w-full aspect-[2/1] max-w-6xl mx-auto">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#CF0A0A" />
                </marker>
              </defs>
              <line
                x1="16"
                y1="16"
                x2="42"
                y2="42"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.8"
                markerEnd="url(#arrowhead)"
              />
              <line
                x1="84"
                y1="16"
                x2="58"
                y2="42"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.8"
                markerEnd="url(#arrowhead)"
              />
              <line
                x1="16"
                y1="84"
                x2="42"
                y2="58"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.8"
                markerEnd="url(#arrowhead)"
              />
              <line
                x1="84"
                y1="84"
                x2="58"
                y2="58"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.8"
                markerEnd="url(#arrowhead)"
              />
            </svg>

            {/* Center convergence point */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-asentio-red/20 border border-asentio-red/40 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-asentio-red/10">
                <span className="text-asentio-red font-bold text-sm lg:text-base tracking-widest uppercase text-center leading-tight">
                  Asentio
                </span>
              </div>
            </div>

            {/* Corner cards */}
            <div className="absolute top-[6%] left-[6%] w-[34%] max-w-xs">
              <div className="bg-background/10 backdrop-blur-sm rounded-xl p-5 lg:p-6 border border-background/20">
                <Glasses className="w-6 h-6 text-asentio-red mb-3" />
                <h3 className="text-primary-foreground font-semibold mb-1">{CONVERGENCE[0].title}</h3>
                <p className="text-primary-foreground/75 text-sm leading-relaxed">{CONVERGENCE[0].body}</p>
              </div>
            </div>
            <div className="absolute top-[6%] right-[6%] w-[34%] max-w-xs text-right">
              <div className="bg-background/10 backdrop-blur-sm rounded-xl p-5 lg:p-6 border border-background/20 inline-block text-left">
                <Brain className="w-6 h-6 text-asentio-red mb-3" />
                <h3 className="text-primary-foreground font-semibold mb-1">{CONVERGENCE[1].title}</h3>
                <p className="text-primary-foreground/75 text-sm leading-relaxed">{CONVERGENCE[1].body}</p>
              </div>
            </div>
            <div className="absolute bottom-[6%] left-[6%] w-[34%] max-w-xs">
              <div className="bg-background/10 backdrop-blur-sm rounded-xl p-5 lg:p-6 border border-background/20">
                <Activity className="w-6 h-6 text-asentio-red mb-3" />
                <h3 className="text-primary-foreground font-semibold mb-1">{CONVERGENCE[2].title}</h3>
                <p className="text-primary-foreground/75 text-sm leading-relaxed">{CONVERGENCE[2].body}</p>
              </div>
            </div>
            <div className="absolute bottom-[6%] right-[6%] w-[34%] max-w-xs text-right">
              <div className="bg-background/10 backdrop-blur-sm rounded-xl p-5 lg:p-6 border border-background/20 inline-block text-left">
                <Compass className="w-6 h-6 text-asentio-red mb-3" />
                <h3 className="text-primary-foreground font-semibold mb-1">{CONVERGENCE[3].title}</h3>
                <p className="text-primary-foreground/75 text-sm leading-relaxed">{CONVERGENCE[3].body}</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ---------------- Latest insights ---------------- */}
      <AnimatedSection className="py-12 md:py-20 bg-background relative">
        <TopographicPattern className="opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <LatestInsights limit={3} />
        </div>
      </AnimatedSection>

      {/* ---------------- The Human Interface Briefing ---------------- */}
      <AnimatedSection className="py-12 md:py-20 bg-muted relative">
        <TopographicPattern className="opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <NewsletterSignup source="homepage" wide />
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Index;
