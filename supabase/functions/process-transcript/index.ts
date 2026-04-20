import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExistingTopic {
  id: string;
  title: string;
  summary: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing required server config' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { transcript } = await req.json();
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 30) {
      return new Response(JSON.stringify({ error: 'Transcript text is required (min 30 chars)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Pull existing topics
    const { data: topicsData } = await admin
      .from('gov_policies')
      .select('id, title, summary')
      .neq('status', 'archived');
    const topics = (topicsData ?? []) as ExistingTopic[];

    const topicListString = topics.length
      ? topics.map((t, i) => `${i + 1}. [${t.id}] ${t.title}\n   Current summary: ${t.summary}`).join('\n')
      : '(no existing topics yet)';

    const systemPrompt = `You are an expert facilitator who processes meeting transcripts to organize a team's collaboration topics.

For each meaningful topic discussed in the transcript:
1. If it semantically matches an EXISTING topic, return its id and provide a "new_insights" paragraph that should be APPENDED to its description (not a replacement) — capture new viewpoints, decisions, or evolutions surfaced in this transcript.
2. If no existing topic matches, propose a NEW topic with a clear title (4-8 words), a 1-2 sentence summary, and an estimated priority 1-5 (1=low, 5=urgent).
3. For every topic (matched or new), extract concrete action items with task_description and, if mentioned, who is the driver (free text name).
4. Only use existing topic ids from the list. Do not invent uuids.

Be precise. Skip filler. Prefer fewer high-quality items over many low-quality ones.`;

    const tools = [
      {
        type: 'function',
        function: {
          name: 'process_transcript_results',
          description: 'Returns the structured analysis of the transcript.',
          parameters: {
            type: 'object',
            properties: {
              matched_topics: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    topic_id: { type: 'string' },
                    new_insights: { type: 'string', description: 'New paragraph to append to the topic description.' },
                    action_items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          task_description: { type: 'string' },
                          driver_name: { type: 'string', description: 'Optional name mentioned as driver.' },
                        },
                        required: ['task_description'],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['topic_id', 'new_insights', 'action_items'],
                  additionalProperties: false,
                },
              },
              new_topics: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    summary: { type: 'string' },
                    priority: { type: 'number' },
                    action_items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          task_description: { type: 'string' },
                          driver_name: { type: 'string' },
                        },
                        required: ['task_description'],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['title', 'summary', 'priority', 'action_items'],
                  additionalProperties: false,
                },
              },
            },
            required: ['matched_topics', 'new_topics'],
            additionalProperties: false,
          },
        },
      },
    ];

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `EXISTING TOPICS:\n${topicListString}\n\nTRANSCRIPT:\n${transcript.slice(0, 30000)}` },
        ],
        tools,
        tool_choice: { type: 'function', function: { name: 'process_transcript_results' } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again shortly.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: 'AI credits exhausted. Add funds in Settings → Workspace → Usage.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error('AI gateway error', aiResp.status, text);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: 'AI returned no structured result' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const args = JSON.parse(toolCall.function.arguments);
    const matched = (args.matched_topics ?? []) as Array<{ topic_id: string; new_insights: string; action_items: Array<{ task_description: string; driver_name?: string }> }>;
    const newTopics = (args.new_topics ?? []) as Array<{ title: string; summary: string; priority: number; action_items: Array<{ task_description: string; driver_name?: string }> }>;

    // Member name → id map for driver assignment
    const { data: members } = await admin.from('gov_members').select('id, name');
    const memberByName = new Map<string, string>();
    (members ?? []).forEach((m: any) => memberByName.set(m.name.toLowerCase(), m.id));

    const validTopicIds = new Set(topics.map(t => t.id));

    let updatedTopics = 0;
    let createdTopics = 0;
    let createdActions = 0;

    // 1) Apply insights to matched topics
    for (const m of matched) {
      if (!validTopicIds.has(m.topic_id)) continue;
      const topic = topics.find(t => t.id === m.topic_id)!;
      const stamp = new Date().toISOString().slice(0, 10);
      const appended = `${topic.summary}\n\n— Insight (${stamp}) —\n${m.new_insights}`;
      await admin.from('gov_policies').update({ summary: appended, last_discussed_at: new Date().toISOString() }).eq('id', m.topic_id);
      await admin.from('gov_topic_history').insert({
        topic_id: m.topic_id,
        event_type: 'insight_added',
        actor_id: user.id,
        payload: { insight: m.new_insights },
      });
      for (const a of m.action_items) {
        const driverId = a.driver_name ? memberByName.get(a.driver_name.toLowerCase()) ?? null : null;
        const { data: ins } = await admin.from('gov_action_items').insert({
          topic_id: m.topic_id,
          task_description: a.task_description,
          driver_id: driverId,
          created_by: user.id,
        }).select().single();
        if (ins) {
          await admin.from('gov_topic_history').insert({
            topic_id: m.topic_id,
            event_type: 'action_created',
            actor_id: user.id,
            payload: { action_id: ins.id, task_description: a.task_description, source: 'ai_transcript' },
          });
          createdActions++;
        }
      }
      updatedTopics++;
    }

    // 2) Create new topics
    for (const nt of newTopics) {
      const priority = Math.max(1, Math.min(5, Math.round(nt.priority || 3)));
      const { data: created, error: createErr } = await admin.from('gov_policies').insert({
        title: nt.title,
        summary: nt.summary,
        status: 'draft',
        priority,
        last_discussed_at: new Date().toISOString(),
        created_by: user.id,
      }).select().single();
      if (createErr || !created) {
        console.error('create topic error', createErr);
        continue;
      }
      createdTopics++;
      await admin.from('gov_topic_history').insert({
        topic_id: created.id,
        event_type: 'description_updated',
        actor_id: user.id,
        payload: { source: 'ai_transcript', initial_summary: nt.summary },
      });
      for (const a of nt.action_items) {
        const driverId = a.driver_name ? memberByName.get(a.driver_name.toLowerCase()) ?? null : null;
        const { data: ins } = await admin.from('gov_action_items').insert({
          topic_id: created.id,
          task_description: a.task_description,
          driver_id: driverId,
          created_by: user.id,
        }).select().single();
        if (ins) {
          await admin.from('gov_topic_history').insert({
            topic_id: created.id,
            event_type: 'action_created',
            actor_id: user.id,
            payload: { action_id: ins.id, task_description: a.task_description, source: 'ai_transcript' },
          });
          createdActions++;
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      stats: { updatedTopics, createdTopics, createdActions },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('process-transcript fatal', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
