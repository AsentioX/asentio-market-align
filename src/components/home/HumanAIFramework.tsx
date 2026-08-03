import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import TopographicPattern from '@/components/TopographicPattern';
import frameworkImage from '@/assets/hai-framework-loop-v2.png.asset.json';
import { trackCTAClick } from '@/lib/analytics';

const STEPS = [
  {
    title: 'Human Activities',
    question: 'What is the human trying to accomplish?',
    examples: ['Observe', 'Operate', 'Think', 'Collaborate', 'Learn'],
  },
  {
    title: 'Human Capabilities',
    question: 'Which human abilities are being augmented?',
    examples: ['Perceive', 'Think', 'Communicate', 'Act', 'Create'],
  },
  {
    title: 'AI Capabilities',
    question: 'What intelligence enables those capabilities?',
    examples: ['Reason', 'Perceive', 'Plan', 'Automate', 'Embody'],
  },
  {
    title: 'Human Interface',
    question: 'How do people experience the AI?',
    examples: ['AI Agent', 'Smart Glasses', 'Robots', 'Personal Devices', 'Smart Environments'],
  },
];

const WHY = [
  { title: 'Better Products', body: 'Design around people instead of technology.' },
  { title: 'Better Investments', body: 'Understand which companies enable complete Human + AI experiences.' },
  { title: 'Better Strategy', body: 'Identify whitespace, partnerships, and emerging market opportunities.' },
  { title: 'Better Decisions', body: 'Evaluate ecosystems instead of isolated products.' },
];

const HumanAIFramework = () => {
  const [lightbox, setLightbox] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = flowRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          // 4 cards + 3 arrows = 7 sequenced steps
          for (let i = 1; i <= 7; i++) {
            setTimeout(() => setRevealed(i), i * 250);
          }
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Step index in the reveal sequence: card i -> i*2 + 1, arrow after card i -> i*2 + 2
  const shown = (step: number) => revealed >= step;

  return (
    <section className="py-14 md:py-24 bg-asentio-blue relative overflow-hidden">
      <TopographicPattern variant="dark" className="opacity-100" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-asentio-red/10 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Intro: two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-14 items-start">
          <div>
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary-foreground/60 mb-3">
              The Human + AI Framework
            </p>
            <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-5 leading-tight">
              Everything Begins with the Human
            </h2>
            <div className="space-y-4 text-primary-foreground/70 leading-relaxed">
              <p>Most technology directories organize companies by products or technologies.</p>
              <p className="text-primary-foreground font-medium">The HAI Directory starts with people.</p>
              <p>
                We believe successful AI begins by understanding what people are trying to accomplish,
                which human capabilities need to be augmented, the intelligence required to help them,
                and finally the interface through which people experience AI.
              </p>
              <p>
                This human-centered framework helps executives, investors, product teams, and
                researchers better understand how the Human + AI ecosystem fits together.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                to="/hai-directory"
                onClick={() => trackCTAClick('Explore the HAI Directory — Framework', true)}
              >
                <Button size="lg" className="w-full sm:w-auto bg-asentio-red hover:bg-asentio-red/90">
                  <Search className="w-4 h-4 mr-2" />
                  Explore the HAI Directory
                </Button>
              </Link>
              <Link
                to="/work-with-us"
                className="text-sm font-medium text-primary-foreground hover:text-asentio-red transition-colors inline-flex items-center"
              >
                Learn about our methodology
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="group block w-full flex items-center justify-center rounded-2xl overflow-hidden bg-transparent transition-shadow"
            aria-label="Enlarge the Human + AI Collaboration Loop diagram"
          >
            <img
              src={frameworkImage.url}
              alt="The Human + AI Collaboration Loop: human activities, human capabilities, AI capabilities and human interface"
              className="w-auto max-h-[300px] md:max-h-[380px] object-contain"
              loading="lazy"
            />
          </button>
        </div>

        {/* Interactive companion */}
        <div ref={flowRef} className="mt-14 md:mt-20 pt-10 md:pt-14 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-stretch gap-3 md:gap-0">
            {STEPS.map((step, i) => (
              <div key={step.title} className="contents md:flex md:items-stretch md:flex-1 md:min-w-0">
                <div
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => setActive((prev) => (prev === i ? null : i))}
                  className={`flex-1 min-w-0 rounded-2xl border border-border bg-card p-5 md:p-6 cursor-default transition-all duration-500 hover:border-asentio-red/40 hover:shadow-md ${
                    shown(i * 2 + 1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                >
                  <span className="text-xs font-mono text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.question}</p>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      active === i ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {step.examples.map((ex) => (
                        <span
                          key={ex}
                          className="px-2.5 py-1 rounded-full text-xs border border-border bg-background text-muted-foreground"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {i < STEPS.length - 1 && (
                  <div
                    className={`flex items-center justify-center shrink-0 py-1 md:py-0 md:px-3 transition-all duration-500 ${
                      shown(i * 2 + 2) ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <ArrowDown className="w-5 h-5 text-primary-foreground/40 md:hidden" />
                    <ArrowRight className="w-5 h-5 text-primary-foreground/40 hidden md:block" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Why this matters */}
        <div className="mt-14 md:mt-20 pt-10 md:pt-14 border-t border-white/10">
          <h3 className="text-xl md:text-2xl font-bold text-primary-foreground mb-8">Why this framework matters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
                <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
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
