import { Link } from 'react-router-dom';
import { TAXONOMY } from '@/lib/xrTaxonomy';
import { Glasses, Cpu, Brain, Layers, AppWindow, Network, ArrowRight } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  devices: Glasses,
  components: Cpu,
  'artificial-intelligence': Brain,
  platforms: Layers,
  applications: AppWindow,
  ecosystem: Network,
};

const DirectoryCategoryTiles = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {TAXONOMY.map((group) => {
        const Icon = ICONS[group.slug] || Layers;
        return (
          <Link
            key={group.slug}
            to={`/xr-directory/category/${group.slug}`}
            className="group relative bg-card border border-border rounded-xl p-6 hover:border-asentio-red/40 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red transition-all duration-300 group-hover:h-full" />

            <div className="w-11 h-11 rounded-lg bg-asentio-blue/10 flex items-center justify-center mb-4 group-hover:bg-asentio-red/10 transition-colors">
              <Icon className="w-5 h-5 text-asentio-blue group-hover:text-asentio-red transition-colors" />
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-1.5">{group.label}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{group.blurb}</p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {group.children.slice(0, 4).map((child) => (
                <span key={child} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {child}
                </span>
              ))}
              {group.children.length > 4 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  +{group.children.length - 4}
                </span>
              )}
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-asentio-blue group-hover:text-asentio-red transition-colors">
              Browse {group.label.toLowerCase()}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default DirectoryCategoryTiles;
