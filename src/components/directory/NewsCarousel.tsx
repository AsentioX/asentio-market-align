import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, ChevronLeft, ChevronRight, Newspaper, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  imageUrl: string | null;
  source: string;
}

const PAGE_SIZE = 15;

const NewsCarousel = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [feedUrls, setFeedUrls] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(async (urls: string[], offset: number, append = false) => {
    const { data, error } = await supabase.functions.invoke('fetch-rss', {
      body: { feeds: urls, limit: PAGE_SIZE, offset },
    });
    if (error) throw error;
    if (data?.success && data.items) {
      setItems(prev => append ? [...prev, ...data.items] : data.items);
      setHasMore((offset + PAGE_SIZE) < (data.total ?? 0));
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: feeds, error } = await supabase
          .from('rss_feeds')
          .select('url')
          .eq('is_active', true);
        if (error) throw error;
        const urls = feeds?.map((f: any) => f.url) || [];
        if (urls.length === 0) { setIsLoading(false); return; }
        setFeedUrls(urls);
        await fetchPage(urls, 0, false);
      } catch (e) {
        console.error('Failed to fetch news:', e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [fetchPage]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      await fetchPage(feedUrls, items.length, true);
    } catch (e) {
      console.error('Failed to load more:', e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  };

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="py-8 bg-muted/50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Newspaper className="w-5 h-5 text-asentio-red" />
            <h2 className="text-lg font-semibold text-foreground">Latest XR News</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => scroll('left')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => scroll('right')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[300px]">
                  <div className="bg-card border border-border rounded-xl overflow-hidden h-full">
                    <Skeleton className="h-40 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            : items.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-[300px] group"
                >
                  <div className="bg-card border border-border rounded-xl overflow-hidden h-full hover:border-asentio-red/30 hover:shadow-lg transition-all duration-300">
                    <div className="h-40 bg-muted overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Newspaper className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium truncate">{item.source}</span>
                        <span className="flex-shrink-0">{formatDate(item.pubDate)}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-asentio-red transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-asentio-red font-medium pt-1">
                        Read more <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </a>
              ))}

          {/* Load More card at the end */}
          {!isLoading && hasMore && (
            <div className="flex-shrink-0 w-[200px] flex items-center justify-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="flex flex-col gap-2 h-auto py-6 px-6 border-dashed"
              >
                {isLoadingMore ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <span className="text-xs">{isLoadingMore ? 'Loading...' : 'Load more'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsCarousel;
