import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { HeartHandshake, ShoppingBag, ClipboardList, Bookmark, LayoutDashboard } from 'lucide-react';
import { useAdmin } from './lib/useAdmin';
import { AffiliateDisclosure, MedicalDisclaimer } from './components/Disclosure';

export default function CareKitsLayout() {
  const loc = useLocation();
  const { isAdmin } = useAdmin();
  const isAdminRoute = loc.pathname.startsWith('/labs/carekits/admin');

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/labs/carekits" className="flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-full bg-emerald-600 text-white grid place-items-center">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <span className="text-xl font-semibold tracking-tight">Smart Care Kits</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <NavItem to="/labs/carekits/quiz" icon={<ClipboardList className="w-4 h-4" />}>Assessment</NavItem>
            <NavItem to="/labs/carekits/marketplace" icon={<ShoppingBag className="w-4 h-4" />}>Marketplace</NavItem>
            <NavItem to="/labs/carekits/saved" icon={<Bookmark className="w-4 h-4" />}>Saved</NavItem>
            {isAdmin && <NavItem to="/labs/carekits/admin" icon={<LayoutDashboard className="w-4 h-4" />}>Admin</NavItem>}
          </nav>
          <Link
            to="/labs/carekits/quiz"
            className="hidden sm:inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-full"
          >
            Take 2-min assessment
          </Link>
        </div>
      </header>

      <main className={isAdminRoute ? '' : 'pb-16'}>
        <Outlet />
      </main>

      {!isAdminRoute && (
        <footer className="border-t border-stone-200 bg-white">
          <div className="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-3 gap-8 text-sm text-stone-600">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white grid place-items-center">
                  <HeartHandshake className="w-4 h-4" />
                </span>
                <span className="font-semibold text-stone-900">Smart Care Kits</span>
              </div>
              <p className="leading-relaxed">Helping families build a calmer, safer home for the people they love.</p>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 mb-2">Explore</h4>
              <ul className="space-y-1.5">
                <li><Link to="/labs/carekits/quiz" className="hover:text-emerald-700">Take the assessment</Link></li>
                <li><Link to="/labs/carekits/marketplace" className="hover:text-emerald-700">Browse marketplace</Link></li>
                <li><Link to="/labs/carekits/learn/aging-in-place-technology-guide" className="hover:text-emerald-700">Aging in place guide</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <AffiliateDisclosure />
              <MedicalDisclaimer />
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function NavItem({ to, children, icon }: { to: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/labs/carekits'}
      className={({ isActive }) =>
        `inline-flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors ${
          isActive ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600 hover:bg-stone-100'
        }`
      }
    >
      {icon}{children}
    </NavLink>
  );
}
