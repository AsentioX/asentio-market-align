const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  imageUrl: string | null;
  source: string;
}

function extractText(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function extractImage(itemXml: string): string | null {
  // Try media:content or media:thumbnail
  const mediaMatch = itemXml.match(/url=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)/i);
  if (mediaMatch) return mediaMatch[1];

  // Try enclosure
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enclosureMatch) return enclosureMatch[1];

  // Try og:image or img in description/content
  const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];

  return null;
}

function parseRss(xml: string, feedUrl: string): RssItem[] {
  const items: RssItem[] = [];
  const channelTitle = extractText(xml, 'title');
  
  // Split by <item> tags
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    items.push({
      title: extractText(itemXml, 'title'),
      link: extractText(itemXml, 'link'),
      description: extractText(itemXml, 'description').replace(/<[^>]*>/g, '').substring(0, 200),
      pubDate: extractText(itemXml, 'pubDate'),
      imageUrl: extractImage(itemXml),
      source: channelTitle || new URL(feedUrl).hostname,
    });
  }

  // Try Atom format if no items found
  if (items.length === 0) {
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entryXml = match[1];
      const linkMatch = entryXml.match(/<link[^>]+href=["']([^"']+)["']/i);
      items.push({
        title: extractText(entryXml, 'title'),
        link: linkMatch ? linkMatch[1] : '',
        description: extractText(entryXml, 'summary').replace(/<[^>]*>/g, '').substring(0, 200),
        pubDate: extractText(entryXml, 'published') || extractText(entryXml, 'updated'),
        imageUrl: extractImage(entryXml),
        source: channelTitle || new URL(feedUrl).hostname,
      });
    }
  }

  return items;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feeds, limit = 15, offset = 0 } = await req.json();

    if (!feeds || !Array.isArray(feeds) || feeds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'feeds array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all feeds in parallel, then interleave: feed1[0], feed2[0], feed3[0], feed1[1], ...
    const fetchFeed = async (feedUrl: string): Promise<RssItem[]> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(feedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Asentio-RSS-Reader/1.0)' },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!response.ok) {
          console.error(`Feed ${feedUrl} returned ${response.status}`);
          return [];
        }
        const xml = await response.text();
        const items = parseRss(xml, feedUrl);
        console.log(`Feed ${feedUrl}: ${items.length} items`);
        return items;
      } catch (e) {
        console.error(`Feed ${feedUrl} failed:`, e instanceof Error ? e.message : e);
        return [];
      }
    };

    const results = await Promise.allSettled(feeds.map(fetchFeed));
    const perFeed: RssItem[][] = results.map(r => r.status === 'fulfilled' ? r.value : []);

    const interleaved: RssItem[] = [];
    const maxLen = Math.max(...perFeed.map(f => f.length), 0);
    for (let i = 0; i < maxLen; i++) {
      for (const feed of perFeed) {
        if (i < feed.length) interleaved.push(feed[i]);
      }
    }
    const feedItems = interleaved;

    return new Response(
      JSON.stringify({ success: true, items: feedItems.slice(offset, offset + limit), total: feedItems.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('RSS fetch error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
