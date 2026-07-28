import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';
import TopographicPattern from '@/components/TopographicPattern';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Compass, Globe2 } from 'lucide-react';
import chesterImg from '@/assets/chester.png';
import linkedinLogo from '@/assets/linkedin-logo.png';
import { trackPageView } from '@/lib/analytics';

const FOCUS_AREAS = [
  'Corporate strategy',
  'Finance and operations',
  'Market entry and expansion',
  'Team building and scaling',
  'Partnerships and channel',
  'Commercial due diligence',
];

const ChesterMui = () => {
  useSeo({
    title: 'Chester Mui — Strategy, Finance & Market Entry Advisor | Asentio',
    description:
      'Chester Mui advises brands and technology companies on strategy, finance, market entry and scaling operations across global markets.',
    canonicalPath: '/about/chester-mui',
    type: 'profile',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/about/chester-mui');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-28 md:pt-36 pb-12 md:pb-16 bg-muted">
        <TopographicPattern className="opacity-30" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 md:gap-12 items-start">
            <img
              src={chesterImg}
              alt="Chester Mui of Asentio"
              className="w-44 h-44 lg:w-64 lg:h-64 rounded-2xl object-cover shadow-xl ring-4 ring-background"
            />

            <div>
              <div className="w-12 h-1 bg-asentio-red mb-4" />
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-5xl font-bold text-foreground">Chester Mui</h1>
                <a
                  href="https://www.linkedin.com/in/t01san/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chester Mui on LinkedIn"
                >
                  <img src={linkedinLogo} alt="LinkedIn" className="w-7 h-7 rounded-sm" />
                </a>
              </div>
              <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed mb-6 max-w-3xl">
                20+ years of experience in strategy and finance — bringing brands and products into
                new markets, building large teams and scaling businesses.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {FOCUS_AREAS.map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/contact">
                  <Button className="bg-asentio-blue hover:bg-asentio-blue/90 px-6 py-5">
                    Get in touch <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/work-with-us">
                  <Button variant="outline" className="px-6 py-5 border-2">
                    Advisory engagements
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-5 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Background</h2>
            <p className="text-muted-foreground leading-relaxed">
              Chester has spent his career building and scaling commercial organisations — leading
              strategy, finance and operations for brands entering new geographies and product
              categories.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              At Asentio he focuses on the commercial mechanics behind market entry: pricing,
              channel economics, partner structures and the operating model required to support
              growth once a product finds traction.
            </p>
          </div>

          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <Compass className="w-5 h-5 text-asentio-red mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Advises on</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>Commercial and financial strategy</li>
                <li>Market entry planning</li>
                <li>Operating model and org design</li>
                <li>Partnerships and channel economics</li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <Globe2 className="w-5 h-5 text-asentio-red mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Works with</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>Consumer and device brands</li>
                <li>AI and technology companies</li>
                <li>Investors and corporate strategy teams</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-muted py-12 md:py-16 relative">
        <TopographicPattern className="opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 md:p-8">
            <NewsletterSignup source="chester-mui" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChesterMui;
