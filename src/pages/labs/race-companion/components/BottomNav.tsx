import { NavLink } from 'react-router-dom';
import { Clock, CalendarDays, Bell, Settings2 } from 'lucide-react';

const tabs = [
  { to: '/labs/race-companion', label: 'Today', icon: Clock, end: true },
  { to: '/labs/race-companion/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/labs/race-companion/alerts', label: 'Alerts', icon: Bell },
  { to: '/labs/race-companion/settings', label: 'Settings', icon: Settings2 },
];

export const BottomNav = () => (
  <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 pb-[env(safe-area-inset-bottom)]">
    <div className="mx-3 mb-3 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
      <div className="grid grid-cols-4">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? 'text-white' : 'text-white/40'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-orange-400 to-amber-300 rounded-full" />
                )}
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold tracking-wide uppercase">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  </nav>
);
