import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '@/hooks/useAsentioContent';
import { useSeo } from '@/hooks/useSeo';
import insightsHeaderBg from '@/assets/insights-header-bg.png.asset.json';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2 } from 'lucide-react';
import { trackPageView } from '@/lib/analytics';


interface ArticleIndexProps {
  kind: 'insight' | 'research';
}

const COPY = {
  insight: {
    eyebrow: 'Insights',
    title: 'Exploring the Human + AI Future',
    description:
      'Perspectives on how AI is changing the way we interact, work, and live, and what these shifts mean for products, businesses, and markets.',
    seoTitle: 'Insights — XR, AI & Wearables Analysis | Asentio',
    seoDescription:
      'Asentio Insights: editorial analysis on AI glasses, wearables, multimodal AI, human-centered design and go-to-market strategy for the interface era.',
    path: '/insights',
  },
  research: {
    eyebrow: 'Research',
    title: 'Research and market intelligence',
    description:
      'Structured research drawn from the HAI Directory — category maps, landscape scans and thesis work on where the interface is heading.',
    seoTitle: 'Research — XR & AI Market Intelligence | Asentio',
    seoDescription:
      'Asentio Research: market maps, landscape scans and structured intelligence on the XR, AI and wearables ecosystem.',
    path: '/research',
  },
};

const ArticleIndex = ({ kind }: ArticleIndexProps) => {
  const copy = COPY[kind];
  const { data: articles, isLoading } = useArticles(kind);

  useSeo({
    title: copy.seoTitle,
    description: copy.seoDescription,
    canonicalPath: copy.path,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(copy.path);
  }, [copy.path]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative pt-28 md:pt-36 pb-10 md:pb-14 bg-muted">
        <TopographicPattern className="opacity-30" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <p className="text-xs uppercase tracking-wide text-asentio-red font-semibold mb-3">
              {copy.eyebrow}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{copy.title}</h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {copy.description}
            </p>
          </div>
        </div>
      </section>

      {/* Article list */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
          </div>
        ) : !articles || articles.length === 0 ? (
          <p className="text-muted-foreground">Nothing published yet — the first pieces are in progress.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`${copy.path}/${article.slug}`}
                className="group relative bg-card border border-border rounded-xl p-6 hover:border-asentio-red/40 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red transition-all duration-300 group-hover:h-full" />

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(article.categories || []).slice(0, 2).map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                  {article.status !== 'published' && (
                    <Badge className="text-xs bg-muted text-muted-foreground">Coming soon</Badge>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-asentio-red transition-colors">
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 mb-4">
                    {article.summary}
                  </p>
                )}

                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-asentio-blue group-hover:text-asentio-red transition-colors">
                  Read <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-muted py-12 md:py-16 relative">
        <TopographicPattern className="opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <NewsletterSignup source={kind} />
        </div>
      </section>
    </div>
  );
};

export default ArticleIndex;
