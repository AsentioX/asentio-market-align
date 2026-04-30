// My DJ — YouTube video details (tags, duration, category) for seed adaptation
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) return json({ error: 'YOUTUBE_API_KEY not configured' }, 500);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'Unauthorized' }, 401);

    const { videoId } = await req.json();
    if (!videoId || typeof videoId !== 'string' || videoId.length > 20) {
      return json({ error: 'Invalid videoId' }, 400);
    }

    const params = new URLSearchParams({
      part: 'snippet,contentDetails,topicDetails',
      id: videoId,
      key: apiKey,
    });
    const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
    if (!ytRes.ok) {
      const errText = await ytRes.text();
      return json({ error: 'YouTube API error', detail: errText }, 502);
    }
    const data = await ytRes.json();
    const item = data.items?.[0];
    if (!item) return json({ error: 'Video not found' }, 404);

    return json({
      videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      tags: item.snippet.tags ?? [],
      categoryId: item.snippet.categoryId,
      description: item.snippet.description,
      duration: item.contentDetails.duration, // ISO 8601
      topicCategories: item.topicDetails?.topicCategories ?? [],
    });
  } catch (err) {
    console.error('mydj-youtube-video error:', err);
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
