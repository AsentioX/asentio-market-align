import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { error } = await admin.auth.admin.updateUserById(
    'f4ac36f4-0577-4aad-a437-47dba922c663',
    { password: 'Xujiahui88', email_confirm: true },
  );

  return new Response(JSON.stringify({ ok: !error, error: error?.message ?? null }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: error ? 500 : 200,
  });
});
