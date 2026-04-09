import { useState } from 'react';
import { ArrowLeft, Waves, BarChart3, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import MyDJDashboard from './MyDJDashboard';
import MyDJInsights from './MyDJInsights';
import MyDJSettings from './MyDJSettings';

type Tab = 'sense' | 'insights' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'sense', label: 'Sense', icon: <Waves className="w-5 h-5" /> },
  { id: 'insights', label: 'Insights', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

const MyDJLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>('sense');

  const renderPage = () => {
    switch (activeTab) {
      case 'sense': return <MyDJDashboard />;
      case 'insights': return <MyDJInsights />;
      case 'settings': return <MyDJSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-[#08080d] text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-[#08080d]/80 backdrop-blur-2xl border-b border-white/[0.03]">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/labs" className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider">Labs</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-white/30 uppercase tracking-widest">Adaptive Sound</span>
          </div>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-24">
        {renderPage()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a10]/95 backdrop-blur-2xl border-t border-white/[0.03]">
        <div className="max-w-lg mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                activeTab === tab.id
                  ? 'text-white/80'
                  : 'text-white/20 hover:text-white/40'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-medium tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MyDJLayout;
