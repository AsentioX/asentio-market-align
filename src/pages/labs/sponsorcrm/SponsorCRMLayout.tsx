import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ScrmAuthProvider, useScrmAuth } from './lib/useScrmAuth';
import { Button } from '@/components/ui/button';
import { Login } from './pages/Login';
import { LayoutDashboard, KanbanSquare, Building2, CheckSquare, Users, LogOut, Sparkles } from 'lucide-react';

function Shell() {
  const { user, isMember, loading, role, signOut } = useScrmAuth();
  const nav = useNavigate();
  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">Loading…</div>;
  if (!user) return <Login />;
  if (!isMember) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <div className="text-2xl font-semibold text-slate-900">Awaiting access</div>
        <p className="text-slate-600">Your account ({user.email}) is not yet on the sponsorship team. Ask a chair to invite you from the Team page.</p>
        <Button variant="outline" onClick={async () => { await signOut(); nav('/labs/rhcrm'); }}>Sign out</Button>
      </div>
    </div>
  );

  const link = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex">
      <aside className="w-56 border-r border-slate-200 bg-slate-50/50 p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold">Sponsor CRM</div>
            <div className="text-[11px] text-slate-500">MIT Reality Hack</div>
          </div>
        </div>
        <NavLink to="/labs/rhcrm" end className={link}><LayoutDashboard className="w-4 h-4" /> Today</NavLink>
        <NavLink to="/labs/rhcrm/pipeline" className={link}><KanbanSquare className="w-4 h-4" /> Pipeline</NavLink>
        <NavLink to="/labs/rhcrm/sponsors" className={link}><Building2 className="w-4 h-4" /> Sponsors</NavLink>
        <NavLink to="/labs/rhcrm/actions" className={link}><CheckSquare className="w-4 h-4" /> Actions</NavLink>
        <NavLink to="/labs/rhcrm/team" className={link}><Users className="w-4 h-4" /> Team</NavLink>
        <div className="mt-auto pt-4 border-t border-slate-200">
          <div className="px-2 pb-2">
            <div className="text-xs font-medium text-slate-900 truncate">{user.email}</div>
            <div className="text-[11px] text-slate-500 capitalize">{role}</div>
          </div>
          <button onClick={() => signOut()} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0"><Outlet /></main>
    </div>
  );
}

export default function SponsorCRMLayout() {
  return (
    <ScrmAuthProvider>
      <Shell />
    </ScrmAuthProvider>
  );
}
