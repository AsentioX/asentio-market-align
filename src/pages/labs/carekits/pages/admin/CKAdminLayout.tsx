import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../../lib/useAdmin';
import { supabase } from '@/integrations/supabase/client';
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

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="text-2xl font-semibold mb-2">Admin {mode === 'in' ? 'sign in' : 'sign up'}</h1>
      <p className="text-sm text-stone-500 mb-6">Smart Care Kits CMS access. Admin role required (admin@asentio.com is auto-promoted).</p>
      <form onSubmit={submit} className="space-y-3 bg-white border border-stone-200 rounded-3xl p-6">
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
  );
}
