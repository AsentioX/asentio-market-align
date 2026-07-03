import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

export function Login() {
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin + '/labs/rhcrm' });
    setBusy(false);
    if (res.error) toast.error(res.error.message);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const fn = mode === 'signin'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/labs/rhcrm' } });
    const { error } = await fn;
    setBusy(false);
    if (error) toast.error(error.message);
    else if (mode === 'signup') toast.success('Check your email to confirm');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">Sponsor CRM</div>
            <div className="text-xs text-slate-500">MIT Reality Hack</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Mission control for sponsorship</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to see what needs your attention today.</p>
          </div>
          <Button onClick={google} disabled={busy} variant="outline" className="w-full">
            <svg width="16" height="16" viewBox="0 0 24 24" className="mr-2"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </Button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="flex-1 h-px bg-slate-200" /> or <div className="flex-1 h-px bg-slate-200" />
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Password</Label>
              <Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-slate-900 hover:bg-slate-800">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
          <button className="w-full text-xs text-slate-500 hover:text-slate-900" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-4">
          The first person to sign in becomes the sponsorship chair.
        </p>
      </div>
    </div>
  );
}
