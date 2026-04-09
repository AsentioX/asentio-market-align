import { useState } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import MyDJDashboard from './MyDJDashboard';
import MyDJSettings from './MyDJSettings';
import IntentSelection from './IntentSelection';
import { useMyDJ } from './useMyDJ';
import { IntentDef } from './intentData';

type View = 'intent' | 'sense' | 'settings';

const MyDJLayout = () => {
  const [view, setView] = useState<View>('intent');
  const dj = useMyDJ();
  const [activeIntent, setActiveIntent] = useState<{ primary: IntentDef; secondary?: IntentDef } | null>(null);

  const handleSelectIntent = (primary: IntentDef, secondary?: IntentDef) => {
    dj.setMode(primary.engineMode);
    dj.setIntensity(secondary
      ? Math.round((primary.intensityHint + secondary.intensityHint) / 2)
      : primary.intensityHint
    );
    setActiveIntent({ primary, secondary });
    if (!dj.isPlaying) {
      setTimeout(() => dj.startSession(), 400);
    }
    setView('sense');
  };

  const openIntentView = () => setView('intent');

  const renderPage = () => {
    switch (view) {
      case 'intent':
        return (
          <IntentSelection
            timeOfDay={dj.timeOfDay}
            physioState={dj.state.current}
            sessionDuration={dj.stats.durationSec}
            onSelectIntent={handleSelectIntent}
            currentIntentId={activeIntent?.primary.id}
          />
        );
      case 'sense':
        return <MyDJDashboard djState={dj} activeIntent={activeIntent} onChangeIntent={openIntentView} />;
      case 'settings':
        return <MyDJSettings />;
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
          <button
            onClick={() => setView(view === 'settings' ? (activeIntent ? 'sense' : 'intent') : 'settings')}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              view === 'settings' ? 'text-white/70 bg-white/[0.08]' : 'text-white/25 hover:text-white/50'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
        {renderPage()}
      </main>
    </div>
  );
};

export default MyDJLayout;
