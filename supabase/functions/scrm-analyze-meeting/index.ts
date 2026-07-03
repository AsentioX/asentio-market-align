import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { transcript, sponsor_name, stage } = await req.json();
    if (!transcript || typeof transcript !== 'string' || transcript.length < 20) {
      return new Response(JSON.stringify({ error: 'transcript required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing LOVABLE_API_KEY' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const system = `You analyze sponsor meeting transcripts for the MIT Reality Hack sponsorship team.
Return ONLY valid JSON matching this shape:
{
  "objectives": string[],
  "topics": string[],
  "decisions": string[],
  "risks": string[],
  "questions": string[],
  "minutes": string,
  "actions": [{ "title": string, "category": "outreach"|"meeting"|"commercial"|"activation"|"delivery"|"renewal", "waiting_on": "mit"|"sponsor", "due_in_days": number, "priority": "low"|"medium"|"high" }]
}
"minutes" is clean professional markdown meeting minutes.
Extract action items literally mentioned. Prefer standardized titles like "Send prospectus", "Follow up", "Schedule presentation", "Send proposal", "Send contract", "Collect logos", "Confirm mentors".
Sponsor: ${sponsor_name ?? 'Unknown'}. Current stage: ${stage ?? 'unknown'}.`;

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Transcript:\n${transcript.slice(0, 30000)}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: `AI ${resp.status}: ${text}` }), {
        status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content ?? '{}';
    let parsed: unknown;
    try { parsed = JSON.parse(content); } catch { parsed = { minutes: content, objectives: [], topics: [], decisions: [], risks: [], questions: [], actions: [] }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
