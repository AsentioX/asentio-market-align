import { useState } from 'react';
import { Home, Dumbbell, Trophy, Target, Settings, ArrowLeft, BookOpen, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import WorkoutPage from './WorkoutPage';
import CompetitionsPage from './CompetitionsPage';
import GoalsPage from './GoalsPage';
import ProfilePage from './ProfilePage';
import WearableSettings from './WearableSettings';
import ExerciseLibraryPage from './ExerciseLibraryPage';
import ProgressAnalytics from './ProgressAnalytics';

type Tab = 'dashboard' | 'workout' | 'competitions' | 'goals' | 'settings' | 'library' | 'progress';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'goals', label: 'Goals', icon: <Target className="w-5 h-5" /> },
  { id: 'workout', label: 'Workout', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'competitions', label: 'Compete', icon: <Trophy className="w-5 h-5" /> },
  { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-5 h-5" /> },
];

const WOBuddyLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'workout': return <WorkoutPage />;
      case 'competitions': return <CompetitionsPage />;
      case 'goals': return <GoalsPage />;
      case 'library': return <ExerciseLibraryPage onBack={() => setActiveTab('dashboard')} />;
      case 'progress': return <ProgressAnalytics />;
      case 'settings': return (
        <div className="space-y-6">
          <ProfilePage />
          <WearableSettings />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/labs" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">Labs</span>
          </Link>
          <h1 className="text-base font-bold tracking-tight">
            W.O.<span className="text-emerald-400">Buddy</span>
          </h1>
          <button onClick={() => setActiveTab('settings')} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white/60">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-24">
        {renderPage()}
      </main>

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
