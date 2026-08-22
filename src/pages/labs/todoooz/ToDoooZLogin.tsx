import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Boxes } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ToDoooZLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/labs/todoooz` },
        });
        if (error) throw error;
        toast.success('Check your email to confirm your account.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/labs/todoooz`,
        scopes: GOOGLE_SCOPES,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) toast.error(error.message ?? 'Google sign-in failed');
  };



  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-sm">
        <Link to="/labs" className="mb-6 inline-flex items-center gap-2 text-xs text-white/40 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Labs
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-indigo-300 to-emerald-300 bg-clip-text text-2xl font-bold text-transparent">
              ToDoooZ
            </h1>
            <p className="text-xs text-white/40">Your Tasks in 3D</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-white/10 bg-white/5"
          />
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border-white/10 bg-white/5"
          />
          <Button type="submit" disabled={busy} className="w-full bg-indigo-500 hover:bg-indigo-400">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <Button onClick={google} variant="outline" className="mt-3 w-full border-white/15 bg-transparent hover:bg-white/10">
          Continue with Google
        </Button>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-4 w-full text-xs text-white/40 hover:text-white"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default ToDoooZLogin;
