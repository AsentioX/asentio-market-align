// Lovable AI: NL segment builder + AI profile summary
// Two modes via { mode: 'segment' | 'summary' }
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SEGMENT_TOOL = {
  type: 'function',
  function: {
    name: 'build_segment_filters',
    description: 'Translate a natural-language contractor search query into structured filter criteria.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text keyword search residual.' },
        states: { type: 'array', items: { type: 'string' }, description: 'US state codes (e.g., CA, NY).' },
        cities: { type: 'array', items: { type: 'string' } },
        counties: { type: 'array', items: { type: 'string' } },
        zip: { type: 'string' },
        radiusMiles: { type: 'number' },
        contractorTypes: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'General Contractor', 'Flooring Installer', 'Painter', 'Electrician', 'Plumber',
              'Roofer', 'Kitchen / Bath Remodeler', 'HVAC', 'Cabinet Installer', 'Tile Installer',
              'Landscaping', 'Handyman',
            ],
          },
        },
        licenseStatus: {
          type: 'array',
          items: { type: 'string', enum: ['Active', 'Inactive', 'Expired', 'Suspended'] },
        },
        hasWebsite: { type: 'boolean' },
        hasEmail: { type: 'boolean' },
        hasVerifiedEmail: { type: 'boolean' },
        hasPhone: { type: 'boolean' },
        companySizes: {
          type: 'array',
          items: { type: 'string', enum: ['Solo Operator', 'Small Crew', 'Growing Local', 'Mid-Sized', 'Multi-Location'] },
        },
        maturity: {
          type: 'array',
          items: { type: 'string', enum: ['Premium / Design-Forward', 'Established', 'Value / Budget', 'Low-Tech'] },
        },
        minReviews: { type: 'number' },
        maxReviews: { type: 'number' },
        minConfidence: { type: 'number' },
        commercialResidential: { type: 'string', enum: ['Commercial', 'Residential', 'Both'] },
        rationale: { type: 'string', description: 'One-sentence plain-English summary of how the query was interpreted.' },
      },
      additionalProperties: false,
    },
  },
};

const SUMMARY_TOOL = {
  type: 'function',
  function: {
    name: 'summarize_contractor',
    description: 'Produce a structured AI assessment of a contractor.',
    parameters: {
      type: 'object',
      properties: {
        who_they_are: { type: 'string', description: '1-2 sentence overview of the company.' },
        likely_jobs: { type: 'string', description: 'What jobs they likely take on.' },
        size_assessment: { type: 'string', description: 'Solo / small / mid / established commentary.' },
        digital_maturity: { type: 'string', description: 'How digitally mature they appear.' },
        target_persona: { type: 'string', description: 'Who would buy from them.' },
        adjacent_segments: {
          type: 'array',
          items: { type: 'string' },
          description: '3 adjacent contractor types worth including in the same outreach segment.',
        },
      },
      required: ['who_they_are', 'likely_jobs', 'size_assessment', 'digital_maturity', 'target_persona', 'adjacent_segments'],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const mode = body?.mode;

    let messages: Array<{ role: string; content: string }>;
    let tool: typeof SEGMENT_TOOL;
    let toolName: string;

    if (mode === 'segment') {
      const query = String(body?.query ?? '').trim();
      if (!query) {
        return new Response(JSON.stringify({ error: 'query required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      tool = SEGMENT_TOOL;
      toolName = 'build_segment_filters';
      messages = [
        {
          role: 'system',
          content:
            'You are a contractor-search query parser. Convert the user query into structured filters. Be conservative: only include fields explicitly implied. Use US state codes. Cities are proper-cased.',
        },
        { role: 'user', content: query },
      ];
    } else if (mode === 'summary') {
      const contractor = body?.contractor;
      if (!contractor) {
        return new Response(JSON.stringify({ error: 'contractor required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      tool = SUMMARY_TOOL as any;
      toolName = 'summarize_contractor';
      messages = [
        {
          role: 'system',
          content:
            'You are a B2B contractor analyst. Given a contractor record, produce a concise, neutral structured assessment for a sales/research user. Keep each field 1-2 sentences.',
        },
        {
          role: 'user',
          content: `Contractor:\n${JSON.stringify(contractor, null, 2)}`,
        },
      ];
    } else {
      return new Response(JSON.stringify({ error: 'mode must be "segment" or "summary"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages,
        tools: [tool],
        tool_choice: { type: 'function', function: { name: toolName } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limited. Please try again shortly.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: 'AI credits exhausted. Add funds in Workspace > Usage.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error('AI gateway error', response.status, t);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;
    if (!args) {
      return new Response(JSON.stringify({ error: 'No structured output returned' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const parsed = typeof args === 'string' ? JSON.parse(args) : args;
    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('contractor-ai error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
