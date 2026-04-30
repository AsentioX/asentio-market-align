import { useState } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import MyDJDashboard from './MyDJDashboard';
import MyDJSettings from './MyDJSettings';
import IntentSelection from './IntentSelection';
import { useMyDJ } from './useMyDJ';
import { IntentDef } from './intentData';

const MyDJLayout = () => {
  const dj = useMyDJ();
  const [activeIntent, setActiveIntent] = useState<{ primary: IntentDef; secondary?: IntentDef } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showIntentPicker, setShowIntentPicker] = useState(false);

  const handleSelectIntent = (primary: IntentDef, secondary?: IntentDef) => {
    dj.setMode(primary.engineMode);
    dj.setIntensity(secondary
      ? Math.round((primary.intensityHint + secondary.intensityHint) / 2)
      : primary.intensityHint
    );
    // Primary flavor wins; secondary contributes extra genres so blends feel distinct
    const mergedGenres = Array.from(new Set([
      ...(primary.flavor.genres ?? []),
      ...(secondary?.flavor.genres ?? []),
    ]));
    dj.setIntentFlavor({
      vocals: primary.flavor.vocals,
      genres: mergedGenres.length ? mergedGenres : undefined,
      bpmBias: primary.flavor.bpmBias,
      energyBias: primary.flavor.energyBias,
    });
    setActiveIntent({ primary, secondary });
    if (!dj.isPlaying) {
      setTimeout(() => dj.startSession(), 400);
    }
    setShowIntentPicker(false);
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-[#08080d] text-white flex flex-col">
        <header className="sticky top-0 z-50 bg-[#08080d]/80 backdrop-blur-2xl border-b border-white/[0.03]">
          <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
            <button
              onClick={() => setShowSettings(false)}
              className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider">Back</span>
            </button>
            <span className="text-[10px] text-white/30 uppercase tracking-widest">Settings</span>
            <div className="w-12" />
          </div>
        </header>
        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
          <MyDJSettings />
        </main>
      </div>
    );
  }

  if (showIntentPicker) {
    return (
      <div className="min-h-screen bg-[#08080d] text-white flex flex-col">
        <header className="sticky top-0 z-50 bg-[#08080d]/80 backdrop-blur-2xl border-b border-white/[0.03]">
          <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
            <button
              onClick={() => setShowIntentPicker(false)}
              className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider">Back</span>
            </button>
            <span className="text-[10px] text-white/30 uppercase tracking-widest">Set Intent</span>
            <div className="w-12" />
          </div>
        </header>
        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
          <IntentSelection
            timeOfDay={dj.timeOfDay}
            physioState={dj.state.current}
            sessionDuration={dj.stats.durationSec}
            onSelectIntent={handleSelectIntent}
            currentIntentId={activeIntent?.primary.id}
          />
        </main>
      </div>
    );
  }

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
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
        <MyDJDashboard
          djState={dj}
          activeIntent={activeIntent}
          onChangeIntent={() => setShowIntentPicker(true)}
        />
      </main>
    </div>
  );
};

export default MyDJLayout;
