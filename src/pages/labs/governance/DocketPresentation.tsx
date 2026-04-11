import { useState, useEffect, useCallback, useRef } from 'react';
import { useDocket, usePolicies, Policy } from '@/hooks/useGovernance';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Timer, Maximize2 } from 'lucide-react';

const DocketPresentation = ({ onClose }: { onClose: () => void }) => {
  const { docketItems } = useDocket();
  const { data: policies = [] } = usePolicies();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerDuration, setTimerDuration] = useState(120); // seconds
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [editingTimer, setEditingTimer] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const docketPolicies: Policy[] = docketItems
    .map(d => policies.find(p => p.id === d.policy_id))
    .filter(Boolean) as Policy[];

  const current = docketPolicies[currentIndex];

  useEffect(() => {
    if (timerRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(t => {
          if (t <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, timeRemaining]);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimeRemaining(timerDuration);
  }, [timerDuration]);

  const goNext = () => {
    if (currentIndex < docketPolicies.length - 1) {
      setCurrentIndex(i => i + 1);
      resetTimer();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      resetTimer();
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') { e.preventDefault(); setTimerRunning(r => !r); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const pct = timerDuration > 0 ? ((timerDuration - timeRemaining) / timerDuration) * 100 : 0;

  if (docketPolicies.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">No policies on the docket</p>
          <button onClick={onClose} className="text-sm bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30">Close</button>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-500',
    commenting: 'bg-blue-500',
    voting: 'bg-indigo-500',
    passed: 'bg-emerald-500',
    archived: 'bg-red-500',
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 text-white/60 text-sm">
          <span>{currentIndex + 1} / {docketPolicies.length}</span>
        </div>

        {/* Timer controls */}
        <div className="flex items-center gap-3">
          {editingTimer ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={60}
                defaultValue={timerDuration / 60}
                autoFocus
                className="w-16 bg-white/10 text-white text-center rounded px-2 py-1 text-sm"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = parseInt((e.target as HTMLInputElement).value) || 2;
                    setTimerDuration(val * 60);
                    setTimeRemaining(val * 60);
                    setEditingTimer(false);
                  }
                }}
                onBlur={e => {
                  const val = parseInt(e.target.value) || 2;
                  setTimerDuration(val * 60);
                  setTimeRemaining(val * 60);
                  setEditingTimer(false);
                }}
              />
              <span className="text-white/40 text-xs">min</span>
            </div>
          ) : (
            <button onClick={() => setEditingTimer(true)} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm">
              <Timer className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </button>
          )}
          <button onClick={() => setTimerRunning(r => !r)} className={`w-8 h-8 rounded-full flex items-center justify-center ${timerRunning ? 'bg-amber-500' : 'bg-teal-500'} text-white`}>
            {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button onClick={resetTimer} className="text-white/40 hover:text-white">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-8">
        <button onClick={goPrev} disabled={currentIndex === 0} className="text-white/30 hover:text-white disabled:opacity-10 p-4">
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div className="flex-1 max-w-4xl mx-8">
          {current && (
            <div className="text-white space-y-8">
              <div className="flex items-center gap-3">
                <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full text-white ${statusColor[current.status] ?? 'bg-gray-500'}`}>
                  {current.status}
                </span>
                {current.category && (
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full">{current.category}</span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">{current.title}</h1>
              <p className="text-xl text-white/70 leading-relaxed">{current.summary}</p>
              {current.context_snippet && (
                <blockquote className="border-l-4 border-teal-500 pl-6 text-white/50 italic text-lg">
                  {current.context_snippet}
                </blockquote>
              )}
            </div>
          )}
        </div>

        <button onClick={goNext} disabled={currentIndex === docketPolicies.length - 1} className="text-white/30 hover:text-white disabled:opacity-10 p-4">
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Bottom dots */}
      <div className="flex items-center justify-center gap-2 py-6">
        {docketPolicies.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentIndex(i); resetTimer(); }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIndex ? 'bg-teal-500 scale-125' : 'bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>

      {timeRemaining === 0 && (
        <div className="absolute inset-0 bg-red-900/20 pointer-events-none animate-pulse" />
      )}
    </div>
  );
};

export default DocketPresentation;
