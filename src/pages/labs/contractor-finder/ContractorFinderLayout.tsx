import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Search, Bookmark, Database, HardHat, Sparkles, BookOpen, LogOut } from 'lucide-react';
import { CFProvider } from './useCFStore';
import { cfTheme } from './cfTheme';
import { TradeLegendModal } from './components/TradeLegendModal';
import { useAuth } from '@/hooks/useAuth';
import ContractorFinderLogin from './ContractorFinderLogin';

const navItems = [
  { to: '/labs/contractor-finder', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/labs/contractor-finder/explore', icon: Search, label: 'Explore' },
  { to: '/labs/contractor-finder/segments', icon: Bookmark, label: 'Segments' },
  { to: '/labs/contractor-finder/pipeline', icon: Database, label: 'Data Pipeline' },
];

export default function ContractorFinderLayout() {
  const [showLegend, setShowLegend] = useState(false);
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div style={cfTheme} className="min-h-screen flex items-center justify-center" >
        <div
          className="min-h-screen w-full flex items-center justify-center"
          style={{ background: 'hsl(var(--cf-bg))' }}
        >
          <div
            className="w-8 h-8 border-[3px] rounded-full animate-spin"
            style={{ borderColor: 'hsl(var(--cf-border))', borderTopColor: 'hsl(var(--cf-primary))' }}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return <ContractorFinderLogin />;
  }

  return (
    <CFProvider>
      <div
        style={cfTheme}
        className="min-h-screen"
      >
        <div
          className="min-h-screen flex flex-col"
          style={{ background: 'hsl(var(--cf-bg))', color: 'hsl(var(--cf-text))' }}
        >
          <header
            className="sticky top-0 z-40 backdrop-blur"
            style={{
              background: 'hsl(var(--cf-surface) / 0.85)',
              borderBottom: '1px solid hsl(var(--cf-border))',
            }}
          >
            <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center gap-8">
              <Link to="/labs/contractor-finder" className="flex items-center gap-2.5 group">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ background: 'hsl(var(--cf-primary))' }}
                >
                  <HardHat className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold tracking-tight">Contractor Finder</div>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: 'hsl(var(--cf-text-subtle))' }}>
                    Intelligence Platform
                  </div>
                </div>
              </Link>

              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive ? 'cf-nav-active' : 'cf-nav-idle'
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? { background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }
                        : { color: 'hsl(var(--cf-text-muted))' }
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="ml-auto flex items-center gap-3">
                <button
                  onClick={() => setShowLegend(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors hover:bg-[hsl(var(--cf-surface-alt))]"
                  style={{
                    border: '1px solid hsl(var(--cf-border))',
                    color: 'hsl(var(--cf-text-muted))',
                  }}
                  title="View CSLB trade code legend"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Trade Codes
                </button>
                <div
                  className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: 'hsl(var(--cf-success-soft))',
                    color: 'hsl(var(--cf-success))',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(var(--cf-success))' }} />
                  Pipeline healthy
                </div>
                <Link
                  to="/labs"
                  className="text-xs px-3 py-1.5 rounded-md border transition-colors"
                  style={{
                    borderColor: 'hsl(var(--cf-border))',
                    color: 'hsl(var(--cf-text-muted))',
                  }}
                >
                  ← All Labs
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors hover:bg-[hsl(var(--cf-surface-alt))]"
                  style={{
                    borderColor: 'hsl(var(--cf-border))',
                    color: 'hsl(var(--cf-text-muted))',
                  }}
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-8">
            <Outlet />
          </main>

          <footer
            className="text-xs px-6 py-4"
            style={{
              borderTop: '1px solid hsl(var(--cf-border))',
              color: 'hsl(var(--cf-text-subtle))',
            }}
          >
            <div className="max-w-[1600px] mx-auto flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Prototype data sourced from official licensing boards + business enrichment layer. Last sync: just now.
            </div>
          </footer>
        </div>
        {showLegend && <TradeLegendModal onClose={() => setShowLegend(false)} />}
      </div>
    </CFProvider>
  );
}
