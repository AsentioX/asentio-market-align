import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useArticle, useArticles } from '@/hooks/useAsentioContent';
import { useSeo } from '@/hooks/useSeo';
import TopographicPattern from '@/components/TopographicPattern';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { trackPageView } from '@/lib/analytics';
import { slugifyCategory } from '@/lib/xrTaxonomy';

interface ArticleDetailProps {
  kind: 'insight' | 'research';
}

const ArticleDetail = ({ kind }: ArticleDetailProps) => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug);
  const { data: related } = useArticles(kind, 4);

  const basePath = kind === 'research' ? '/research' : '/insights';

  useSeo({
    title: article?.seo_title || (article ? `${article.title} | Asentio` : 'Asentio'),
    description: article?.seo_description || article?.summary || undefined,
    canonicalPath: article ? `${basePath}/${article.slug}` : undefined,
    ogImage: article?.hero_image_url || undefined,
    type: 'article',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (article) trackPageView(`${basePath}/${article.slug}`);
  }, [article, basePath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-32 container mx-auto px-4">
        <h1 className="text-2xl font-bold text-foreground mb-3">Article not found</h1>
        <Link to={basePath} className="text-asentio-blue hover:underline">
          Back to {kind === 'research' ? 'Research' : 'Insights'}
        </Link>
      </div>
    );
  }

  const others = (related || []).filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <article>
        {/* Header */}
        <header className="relative pt-28 md:pt-36 pb-10 bg-muted">
          <TopographicPattern className="opacity-30" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <Link
              to={basePath}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> {kind === 'research' ? 'Research' : 'Insights'}
            </Link>

            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(article.categories || []).map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                {article.title}
              </h1>
              {article.summary && (
                <p className="text-base md:text-xl text-muted-foreground leading-relaxed">{article.summary}</p>
              )}
              <p className="text-sm text-muted-foreground mt-5">
                By {article.author}
                {article.published_at &&
                  ` · ${new Date(article.published_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}`}
              </p>
            </div>
          </div>
        </header>

        {article.hero_image_url && (
          <div className="container mx-auto px-4 md:px-6 -mt-6 relative z-20">
            <img
              src={article.hero_image_url}
              alt={article.title}
              loading="lazy"
              className="w-full max-h-[420px] object-cover rounded-2xl border border-border"
            />
          </div>
        )}

        {/* Body */}
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="max-w-3xl">
            {article.body ? (
              <div className="prose prose-lg max-w-none text-foreground">
                {article.body.split('\n\n').map((para, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed mb-5">
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 bg-muted/40">
                <p className="text-foreground font-medium mb-2">This piece is in progress.</p>
                <p className="text-muted-foreground mb-6">
                  Subscribe to the briefing and we'll send it the moment it publishes.
                </p>
                <NewsletterSignup source={`${kind}-${article.slug}`} compact />
              </div>
            )}

            {/* Related directory categories */}
            {(article.related_directory_categories || []).length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
                  Explore in the XR Directory
                </h2>
                <div className="flex flex-wrap gap-2">
                  {article.related_directory_categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/xr-directory?category=${encodeURIComponent(cat)}`}
                      className="px-3 py-1.5 rounded-full text-sm border border-border hover:border-asentio-red/50 hover:text-asentio-red transition-colors"
                      data-slug={slugifyCategory(cat)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Related reading + CTA */}
      <section className="bg-muted py-12 md:py-16 relative">
        <TopographicPattern className="opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {others.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-6">More reading</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {others.map((a) => (
                  <Link
                    key={a.id}
                    to={`${basePath}/${a.slug}`}
                    className="group bg-card border border-border rounded-xl p-5 hover:border-asentio-red/40 transition-colors"
                  >
                    <h3 className="font-semibold text-foreground group-hover:text-asentio-red transition-colors mb-2">
                      {a.title}
                    </h3>
                    {a.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{a.summary}</p>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/xr-directory">
              <Button className="bg-asentio-blue hover:bg-asentio-blue/90 px-6 py-5">
                Explore the XR Directory <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/work-with-us">
              <Button variant="outline" className="px-6 py-5 border-2">Work with Asentio</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetail;
