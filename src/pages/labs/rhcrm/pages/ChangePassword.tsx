import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useScrmAuth } from '../lib/useScrmAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

export const SCRM_DEFAULT_PASSWORD = 'R34l1tyH4ck!!';

export function ChangePassword() {
  const { user, refreshMembership, signOut } = useScrmAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Use at least 8 characters'); return; }
    if (password === SCRM_DEFAULT_PASSWORD) { toast.error('Choose a password different from the default'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setBusy(false); toast.error(error.message); return; }
    const { error: rowErr } = await supabase
      .from('scrm_user_roles' as any)
      .update({ must_change_password: false } as any)
      .eq('user_id', user!.id);
    setBusy(false);
    if (rowErr) { toast.error(rowErr.message); return; }
    toast.success('Password updated');
    await refreshMembership();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <KeyRound className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Set a new password</h1>
        </div>
        <p className="text-sm text-slate-500">
          You're signed in with the default password. Choose a new one to continue.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label className="text-xs">New password</Label>
            <Input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Confirm password</Label>
            <Input type="password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-slate-900 hover:bg-slate-800">
            {busy ? 'Saving…' : 'Update password'}
          </Button>
        </form>
        <button className="w-full text-xs text-slate-500 hover:text-slate-900" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    </div>
  );
}
