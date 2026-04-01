import { useState } from 'react';
import { Home, Dumbbell, Trophy, TrendingUp, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import WorkoutPage from './WorkoutPage';
import CompetitionsPage from './CompetitionsPage';
import ProgressPage from './ProgressPage';
import ProfilePage from './ProfilePage';

type Tab = 'dashboard' | 'workout' | 'competitions' | 'progress' | 'profile';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'workout', label: 'Workout', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'competitions', label: 'Compete', icon: <Trophy className="w-5 h-5" /> },
  { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

const WOBuddyLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'workout': return <WorkoutPage />;
      case 'competitions': return <CompetitionsPage />;
      case 'progress': return <ProgressPage />;
      case 'profile': return <ProfilePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/labs" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Labs</span>
          </Link>
          <h1 className="text-base font-bold tracking-tight">
            W.O.<span className="text-emerald-400">Buddy</span>
          </h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-24">
        {renderPage()}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#111118]/95 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-lg mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                activeTab === tab.id
                  ? 'text-emerald-400'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default WOBuddyLayout;
