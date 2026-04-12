import { useState } from 'react';
import { Home, Dumbbell, Trophy, Target, Settings, ArrowLeft, BookOpen, TrendingUp, Shield, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocalWeather, getWeatherEmoji } from './useLocalWeather';
import Dashboard from './Dashboard';
import WorkoutPage from './WorkoutPage';
import CompetitionsPage from './CompetitionsPage';
import GoalsPage from './GoalsPage';
import ProfilePage from './ProfilePage';
import WearableSettings from './WearableSettings';
import ExerciseLibraryPage from './ExerciseLibraryPage';
import ProgressAnalytics from './ProgressAnalytics';
import WOBuddyLogin from './WOBuddyLogin';
import { WOBuddyAuthProvider, useWOBuddyAuth } from '@/hooks/useWOBuddyAuth';

type Tab = 'dashboard' | 'workout' | 'competitions' | 'goals' | 'settings' | 'library' | 'progress';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'goals', label: 'Goals', icon: <Target className="w-5 h-5" /> },
  { id: 'workout', label: 'Workout', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'competitions', label: 'Compete', icon: <Trophy className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

const WOBuddyApp = () => {
  const { user, wobuddyUser, loading, isAdmin, signOut } = useWOBuddyAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { weather } = useLocalWeather();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs text-white/40">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <WOBuddyLogin />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'workout': return <WorkoutPage />;
      case 'competitions': return <CompetitionsPage />;
      case 'goals': return <GoalsPage />;
      case 'library': return <ExerciseLibraryPage onBack={() => setActiveTab('goals')} />;
      case 'progress': return <ProgressAnalytics />;
      case 'settings': return (
        <div className="space-y-6">
          <ProfilePage />
          <WearableSettings />
          {/* Account section */}
          <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
            <h3 className="text-sm font-medium mb-3">Account</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Signed in as</span>
                <span className="text-white/60">{user.email}</span>
              </div>
              {isAdmin && (
                <Link
                  to="/labs/wo-buddy/admin"
                  className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors py-2"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={signOut}
                className="w-full mt-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
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
          <div className="flex flex-col items-center">
            <h1 className="text-base font-bold tracking-tight">
              W.O.<span className="text-emerald-400">Buddy</span>
            </h1>
            {weather && (
              <div className="flex items-center gap-1.5 -mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-white/30" />
                <span className="text-[9px] text-white/40">{weather.city}</span>
                <span className="text-[10px]">{getWeatherEmoji(weather.code, weather.isDay)}</span>
                <span className="text-[9px] text-white/50 font-medium">{weather.temp}°F</span>
              </div>
            )}
          </div>
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

const WOBuddyLayout = () => {
  return (
    <WOBuddyAuthProvider>
      <WOBuddyApp />
    </WOBuddyAuthProvider>
  );
};

export default WOBuddyLayout;
