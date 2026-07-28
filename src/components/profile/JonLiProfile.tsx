import { Link } from 'react-router-dom';
import TopographicPattern from '@/components/TopographicPattern';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Mic, Compass, Globe2 } from 'lucide-react';
import jonImg from '@/assets/jon.png';
import linkedinLogo from '@/assets/linkedin-logo.png';
import { cn } from '@/lib/utils';

const FOCUS_AREAS = [
  'AI glasses and smart eyewear',
  'Wearables and biosensing',
  'Multimodal and contextual AI',
  'Human-centered interface design',
  'US market entry for global brands',
  'Category creation and positioning',
];

const SPEAKING_TOPICS = [
  {
    title: 'The Human Interface to AI',
    body: 'Why the next platform fight is about how people reach intelligence — not about models.',
  },
  {
    title: 'AI Glasses: From Novelty to Habit',
    body: 'What has to be true — technically, socially and commercially — for glasses to become daily-wear.',
  },
  {
    title: 'Designing for the Body',
    body: 'Human-centered design constraints that decide whether a wearable is worn twice.',
  },
  {
    title: 'Landing in America',
    body: 'How global hardware and AI companies build a US narrative, channel and beachhead.',
  },
];

interface JonLiProfileProps {
  compact?: boolean;
}

export const JonLiProfile = ({ compact = false }: JonLiProfileProps) => {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className={cn("relative bg-muted", compact ? "pt-10 pb-8" : "pt-28 md:pt-36 pb-12 md:pb-16")}>
        <TopographicPattern className="opacity-30" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 md:gap-12 items-start">
            <img
              src={jonImg}
              alt="Jon Li, founder of Asentio"
              className="w-44 h-44 lg:w-64 lg:h-64 rounded-2xl object-cover shadow-xl ring-4 ring-background"
            />

            <div>
              <div className="w-12 h-1 bg-asentio-red mb-4" />
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-5xl font-bold text-foreground">Jon Li</h1>
                <a href="https://www.linkedin.com/in/jonli001" target="_blank" rel="noopener noreferrer" aria-label="Jon Li on LinkedIn">
                  <img src={linkedinLogo} alt="LinkedIn" className="w-7 h-7 rounded-sm" />
                </a>
              </div>
              <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed mb-6 max-w-3xl">
                Founder of Asentio. Advisor, operator and speaker on the convergence of XR, AI and
                wearables — and what it takes to turn a new interface into a real market.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {FOCUS_AREAS.map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/contact">
                  <Button className="bg-asentio-blue hover:bg-asentio-blue/90 px-6 py-5">
                    <Mic className="w-4 h-4 mr-2" /> Invite Jon to speak
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

      {/* Bio */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-5 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Background</h2>
            <p className="text-muted-foreground leading-relaxed">
              Jon has spent his career at the meeting point of consumer hardware, emerging interfaces
              and market strategy — working with global brands on how new categories are positioned,
              launched and scaled, with a particular focus on bringing products from Asia and Europe
              into the United States.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Through Asentio he advises device makers, AI companies, component suppliers and
              investors navigating the shift to wearable, ambient computing. That work is grounded in
              the Asentio HAI Directory — a continuously maintained map of the companies building
              devices, components, artificial intelligence, platforms, applications and the ecosystem
              around them.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              His view: AI's next constraint is not intelligence, it is access. The companies that
              solve how a person sees, hears, gestures to and trusts an AI system will define the
              decade — and most of them are hardware companies that have never thought of themselves
              as interface companies.
            </p>
          </div>

          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <Compass className="w-5 h-5 text-asentio-red mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Advises on</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>Positioning and category creation</li>
                <li>Product and roadmap strategy</li>
                <li>Go-to-market and channel</li>
                <li>Investor and partner narrative</li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <Globe2 className="w-5 h-5 text-asentio-red mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Works with</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>Device and eyewear makers</li>
                <li>AI and computer-vision companies</li>
                <li>Component and optics suppliers</li>
                <li>Investors and corporate strategy teams</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Speaking */}
      <section className="bg-muted py-12 md:py-16 relative">
        <TopographicPattern className="opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mb-8">
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">Speaking topics</h2>
            <p className="text-muted-foreground leading-relaxed">
              Keynotes, panels and workshops for conferences, corporate offsites and investor events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {SPEAKING_TOPICS.map((topic) => (
              <div key={topic.title} className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{topic.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{topic.body}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Book Jon</h3>
              <p className="text-muted-foreground mb-5">
                Send the event, audience and date — Jon replies personally.
              </p>
              <Link to="/contact">
                <Button className="bg-asentio-blue hover:bg-asentio-blue/90 px-6 py-5">
                  Speaking enquiry <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <NewsletterSignup source="jon-li" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
