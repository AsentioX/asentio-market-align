import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../../lib/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useToast } from '@/hooks/use-toast';
import { LayoutDashboard, Package, Tags, FileText, BarChart3, ClipboardCheck, LogOut, ArrowLeft } from 'lucide-react';

export default function CKAdminLayout() {
  const { loading, isAdmin } = useAdmin();
  const loc = useLocation();

  if (loading) return <div className="p-10 text-stone-500">Loading…</div>;
  if (!isAdmin) return <AdminAuth nextPath={loc.pathname} />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-100">
      <div className="max-w-7xl mx-auto grid md:grid-cols-[220px_1fr]">
        <aside className="bg-white border-r border-stone-200 p-4 md:min-h-[calc(100vh-4rem)]">
          <Link to="/labs/carekits" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-4">
            <ArrowLeft className="w-4 h-4" /> Public site
          </Link>
          <h2 className="text-xs uppercase tracking-wide text-stone-500 px-2 mb-2">CMS</h2>
          <nav className="space-y-1 text-sm">
            <Item to="/labs/carekits/admin" end icon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</Item>
            <Item to="/labs/carekits/admin/products" icon={<Package className="w-4 h-4" />}>Products</Item>
            <Item to="/labs/carekits/admin/categories" icon={<Tags className="w-4 h-4" />}>Categories</Item>
            <Item to="/labs/carekits/admin/articles" icon={<FileText className="w-4 h-4" />}>Articles</Item>
            <Item to="/labs/carekits/admin/assessments" icon={<ClipboardCheck className="w-4 h-4" />}>Assessments</Item>
            <Item to="/labs/carekits/admin/analytics" icon={<BarChart3 className="w-4 h-4" />}>Click analytics</Item>
          </nav>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-6 w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </aside>
        <main className="p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Item({ to, end, icon, children }: { to: string; end?: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600 hover:bg-stone-100'}`}
    >
      {icon}{children}
    </NavLink>
  );
}

function AdminAuth({ nextPath }: { nextPath: string }) {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password: pwd,
          options: { emailRedirectTo: window.location.origin + nextPath }
        });
        if (error) throw error;
        toast({ title: 'Check your email', description: 'Verify, then sign in to continue.' });
        setMode('in');
      }
    } catch (e: any) {
      toast({ title: 'Auth error', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: 'google' | 'apple') {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + nextPath,
    });
    if (result.error) toast({ title: `${provider} sign-in failed`, description: result.error.message, variant: 'destructive' });
  }

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="text-2xl font-semibold mb-2">Admin {mode === 'in' ? 'sign in' : 'sign up'}</h1>
      <p className="text-sm text-stone-500 mb-6">Smart Care Kits CMS access. Admin role required (admin@asentio.com is auto-promoted).</p>

      <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-3">
        <button onClick={() => oauth('google')} className="w-full flex items-center justify-center gap-2 border border-stone-200 hover:bg-stone-50 font-medium py-3 rounded-full">
          <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.2 5.2C41 35.6 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>
        <button onClick={() => oauth('apple')} className="w-full flex items-center justify-center gap-2 bg-black hover:bg-stone-800 text-white font-medium py-3 rounded-full">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16.365 1.43c0 1.14-.42 2.23-1.18 3.04-.81.87-2.13 1.55-3.21 1.46-.13-1.1.41-2.25 1.13-3.03.81-.88 2.18-1.52 3.26-1.47zM20.5 17.07c-.57 1.32-.84 1.91-1.58 3.07-1.03 1.62-2.48 3.65-4.28 3.66-1.6.02-2.02-1.05-4.19-1.04-2.17.01-2.62 1.06-4.22 1.04C4.43 23.78 3.06 21.95 2.03 20.33.06 17.27-.13 13.66 1.02 11.4c.83-1.6 2.42-2.61 4.07-2.61 1.69 0 2.75 1.04 4.15 1.04 1.36 0 2.19-1.04 4.14-1.04 1.48 0 3.04.81 4.16 2.2-3.66 2.01-3.06 7.24.96 8.08z"/>
          </svg>
          Continue with Apple
        </button>

        <div className="flex items-center gap-3 py-1 text-xs text-stone-400">
          <div className="flex-1 h-px bg-stone-200" /> or email <div className="flex-1 h-px bg-stone-200" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-stone-200" />
          <input type="password" required value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl border border-stone-200" />
          <button disabled={busy} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-3 rounded-full">
            {busy ? '…' : mode === 'in' ? 'Sign in' : 'Create account'}
          </button>
          <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="w-full text-sm text-stone-500 hover:text-stone-800">
            {mode === 'in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
