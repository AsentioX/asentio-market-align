import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, LayoutDashboard, Briefcase, Brain, Gamepad2, HeartPulse, FlaskConical, Music, Scale, Wallet, Car, Waves, Eye, MapPin, HardHat, Sparkles, Leaf, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LabApp {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'coming-soon' | 'beta' | 'live';
  tags: string[];
  link?: string;
}

const labApps: LabApp[] = [
  {
    name: 'W.O.Buddy',
    description: 'Track your workouts, earn scores, compete with friends, and visualize your fitness progress.',
    icon: <Dumbbell className="w-8 h-8" />,
    status: 'beta',
    tags: ['Fitness', 'Health', 'VR'],
    link: '/labs/wo-buddy',
  },
  {
    name: 'XR Product Manager',
    description: 'Plan, prioritize, and ship spatial computing features with a purpose-built PM toolkit.',
    icon: <LayoutDashboard className="w-8 h-8" />,
    status: 'coming-soon',
    tags: ['Productivity', 'Management'],
  },
  {
    name: 'Portfolio Studio',
    description: 'Curate and present your XR product portfolio with interactive 3D showcases and pitch decks.',
    icon: <Briefcase className="w-8 h-8" />,
    status: 'coming-soon',
    tags: ['Portfolio', 'Showcase'],
  },
  {
    name: 'Spatial AI Sandbox',
    description: 'Experiment with AI models in spatial environments. Prompt, visualize, and iterate in 3D.',
    icon: <Brain className="w-8 h-8" />,
    status: 'coming-soon',
    tags: ['AI', 'Experimental'],
  },
  {
    name: 'XR Game Finder',
    description: 'Discover the best XR games and experiences matched to your headset and play style.',
    icon: <Gamepad2 className="w-8 h-8" />,
    status: 'coming-soon',
    tags: ['Gaming', 'Discovery'],
  },
  {
    name: 'Wellness Dashboard',
    description: 'Monitor eye strain, posture, and session duration across your XR usage for healthier habits.',
    icon: <HeartPulse className="w-8 h-8" />,
    status: 'coming-soon',
    tags: ['Health', 'Wellness'],
  },
  {
    name: 'My DJ',
    description: 'Weave spatial music into your life.',
    icon: <Music className="w-8 h-8" />,
    status: 'beta',
    tags: ['Music', 'Spatial Audio'],
    link: '/labs/my-dj',
  },
  {
    name: 'Field Of Views',
    description: 'AI-powered transcript processing, policy library, and consensus voting for collaborative task forces.',
    icon: <Scale className="w-8 h-8" />,
    status: 'beta',
    tags: ['Governance', 'Collaboration', 'AI'],
    link: '/labs/fieldofviews',
  },
  {
    name: 'PerkPath',
    description: 'Your central hub for membership benefits. Discover, browse, and redeem perks from all your memberships in one place.',
    icon: <Wallet className="w-8 h-8" />,
    status: 'beta',
    tags: ['Fintech', 'Memberships', 'Savings'],
    link: '/labs/perkpath',
  },
  {
    name: 'CP Connect',
    description: 'Unified project hub for home renovation. Connects contractors and homeowners through smart quotes, AI visualization, and shared Pro-Links.',
    icon: <Briefcase className="w-8 h-8" />,
    status: 'beta',
    tags: ['Construction', 'AI', 'Collaboration'],
    link: '/labs/cpconnect',
  },
  {
    name: 'TA Studio',
    description: 'AI-driven Porsche customization. Define your identity, generate a TECHART build, and refine your bill of materials in under 60 seconds.',
    icon: <Car className="w-8 h-8" />,
    status: 'beta',
    tags: ['Automotive', 'AI', 'Luxury'],
    link: '/labs/tastudio',
  },
  {
    name: 'RowWindow',
    description: 'Launch-window calculator for rowers at BIAC. Tide forecast, vessel-aware wind thresholds, and chop alerts for safer rows.',
    icon: <Waves className="w-8 h-8" />,
    status: 'beta',
    tags: ['Rowing', 'Tides', 'Safety'],
    link: '/labs/rowwindow',
  },
  {
    name: 'AOTU.ai',
    description: 'AI operators for real-world automation. BrainFrame edge platform, modular VisionCapsules, and pre-packaged solutions.',
    icon: <Eye className="w-8 h-8" />,
    status: 'beta',
    tags: ['Edge AI', 'Computer Vision', 'Enterprise'],
    link: '/labs/aotu',
  },
  {
    name: 'Vibin',
    description: 'Social travel curation. Create visual cards of places, build deck itineraries, and remix friends\' trips on the fly.',
    icon: <MapPin className="w-8 h-8" />,
    status: 'beta',
    tags: ['Travel', 'Social', 'Mobile'],
    link: '/labs/vibin',
  },
  {
    name: 'Contractor Finder',
    description: 'B2B contractor discovery and segmentation. Search licensed pros by trade, location, size, and digital maturity. AI-powered natural-language segments.',
    icon: <HardHat className="w-8 h-8" />,
    status: 'beta',
    tags: ['Construction', 'Lead Gen', 'AI'],
    link: '/labs/contractor-finder',
  },
  {
    name: 'X1 Smart',
    description: 'AI-first intelligence layer for physical spaces. Replaces device dashboards with a system that understands people, learns patterns, and acts on your behalf.',
    icon: <Sparkles className="w-8 h-8" />,
    status: 'beta',
    tags: ['Physical AI', 'Spaces', 'Intelligent IoT'],
    link: '/labs/x1-smart',
  },
  {
    name: 'Verdant',
    description: 'The self-watering plant system. Plug-and-play device that senses your plant\'s needs and waters automatically — no timers, no guesswork.',
    icon: <Leaf className="w-8 h-8" />,
    status: 'beta',
    tags: ['Hardware', 'Smart Home', 'Plants'],
    link: '/labs/verdant',
  },
  {
    name: 'Care Kits',
    description: 'Personalized safety kits for aging parents living independently. Take a 2-minute quiz, get a tailored plan — privacy-first, no cameras.',
    icon: <ShieldCheck className="w-8 h-8" />,
    status: 'beta',
    tags: ['Eldercare', 'Health', 'Family'],
    link: '/labs/carekits',
  },
];

const statusColors: Record<string, string> = {
  'coming-soon': 'bg-muted text-muted-foreground',
  beta: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  live: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
};

const statusLabels: Record<string, string> = {
  'coming-soon': 'Coming Soon',
  beta: 'Beta',
  live: 'Live',
};

const Labs = () => {
  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4 text-asentio-blue">
            <FlaskConical className="w-7 h-7" />
            <span className="text-sm font-semibold uppercase tracking-widest">Asentio Labs</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Experiments &amp; Tools
          </h1>
          <p className="text-lg text-muted-foreground">
            Early-stage apps and utilities we're building for the XR ecosystem. Try them out, break them, and tell us what you think.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {labApps.map((app) => {
            const Wrapper = app.link ? Link : 'div';
            const wrapperProps = app.link ? { to: app.link } : {};
            return (
              <Wrapper
                key={app.name}
                {...(wrapperProps as any)}
                className={`group relative overflow-hidden border border-border/60 hover:border-asentio-blue/40 transition-all duration-300 hover:shadow-lg rounded-lg bg-card ${
                  app.link ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-muted text-asentio-blue">
                      {app.icon}
                    </div>
                    <Badge variant="secondary" className={`text-xs ${statusColors[app.status]}`}>
                      {statusLabels[app.status]}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{app.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{app.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {app.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </CardContent>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Labs;
