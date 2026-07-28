import { Link } from 'react-router-dom';
import { AI_XR_FILTERS } from '@/lib/xrTaxonomy';
import { Sparkles, ArrowRight } from 'lucide-react';

/**
 * The AI × XR discovery strip — the intersection Asentio is built around.
 * Each chip deep-links into the directory filtered by that AI capability.
 */
const AiXrStrip = () => {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-asentio-red font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> AI × XR
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Where intelligence meets the interface
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            The interesting companies are no longer "XR companies" or "AI companies." They sit in the
            overlap — devices that see what you see, models that understand context, and interfaces that
            disappear. Start from a capability.
          </p>
        </div>
        <Link
          to="/hai-directory"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-asentio-blue hover:text-asentio-red transition-colors whitespace-nowrap"
        >
          Open the directory <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {AI_XR_FILTERS.map((chip) => (
          <Link
            key={chip}
            to={`/hai-directory?ai=${encodeURIComponent(chip)}`}
            className="px-3.5 py-1.5 rounded-full text-sm border border-border bg-background text-muted-foreground hover:border-asentio-red/50 hover:text-asentio-red transition-colors"
          >
            {chip}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AiXrStrip;
