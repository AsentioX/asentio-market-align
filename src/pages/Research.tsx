import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';
import TopographicPattern from '@/components/TopographicPattern';
import LatestInsights from '@/components/home/LatestInsights';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Button } from '@/components/ui/button';
import { ArrowRight, Database, Map, LineChart } from 'lucide-react';
import { trackPageView } from '@/lib/analytics';

const METHODS = [
  {
    icon: Database,
    title: 'Directory-driven',
    body: 'Every conclusion starts from the tracked company set — categories, capabilities, interfaces and funding, kept current in the HAI Directory.',
  },
  {
    icon: Map,
    title: 'Stack-mapped',
    body: 'Companies are placed by where they sit between a person and a model, so adjacent-category competition becomes visible.',
  },
  {
    icon: LineChart,
    title: 'Strategy-oriented',
    body: 'Research is written for decisions: what to build, where to position, which partners matter and when a category tips.',
  },
];

const Research = () => {
  useSeo({
    title: 'Research — XR & AI Market Intelligence | Asentio',
    description:
      'Asentio research: the human interface stack, market maps, landscape scans and structured intelligence on XR, AI and wearables.',
    canonicalPath: '/research',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/research');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-28 md:pt-36 pb-10 md:pb-14 bg-muted">
        <TopographicPattern className="opacity-30" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <p className="text-xs uppercase tracking-wide text-asentio-red font-semibold mb-3">Research</p>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Market intelligence for the interface era
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Asentio research is built on the same dataset that powers the HAI Directory — structured,
              current and organized around where value moves as AI becomes wearable.
            </p>
          </div>
        </div>
      </section>

      {/* Method */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {METHODS.map((m) => (
            <div key={m.title} className="bg-card border border-border rounded-xl p-6">
              <m.icon className="w-6 h-6 text-asentio-red mb-4" />
              <h2 className="font-semibold text-foreground mb-2">{m.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Market map */}
      <section id="market-map" className="container mx-auto px-4 md:px-6 pb-12 md:pb-16 scroll-mt-24">
        <MarketMap />
      </section>

      {/* Research pieces */}
      <section className="bg-muted py-12 md:py-16 relative">
        <TopographicPattern className="opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <LatestInsights
            kind="research"
            limit={6}
            heading="Research library"
            subheading="Landscape scans, category maps and thesis work."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Need research on a specific category?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Asentio produces commissioned landscape scans, competitive maps and market-entry
              research for operators and investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/work-with-us/research">
                <Button className="bg-asentio-blue hover:bg-asentio-blue/90 px-6 py-5">
                  Commission research <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/hai-directory">
                <Button variant="outline" className="px-6 py-5 border-2">Browse the directory</Button>
              </Link>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <NewsletterSignup source="research" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Research;
