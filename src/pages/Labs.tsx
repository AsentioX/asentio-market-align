import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, LayoutDashboard, Briefcase, Brain, Gamepad2, HeartPulse, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LabApp {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'coming-soon' | 'beta' | 'live';
  tags: string[];
}

const labApps: LabApp[] = [
  {
    name: 'W.O.Buddy',
    description: 'Track your XR fitness sessions, calories burned, and workout streaks across VR fitness apps.',
    icon: <Dumbbell className="w-8 h-8" />,
    status: 'coming-soon',
    tags: ['Fitness', 'Health', 'VR'],
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
          {labApps.map((app) => (
            <Card
              key={app.name}
              className="group relative overflow-hidden border border-border/60 hover:border-asentio-blue/40 transition-all duration-300 hover:shadow-lg cursor-default"
            >
              <CardContent className="p-6 flex flex-col h-full">
                {/* Icon + Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-muted text-asentio-blue">
                    {app.icon}
                  </div>
                  <Badge variant="secondary" className={`text-xs ${statusColors[app.status]}`}>
                    {statusLabels[app.status]}
                  </Badge>
                </div>

                {/* Info */}
                <h3 className="text-lg font-semibold text-foreground mb-2">{app.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{app.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {app.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Labs;
