import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Layers, Map, User } from 'lucide-react';

const tabs = [
  { to: '/labs/vibin', label: 'Home', icon: Home, end: true },
  { to: '/labs/vibin/cards', label: 'Cards', icon: LayoutGrid },
  { to: '/labs/vibin/decks', label: 'Decks', icon: Layers },
  { to: '/labs/vibin/trips', label: 'Trips', icon: Map },
  { to: '/labs/vibin/profile', label: 'Profile', icon: User },
];

export const BottomNav = () => (
  <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-white/95 backdrop-blur-xl border-t border-[hsl(240_15%_92%)] pb-[env(safe-area-inset-bottom)]">
    <div className="grid grid-cols-5">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-2.5 transition-colors ${
              isActive ? 'text-[hsl(345_95%_60%)]' : 'text-[hsl(240_8%_55%)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={`w-5 h-5 ${isActive ? 'fill-[hsl(345_95%_60%)]/15' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);
