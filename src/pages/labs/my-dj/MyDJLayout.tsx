import { useState } from 'react';
import { ArrowLeft, Settings, Music, BarChart3, Library } from 'lucide-react';
import { Link } from 'react-router-dom';
import MyDJDashboard from './MyDJDashboard';
import MyDJInsights from './MyDJInsights';
import MyDJLibrary from './MyDJLibrary';
import MyDJSettings from './MyDJSettings';

type Tab = 'player' | 'insights' | 'library' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'player', label: 'Player', icon: <Music className="w-5 h-5" /> },
  { id: 'insights', label: 'Insights', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'library', label: 'Library', icon: <Library className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

const MyDJLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>('player');

  const renderPage = () => {
    switch (activeTab) {
      case 'player': return <MyDJDashboard />;
      case 'insights': return <MyDJInsights />;
      case 'library': return <MyDJLibrary />;
      case 'settings': return <MyDJSettings />;
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
            My <span className="text-violet-400">DJ</span>
          </h1>
          <div className="w-8" />
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
                  ? 'text-violet-400'
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

export default MyDJLayout;
