import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Upload, Library, Users, Archive, Menu, X, ChevronLeft } from 'lucide-react';
import { usePhase, Phase } from '@/hooks/useGovernance';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const NAV = [
  { to: '/labs/governance', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/labs/governance/upload', icon: Upload, label: 'Transcript Upload', end: false },
  { to: '/labs/governance/library', icon: Library, label: 'Policy Library', end: false },
  { to: '/labs/governance/members', icon: Users, label: 'Task Force', end: false },
  { to: '/labs/governance/archive', icon: Archive, label: 'Archive', end: false },
];

const PHASES: { key: Phase; label: string }[] = [
  { key: 'visioning', label: 'Visioning' },
  { key: 'drafting', label: 'Drafting' },
  { key: 'community-review', label: 'Community Review' },
  { key: 'finalized', label: 'Finalized' },
];

const GovernanceLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { phase, setPhase } = usePhase();
  const phaseIdx = PHASES.findIndex((p) => p.key === phase);

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button className="md:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>
          <Link to="/labs" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Labs
          </Link>
          <h1 className="text-base font-semibold text-gray-800">Field Of View</h1>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {PHASES.map((p, i) => (
            <button
              key={p.key}
              onClick={() => setPhase(p.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                i <= phaseIdx ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-400',
              )}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-current">
                {i + 1}
              </span>
              {p.label}
              {i < PHASES.length - 1 && <span className="ml-1 text-current/50">›</span>}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={cn(
          'bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 overflow-y-auto',
          sidebarOpen ? 'w-56' : 'w-0 md:w-14',
          'md:block',
          !sidebarOpen && 'hidden md:block',
        )}>
          <nav className="py-4 space-y-1 px-2">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                  )
                }
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GovernanceLayout;
