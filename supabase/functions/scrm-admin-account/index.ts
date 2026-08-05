import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const DEFAULT_PASSWORD = 'R34l1tyH4ck!!';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const url = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // --- authenticate caller ---
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return json({ error: 'Unauthorized' }, 401);

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData.user) return json({ error: 'Unauthorized' }, 401);

  const { data: callerRole } = await admin
    .from('scrm_user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (callerRole?.role !== 'admin') return json({ error: 'Admin only' }, 403);

  // --- validate input ---
  let body: { action?: string; member_id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  const action = body.action;
  const memberId = body.member_id;
  if (action !== 'create_account' && action !== 'reset_password') {
    return json({ error: 'Invalid action' }, 400);
  }
  if (!memberId || typeof memberId !== 'string') {
    return json({ error: 'member_id is required' }, 400);
  }

  const { data: member, error: memberErr } = await admin
    .from('scrm_user_roles')
    .select('id, user_id, email')
    .eq('id', memberId)
    .maybeSingle();
  if (memberErr || !member) return json({ error: 'Member not found' }, 404);
  if (!member.email) return json({ error: 'Member has no email' }, 400);

  const email = member.email.toLowerCase();
  let targetUserId = member.user_id as string | null;

  if (!targetUserId) {
    // find an existing auth user with this email, otherwise create one
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
    });
    if (created?.user) {
      targetUserId = created.user.id;
    } else {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list?.users?.find((u) => u.email?.toLowerCase() === email);
      if (!found) return json({ error: createErr?.message ?? 'Could not create account' }, 400);
      targetUserId = found.id;
    }
  }

  const { error: updErr } = await admin.auth.admin.updateUserById(targetUserId!, {
    password: DEFAULT_PASSWORD,
    email_confirm: true,
  });
  if (updErr) return json({ error: updErr.message }, 400);

  const { error: rowErr } = await admin
    .from('scrm_user_roles')
    .update({ user_id: targetUserId, must_change_password: true })
    .eq('id', memberId);
  if (rowErr) return json({ error: rowErr.message }, 400);

  return json({ ok: true, email, action });
});
