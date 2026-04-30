// My DJ — YouTube search proxy with per-user rate limiting
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DAILY_LIMIT = 80; // searches per user per day

interface SearchBody {
  query: string;
  pageToken?: string;
  videoDuration?: 'short' | 'medium' | 'long' | 'any';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      return json({ error: 'YOUTUBE_API_KEY not configured' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'Unauthorized' }, 401);
    const userId = userData.user.id;

    // Check + bump quota using service role (RLS would block writes here)
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const today = new Date().toISOString().slice(0, 10);
    const { data: quotaRow } = await admin
      .from('mydj_yt_quota')
      .select('search_count')
      .eq('user_id', userId)
      .eq('day', today)
      .maybeSingle();
    const currentCount = quotaRow?.search_count ?? 0;
    if (currentCount >= DAILY_LIMIT) {
      return json({ error: 'Daily YouTube search limit reached', limit: DAILY_LIMIT }, 429);
    }

    const body: SearchBody = await req.json();
    if (!body.query || typeof body.query !== 'string' || body.query.length > 200) {
      return json({ error: 'Invalid query' }, 400);
    }

    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      videoEmbeddable: 'true',
      videoSyndicated: 'true',
      videoCategoryId: '10', // Music
      maxResults: '15',
      q: body.query,
      key: apiKey,
    });
    if (body.pageToken) params.set('pageToken', body.pageToken);
    if (body.videoDuration && body.videoDuration !== 'any') {
      params.set('videoDuration', body.videoDuration);
    }

    const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!ytRes.ok) {
      const errText = await ytRes.text();
      console.error('YouTube search failed:', ytRes.status, errText);
      return json({ error: 'YouTube API error', status: ytRes.status, detail: errText }, 502);
    }
    const data = await ytRes.json();

    // Bump quota
    await admin
      .from('mydj_yt_quota')
      .upsert(
        { user_id: userId, day: today, search_count: currentCount + 1 },
        { onConflict: 'user_id,day' }
      );

    const items = (data.items ?? []).map((it: any) => ({
      videoId: it.id.videoId,
      title: it.snippet.title,
      channel: it.snippet.channelTitle,
      thumbnail: it.snippet.thumbnails?.medium?.url ?? it.snippet.thumbnails?.default?.url,
      publishedAt: it.snippet.publishedAt,
      description: it.snippet.description,
    }));

    return json({
      items,
      nextPageToken: data.nextPageToken,
      quotaUsed: currentCount + 1,
      quotaLimit: DAILY_LIMIT,
    });
  } catch (err) {
    console.error('mydj-youtube-search error:', err);
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
