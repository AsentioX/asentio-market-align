import { MARKET_STACK } from '@/lib/xrTaxonomy';
import { Link } from 'react-router-dom';

/**
 * The Asentio market map: a layered view of the stack between a human
 * and an AI system, rendered as a simple, legible band diagram.
 */
const MarketMap = () => {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-6 md:p-8 border-b border-border">
        <div className="w-12 h-1 bg-asentio-red mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">The Human Interface Stack</h2>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Every layer between a person and a model is being rebuilt at once. Asentio maps the
          companies working on each one and where the leverage sits.
        </p>
      </div>

      <div className="divide-y divide-border">
        {MARKET_STACK.map((row, idx) => (
          <div key={row.layer} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 md:gap-6 p-5 md:p-6 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground w-6">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="font-semibold text-foreground">{row.layer}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {row.items.map((item) => (
                <Link
                  key={item}
                  to={`/hai-directory?category=${encodeURIComponent(item)}`}
                  className="px-3 py-1 rounded-full text-sm border border-border bg-background text-muted-foreground hover:border-asentio-red/50 hover:text-asentio-red transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketMap;
