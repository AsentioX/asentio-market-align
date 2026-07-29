import { Link } from 'react-router-dom';
import { useArticles } from '@/hooks/useAsentioContent';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LatestInsightsProps {
  limit?: number;
  kind?: 'insight' | 'research';
  heading?: string;
  subheading?: string;
}

const LatestInsights = ({
  limit = 3,
  kind = 'insight',
  heading = 'Latest Insights',
  subheading = 'Analysis on the convergence of AI in every day use.',
}: LatestInsightsProps) => {
  const { data: articles, isLoading } = useArticles(kind, limit);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-asentio-blue" />
      </div>
    );
  }

  if (!articles || articles.length === 0) return null;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
        <div>
          <div className="w-12 h-1 bg-asentio-red mb-4" />
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">{heading}</h2>
          <p className="text-muted-foreground max-w-2xl">{subheading}</p>
        </div>
        <Link
          to={kind === 'research' ? '/research' : '/insights'}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-asentio-blue hover:text-asentio-red transition-colors whitespace-nowrap"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/${kind === 'research' ? 'research' : 'insights'}/${article.slug}`}
            className="group relative bg-card border border-border rounded-xl p-6 hover:border-asentio-red/40 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red transition-all duration-300 group-hover:h-full" />

            <div className="flex flex-wrap gap-1.5 mb-3">
              {(article.categories || []).slice(0, 2).map((c) => (
                <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-asentio-red transition-colors">
              {article.title}
            </h3>
            {article.summary && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">{article.summary}</p>
            )}

            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-asentio-blue group-hover:text-asentio-red transition-colors">
              Read <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LatestInsights;
