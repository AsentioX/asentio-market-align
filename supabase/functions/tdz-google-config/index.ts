const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  // The OAuth *client ID* is a public value (it ships in every Google sign-in
  // button). Only the client secret is sensitive, and it is never returned.
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') ?? '';
  return new Response(JSON.stringify({ clientId }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
