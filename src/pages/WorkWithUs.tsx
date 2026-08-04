import { assetUrl } from "@/lib/assetUrl";
import { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';
import workWithUsHeaderBg from '@/assets/work-with-us-header-bg.png.asset.json';
import methodologyDiagram from '@/assets/methodology-human-ai.png.asset.json';
import TopographicPattern from '@/components/TopographicPattern';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Button } from '@/components/ui/button';
import { ArrowRight, Compass, Mic, FlaskConical, CheckCircle2 } from 'lucide-react';
import { trackPageView } from '@/lib/analytics';


interface Engagement {
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  headline: string;
  intro: string;
  bestFor: string[];
  includes: string[];
  outcome: string;
}

export const ENGAGEMENTS: Engagement[] = [
  {
    slug: 'advisory',
    icon: Compass,
    label: 'Strategic Advisory',
    headline: 'Positioning, product strategy and US market fit',
    intro:
      'Ongoing advisory for device makers, AI companies and component suppliers deciding what to build, who it is for, and how it fits the US market from proposition and pricing through channel, partnerships and launch.',
    bestFor: [
      'Hardware teams entering AI glasses or wearables',
      'AI companies looking for a physical interface',
      'Component suppliers moving up the value chain',
      'Asian and European hardware makers targeting US consumers',
      'Teams preparing a first US launch or retail partnership',
    ],
    includes: [
      'Positioning and narrative development',
      'Product and roadmap pressure-testing',
      'Competitive and adjacency mapping from the HAI Directory',
      'US market and buyer analysis',
      'Proposition and pricing localization',
      'Channel, retail and ecosystem partner strategy',
      'Launch planning and introductions',
      'Recurring working sessions with the leadership team',
    ],
    outcome: 'A concrete US market product and distribution plan with the relationships to execute it.',
  },
  {
    slug: 'research',
    icon: FlaskConical,
    label: 'Research & Market Maps',
    headline: 'Commissioned research on the XR, AI and wearables stack',
    intro:
      'Custom landscape scans, category maps and diligence support built from the Asentio directory dataset and primary conversations across the ecosystem.',
    bestFor: [
      'Investors underwriting a category thesis',
      'Corporate strategy teams scanning adjacencies',
      'Product teams sizing a new interface bet',
    ],
    includes: [
      'Category landscape and company map',
      'Technology and supply-chain analysis',
      'Interviews with operators and buyers',
      'Written report plus a working session',
    ],
    outcome: 'A clear-eyed picture of a category and where the leverage sits.',
  },
  {
    slug: 'speaking',
    icon: Mic,
    label: 'Speaking & Workshops',
    headline: 'Talks and workshops on the human interface to AI',
    intro:
      'Keynotes, panels and internal workshops for conferences, corporate offsites and investor events — grounded in the live state of the ecosystem, not generic futurism.',
    bestFor: [
      'Conference and summit programmers',
      'Corporate innovation and strategy offsites',
      'Investor LP and portfolio events',
    ],
    includes: [
      'Keynote or fireside on XR × AI convergence',
      'Category deep-dives (AI glasses, wearables, spatial AI)',
      'Hands-on strategy workshops for product teams',
      'Custom market map presentations',
    ],
    outcome: 'A room that leaves with a shared, current map of the industry.',
  },
];

const WorkWithUs = () => {
  const { slug } = useParams<{ slug?: string }>();
  const engagement = slug ? ENGAGEMENTS.find((e) => e.slug === slug) : undefined;

  const title = engagement
    ? `${engagement.label} | Work With Asentio`
    : 'Work With Us — Strategic Advisory, Research & Speaking | Asentio';
  const description = engagement
    ? engagement.intro
    : 'Asentio partners with device makers, AI companies, component suppliers and investors on strategy, US market entry, commissioned research and speaking.';

  useSeo({
    title,
    description,
    canonicalPath: engagement ? `/work-with-us/${engagement.slug}` : '/work-with-us',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(engagement ? `/work-with-us/${engagement.slug}` : '/work-with-us');
  }, [engagement]);

  if (slug && !engagement) return <Navigate to="/work-with-us" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section
        className="relative pt-28 md:pt-36 pb-10 md:pb-14 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${assetUrl(workWithUsHeaderBg.url)})` }}
      >
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <p className="text-xs uppercase tracking-wide text-asentio-red font-semibold mb-3">
              {engagement ? engagement.label : 'Work With Us'}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {engagement ? engagement.headline : 'Strategy for companies building the interface to AI'}
            </h1>
            <p className="text-base md:text-lg text-white/80 leading-relaxed">
              {engagement
                ? engagement.intro
                : 'Asentio works with device makers, AI companies, suppliers and investors by combining live market intelligence with hands-on product and go-to-market strategy.'}
            </p>
          </div>
        </div>
      </section>


      {engagement ? (
        /* -------- Single engagement -------- */
        <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Best for</h2>
                <ul className="space-y-3">
                  {engagement.bestFor.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-asentio-red flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">What's included</h2>
                <ul className="space-y-3">
                  {engagement.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-asentio-blue mt-2.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border-l-4 border-asentio-red bg-muted p-6">
                <p className="text-xs uppercase tracking-wide text-asentio-red font-semibold mb-1">Outcome</p>
                <p className="text-foreground font-medium">{engagement.outcome}</p>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold text-foreground mb-2">Start a conversation</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Tell us what you're building and where you're stuck.
                </p>
                <Link to="/contact">
                  <Button className="w-full bg-asentio-blue hover:bg-asentio-blue/90">
                    Get in touch <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold text-foreground mb-3">Other engagements</h2>
                <ul className="space-y-2">
                  {ENGAGEMENTS.filter((e) => e.slug !== engagement.slug).map((e) => (
                    <li key={e.slug}>
                      <Link
                        to={`/work-with-us/${e.slug}`}
                        className="text-sm text-asentio-blue hover:text-asentio-red transition-colors"
                      >
                        {e.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      ) : (
        /* -------- Engagement overview -------- */
        <>
          <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ENGAGEMENTS.map((e) => (
                <Link
                  key={e.slug}
                  to={`/work-with-us/${e.slug}`}
                  className="group relative bg-card border border-border rounded-xl p-6 md:p-8 hover:border-asentio-red/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red transition-all duration-300 group-hover:h-full" />
                  <div className="w-11 h-11 rounded-lg bg-asentio-blue/10 flex items-center justify-center mb-4 group-hover:bg-asentio-red/10 transition-colors">
                    <e.icon className="w-5 h-5 text-asentio-blue group-hover:text-asentio-red transition-colors" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">{e.label}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{e.intro}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-asentio-blue group-hover:text-asentio-red transition-colors">
                    Learn more <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Methodology */}
          <section className="bg-muted/40 py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6">
              <div className="max-w-3xl mb-8">
                <div className="w-12 h-1 bg-asentio-red mb-4" />
                <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">Our methodology</h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Every engagement starts with human insight and only then brings technology back in — so the
                  strategy is grounded in real needs, not in what the technology happens to allow.
                </p>
              </div>
              <img
                src={assetUrl(methodologyDiagram.url)}
                alt="Asentio methodology: human, behavior, need, opportunity, technology, strategy"
                loading="lazy"
                className="w-full rounded-2xl border border-border shadow-lg"
              />
            </div>
          </section>


          <section className="bg-asentio-blue py-12 md:py-16 relative overflow-hidden">
            <TopographicPattern variant="dark" className="opacity-100" />
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="max-w-2xl mx-auto">
                <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-background/20">
                  <NewsletterSignup source="work-with-us" variant="dark" />
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default WorkWithUs;
