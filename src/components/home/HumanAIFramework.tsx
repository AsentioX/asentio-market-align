import { assetUrl } from "@/lib/assetUrl";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import frameworkImage from '@/assets/hai-framework-loop-v2.png.asset.json';
import sectionBg from '@/assets/hai-framework-bg-v3.png.asset.json';
import { trackCTAClick } from '@/lib/analytics';

const USE_CASE = [
  { title: '01 Human Activity', items: ['Operate', 'Maintain equipment remotely'] },
  {
    title: '02 Human Capabilities',
    items: ['Perceive (see what\u2019s wrong)', 'Act (guide the repair)', 'Supervise (ensure quality)'],
  },
  {
    title: '03 AI Capabilities',
    items: ['Perceive (vision)', 'Reason (diagnose issue)', 'Communicate (voice guidance)'],
  },
  {
    title: '04\u00a0Human Interface',
    items: ['Smart Glasses', 'Hands-free AR guidance & real-time info'],
  },
  { title: '05 Outcome', items: ['Faster repair, fewer errors, lower downtime'] },
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
    <section className="relative overflow-hidden" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Ecosystem-map background image */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${assetUrl(sectionBg.url)})` }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10 py-16 md:py-24">
        {/* Intro: two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-10 lg:gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-0.5 bg-asentio-red" />
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-asentio-red">
                The Human + AI Framework
              </p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5 leading-[1.1] tracking-tight">
              Everything Begins with the Human
            </h2>
            <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              <p>
                Most technology directories organize companies by products or technologies.{' '}
                <span className="text-foreground font-medium">
                  The HAI Directory starts with people.
                </span>
              </p>
              <p>
                Successful AI begins by understanding what people are trying to accomplish, which
                human capabilities need to be augmented, the intelligence required to help them, and
                the interface through which people experience it. That sequence — Human Activities,
                Human Capabilities, AI Capabilities, Human Interface — is how we map the market.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
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
                className="text-sm font-medium text-foreground/80 hover:text-asentio-red transition-colors inline-flex items-center"
              >
                Our methodology
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>

          {/* Framework graphic in a white card */}
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="group block w-full rounded-2xl bg-white p-5 md:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] border border-black/[0.04] transition-shadow duration-500 hover:shadow-[0_16px_60px_-12px_rgba(0,0,0,0.18)]"
            aria-label="Enlarge the Human + AI Collaboration Loop diagram"
          >
            <img
              src={assetUrl(frameworkImage.url)}
              alt="The Human + AI Collaboration Loop: human activities, human capabilities, AI capabilities and human interface"
              className="w-full max-h-[340px] md:max-h-[440px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </button>
        </div>

        {/* Example use case */}
        <div className="mt-16 md:mt-20">
          <div className="rounded-xl border border-black/[0.06] bg-white/60 p-5 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
              <div className="lg:w-44 shrink-0 lg:pr-5 lg:border-r lg:border-black/[0.06]">
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-asentio-red">
                  Example use case
                </p>
                <p className="mt-1.5 text-sm font-semibold text-foreground leading-snug">
                  Remote Equipment Maintenance
                </p>
              </div>
              {USE_CASE.map((block) => {
                const m = block.title.match(/^(\d+)([\s\u00a0]*)([\s\S]*)$/);
                const num = m ? m[1] : '';
                const rest = m ? m[3] : block.title;
                return (
                  <div key={block.title} className="contents lg:flex lg:items-stretch lg:flex-1 lg:min-w-0">
                    <div className="flex-1 min-w-0 rounded-lg border border-black/[0.06] bg-white p-3">
                      <p className="text-xs font-semibold text-foreground">
                        <span className="text-asentio-red">{num}</span>{rest && <> {rest}</>}
                      </p>
                      <ul className="mt-1.5 space-y-0.5">
                        {block.items.map((it) => (
                          <li key={it} className="text-[11px] text-muted-foreground leading-snug">
                            {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Why this matters */}
        <div className="mt-16 md:mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-12 items-start">
            <h3 className="text-xl font-bold text-foreground lg:max-w-[180px] leading-snug">
              Why this framework matters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
              {WHY.map((item) => (
                <div key={item.title} className="border-l-2 border-asentio-red/60 pl-4">
                  <h4 className="font-semibold text-sm text-foreground mb-1.5">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl p-4 md:p-6 bg-white">
          <DialogTitle className="sr-only">The Human + AI Collaboration Loop</DialogTitle>
          <img
            src={assetUrl(frameworkImage.url)}
            alt="The Human + AI Collaboration Loop, enlarged"
            className="w-full h-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HumanAIFramework;
