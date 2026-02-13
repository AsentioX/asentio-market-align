import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Rocket, MessageSquare, ArrowRight, CheckCircle, Building2, Users, Code } from "lucide-react";
import TopographicPattern from "@/components/TopographicPattern";
import ServiceCard from "@/components/services/ServiceCard";
import ChannelCard from "@/components/services/ChannelCard";
import EngagementCard from "@/components/services/EngagementCard";
import CaseStudyCarousel from "@/components/services/CaseStudyCarousel";

const Services = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      title: "Product & Market Fit (U.S.)",
      description:
        "We help you align your product with U.S. customer expectations, buying behavior, and competitive realities.",
      icon: Target,
      includes: [
        "U.S.-based product and UX evaluation",
        "Industrial design and packaging feedback",
        "Competitive positioning and differentiation",
        "Messaging clarity for American buyers",
      ],
      outcome: "A product and narrative that U.S. customers immediately understand and trust.",
    },
    {
      title: "Go-To-Market & Business Development",
      description:
        "We design and execute go-to-market strategies that move beyond planning into real conversations, pilots, and deals.",
      icon: Rocket,
      includes: [
        "Retail, enterprise, and channel strategy",
        "Sales narratives and pitch materials",
        "Partner sourcing and introductions",
        "Deal support from first meeting to close",
      ],
      outcome: "A repeatable path to revenue in the U.S. market.",
    },
    {
      title: "Brand, Narrative & Launch",
      description: "We shape how your product is perceived — by buyers, partners, and the market.",
      icon: MessageSquare,
      includes: [
        "Positioning and messaging for U.S. audiences",
        "Launch narratives and press alignment",
        "Trade show and event strategy",
        "Sales enablement and storytelling assets",
      ],
      outcome: "Clear differentiation and credibility at critical market moments.",
    },
  ];

  const channels = [
    {
      title: "Retail & Distribution",
      description:
        "Specialty retail, national partners, and pilot-to-scale programs that drive real sell-through — not just shelf presence.",
      bestFor:
        "Consumer hardware, wearables, audio products, and smart devices that need clear U.S. retail positioning and velocity.",
      whyItMatters: "Retail success validates product-market fit and accelerates brand trust in the U.S.",
    },
    {
      title: "Platform & Strategic Partnerships",
      description:
        "Alignment with the platforms, technology leaders, and ecosystem players that shape product direction, integration, and scale. This includes partnerships with major platforms, enabling technologies (audio, AI, silicon), and strategic collaborators.",
      bestFor: "AI-enabled devices, smart eyewear, spatial computing products, and platform-dependent hardware.",
      whyItMatters:
        "The right partnerships unlock credibility, capability expansion, and long-term leverage far beyond traditional sales.",
    },
    {
      title: "Developer & Ecosystem",
      description:
        "Developer adoption, ecosystem partnerships, and early traction that turn products into platforms. We help define integration stories, activate early partners, and build momentum with developers and third-party ecosystems.",
      bestFor: "Platforms, APIs, AI-powered products, and hardware that relies on software or third-party innovation.",
      whyItMatters:
        "Ecosystems compound growth — and are difficult to build without the right introductions and narrative.",
    },
  ];

  const engagements = [
    {
      title: "Market Entry Sprint",
      duration: "2–4 Weeks",
      description: "A focused engagement to assess readiness for the U.S. market.",
      includes: [
        "Product and positioning review",
        "Competitive landscape analysis",
        "Go-to-market gap assessment",
        "Clear recommendations and next steps",
      ],
      pricingAnchor: "Designed for teams allocating low five figures to validate direction before scaling.",
    },
    {
      title: "Go-To-Market & Business Development Retainer",
      description: "An ongoing partnership where Asentio acts as an extension of your team.",
      includes: [
        "Channel strategy and execution",
        "Partner and customer outreach",
        "Enterprise and retail introductions",
        "Weekly execution cadence and pipeline review",
      ],
      pricingAnchor: "Structured for companies investing mid to high five figures per month in U.S. growth.",
    },
    {
      title: "Retainer + Revenue Share",
      description: "A performance-aligned model for select hardware and device companies.",
      includes: [
        "Ongoing business development support",
        "Channel and enterprise deal execution",
        "Shared upside tied to revenue generated",
      ],
      pricingAnchor: "A monthly retainer combined with a single-digit percentage revenue share on attributable sales.",
      isSelective: true,
    },
  ];

  const caseStudies = [
    {
      company: "BleeqUp",
      description: "U.S. go-to-market strategy, product feedback, and retail readiness for smart eyewear.",
      image: "/images/bleeqUp.png",
      challenge: "A European smart eyewear startup needed to validate product-market fit and build retail-ready positioning for U.S. consumers with no existing presence.",
      whatWeDid: "Conducted U.S.-focused product and UX evaluation, developed retail-ready messaging, and created a go-to-market roadmap targeting specialty and national retail partners.",
    },
    {
      company: "Xthings",
      description: "Brand narrative, CES positioning, and enterprise messaging for AIoT and smart home products.",
      image: "/images/xthings.png",
      imageZoom: 1.4,
      imagePosition: "center 70%",
      challenge: "An AIoT company preparing for CES needed a compelling brand narrative and enterprise messaging that would resonate with U.S. buyers and media.",
      whatWeDid: "Shaped the brand story, crafted CES-specific positioning, and developed enterprise sales narratives that translated technical capabilities into clear business value.",
    },
    {
      company: "Optix",
      description: "Market positioning and competitive differentiation for advanced optical and waveguide technologies.",
      image: "/images/optix.jpg",
      challenge: "A waveguide technology company needed to differentiate in a crowded AR optics market and communicate technical advantages to non-technical decision makers.",
      whatWeDid: "Developed competitive positioning frameworks, created clear differentiation narratives, and built sales enablement materials bridging technical depth with business impact.",
    },
  ];

  const idealClients = [
    "Are entering or actively scaling in the U.S. market",
    "Have a real, shipping product (not just an idea)",
    "Are ready to invest in execution, not just strategy",
  ];

  const scrollToEngage = () => {
    const element = document.getElementById("how-we-engage");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-asentio-blue text-primary-foreground py-10 md:py-14 relative overflow-hidden">
        <TopographicPattern variant="dark" className="opacity-100" />
        <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-destructive/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 md:w-48 h-24 md:h-48 bg-destructive/5 rounded-full blur-2xl" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              We Help Global Tech Companies <span className="text-primary-foreground/70">Win in the U.S.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed mb-3">
              Asentio is a go-to-market consultancy guiding global products and services to successfully enter and scale
              in the U.S. market.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <AnimatedSection className="py-10 md:py-14 bg-background relative">
        <TopographicPattern className="opacity-30" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <div className="w-12 h-1 bg-asentio-red mx-auto mb-6" />
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">What We Do</h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
                End-to-end support for global companies entering and scaling in the U.S. market.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Channels We Build Section */}
      <AnimatedSection className="py-10 md:py-14 bg-muted relative">
        <TopographicPattern className="opacity-20" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <div className="w-12 h-1 bg-asentio-red mx-auto mb-6" />
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">Channels We Build</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                We don't just open channels — we connect you to the ecosystems that control distribution, adoption, and
                scale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {channels.map((channel, index) => (
                <ChannelCard key={index} {...channel} />
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>


      {/* How We Engage Section */}
      <AnimatedSection id="how-we-engage" className="py-10 md:py-14 bg-muted relative">
        <TopographicPattern className="opacity-20" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <div className="w-12 h-1 bg-asentio-red mx-auto mb-6" />
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">How We Engage</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Flexible engagement models designed to meet you where you are.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {engagements.map((engagement, index) => (
                <EngagementCard key={index} {...engagement} />
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Case Studies Section */}
      <AnimatedSection className="py-10 md:py-14 bg-muted relative">
        <TopographicPattern className="opacity-20" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <div className="w-12 h-1 bg-asentio-red mx-auto mb-6" />
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">Case Studies & Experience</h2>
            </div>

            <CaseStudyCarousel caseStudies={caseStudies} />
          </div>
        </div>
      </AnimatedSection>

      {/* Final CTA Section */}
      <AnimatedSection className="py-10 md:py-14 bg-asentio-blue text-primary-foreground relative overflow-hidden">
        <TopographicPattern variant="dark" className="opacity-100" />
        <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-destructive/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 md:w-48 h-24 md:h-48 bg-destructive/5 rounded-full blur-2xl" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-12 h-1 bg-asentio-red mx-auto mb-4 md:mb-6" />
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6">Let's Build Your U.S. Growth Engine</h2>
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-background text-asentio-blue hover:bg-background/90 px-10 py-6 text-base font-medium shadow-lg transition-all hover:shadow-xl"
              >
                Start a Conversation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Services;
