import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import TopographicPattern from '@/components/TopographicPattern';
import frameworkImage from '@/assets/hai-framework-loop-v2.png.asset.json';
import { trackCTAClick } from '@/lib/analytics';

const USE_CASE = [
  { title: 'Human Activity', items: ['Operate', 'Maintain equipment remotely'] },
  {
    title: 'Human Capabilities',
    items: ['Perceive (see what\u2019s wrong)', 'Act (guide the repair)', 'Supervise (ensure quality)'],
  },
  {
    title: 'AI Capabilities',
    items: ['Perceive (vision)', 'Reason (diagnose issue)', 'Communicate (voice guidance)'],
  },
  {
    title: 'Human Interface',
    items: ['Smart Glasses', 'Hands-free AR guidance & real-time info'],
  },
  { title: 'Outcome', items: ['Faster repair, fewer errors, lower downtime'] },
];

const WHY = [
  { title: 'Better Products', body: 'Design around people instead of technology.' },
  { title: 'Better Investments', body: 'Understand which companies enable complete Human + AI experiences.' },
  { title: 'Better Strategy', body: 'Identify whitespace, partnerships, and emerging market opportunities.' },
  { title: 'Better Decisions', body: 'Evaluate ecosystems instead of isolated products.' },
];

const HumanAIFramework = () => {
  const [lightbox, setLightbox] = useState(false);



  return (
    <section className="py-12 md:py-16 bg-asentio-blue relative overflow-hidden">
      <TopographicPattern variant="dark" className="opacity-100" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-asentio-red/10 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Intro: two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-0.5 bg-asentio-red" />
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary-foreground/60">
                The Human + AI Framework
              </p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4 leading-tight">
              Everything Begins with the Human
            </h2>
            <div className="space-y-3 text-sm md:text-base text-primary-foreground/70 leading-relaxed">
              <p>
                Most technology directories organize companies by products or technologies.{' '}
                <span className="text-primary-foreground font-medium">
                  The HAI Directory starts with people.
                </span>
              </p>
              <p>
                We believe successful AI begins by understanding what people are trying to accomplish,
                which human capabilities need to be augmented, the intelligence required to help them,
                and the interface through which people experience AI.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                to="/hai-directory"
                onClick={() => trackCTAClick('Explore the HAI Directory — Framework', true)}
              >
                <Button className="bg-asentio-red hover:bg-asentio-red/90">
                  <Search className="w-4 h-4 mr-2" />
                  Explore the HAI Directory
                </Button>
              </Link>
              <Link
                to="/work-with-us"
                className="text-sm font-medium text-primary-foreground/80 hover:text-asentio-red transition-colors inline-flex items-center"
              >
                Our methodology
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="group block w-full flex items-center justify-center bg-transparent"
            aria-label="Enlarge the Human + AI Collaboration Loop diagram"
          >
            <img
              src={frameworkImage.url}
              alt="The Human + AI Collaboration Loop: human activities, human capabilities, AI capabilities and human interface"
              className="w-auto max-h-[260px] md:max-h-[340px] object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </button>
        </div>

        {/* Interactive companion */}
        <div ref={flowRef} className="mt-10 md:mt-12 pt-8 border-t border-white/10">
          {/* Example use case */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 lg:gap-0">
              <div className="lg:w-44 shrink-0 lg:pr-5">
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-asentio-red">
                  Example use case
                </p>
                <p className="mt-1 text-sm font-semibold text-primary-foreground leading-snug">
                  Remote Equipment Maintenance
                </p>
              </div>
              {USE_CASE.map((block, i) => (
                <div key={block.title} className="contents lg:flex lg:items-stretch lg:flex-1 lg:min-w-0">
                  <div className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs font-semibold text-primary-foreground">{block.title}</p>
                    <ul className="mt-1.5 space-y-0.5">
                      {block.items.map((it) => (
                        <li key={it} className="text-[11px] text-primary-foreground/60 leading-snug">
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {i < USE_CASE.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center shrink-0 px-2">
                      <ArrowRight className="w-3.5 h-3.5 text-primary-foreground/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Why this matters */}
        <div className="mt-10 md:mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-10 items-start">
            <h3 className="text-lg font-bold text-primary-foreground lg:max-w-[160px] leading-snug">
              Why this framework matters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
              {WHY.map((item) => (
                <div key={item.title} className="border-l-2 border-asentio-red/60 pl-3">
                  <h4 className="font-semibold text-sm text-primary-foreground mb-1">{item.title}</h4>
                  <p className="text-xs text-primary-foreground/60 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl p-2 md:p-4">
          <DialogTitle className="sr-only">The Human + AI Collaboration Loop</DialogTitle>
          <img
            src={frameworkImage.url}
            alt="The Human + AI Collaboration Loop, enlarged"
            className="w-full h-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HumanAIFramework;
