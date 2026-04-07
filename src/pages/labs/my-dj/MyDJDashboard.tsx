import { useState } from 'react';
import { Heart, Activity, Brain, Wind, Zap, SkipForward, ThumbsUp, Play, Pause, ChevronDown, Music2, MapPin } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useMyDJ } from './useMyDJ';
import { MODE_META, PHYSIO_LABELS, UserMode } from './stateEngine';

const MyDJDashboard = () => {
  const {
    mode, setMode, intensity, setIntensity,
    isPlaying, startSession, stopSession,
    bio, state, musicParams, nowPlaying,
    stats, skip, like, timeOfDay,
  } = useMyDJ();

  const [showModeSelector, setShowModeSelector] = useState(false);
  const meta = MODE_META[mode];

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      {/* Mode Selector */}
      <div className="relative">
        <button
          onClick={() => setShowModeSelector(!showModeSelector)}
          className={`w-full rounded-2xl p-5 bg-gradient-to-br ${meta.color} text-white relative overflow-hidden transition-all`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Current Mode</p>
              <h2 className="text-2xl font-bold mt-1">{meta.emoji} {meta.label}</h2>
              <p className="text-sm text-white/80 mt-1">{meta.description}</p>
            </div>
            <ChevronDown className={`w-5 h-5 text-white/60 transition-transform ${showModeSelector ? 'rotate-180' : ''}`} />
          </div>
          {/* Time-of-day + active location */}
          <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
            <span>
              {timeOfDay === 'morning' && '☀️ Good morning'}
              {timeOfDay === 'afternoon' && '🌤️ Good afternoon'}
              {timeOfDay === 'evening' && '🌆 Good evening'}
              {timeOfDay === 'night' && '🌙 Good night'}
            </span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400/80">Kitchen</span>
              <span className="text-white/30">· Salsa</span>
            </span>
          </div>
        </button>

        {showModeSelector && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e] border border-white/10 rounded-2xl p-3 z-40 space-y-1.5 shadow-2xl">
            {(Object.keys(MODE_META) as UserMode[]).map((m) => {
              const mm = MODE_META[m];
              return (
                <button
                  key={m}
                  onClick={() => { setMode(m); setShowModeSelector(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    mode === m ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl">{mm.emoji}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{mm.label}</p>
                    <p className="text-xs text-white/50">{mm.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Biometrics */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Heart, label: 'HR', value: `${bio.heartRate}`, unit: 'bpm', color: 'text-red-400' },
          { icon: Activity, label: 'HRV', value: `${bio.hrv}`, unit: 'ms', color: 'text-blue-400' },
          { icon: Brain, label: 'Stress', value: `${bio.stress}`, unit: '%', color: bio.stress > 60 ? 'text-orange-400' : 'text-green-400' },
          { icon: Wind, label: 'Cadence', value: `${bio.cadence}`, unit: 'spm', color: 'text-cyan-400' },
        ].map(({ icon: Icon, label, value, unit, color }) => (
          <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-white/40">{unit}</p>
          </div>
        ))}
      </div>

      {/* State Indicator */}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50 uppercase tracking-wider">State Alignment</span>
          <span className="text-xs text-white/40">{PHYSIO_LABELS[state.current]} → {PHYSIO_LABELS[state.target]}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${meta.color} transition-all duration-1000`}
            style={{ width: `${state.alignment * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-white/30">Current</span>
          <span className="text-[10px] text-white/30 capitalize">{state.strategy}</span>
          <span className="text-[10px] text-white/30">Target</span>
        </div>
      </div>

      {/* Now Playing */}
      {nowPlaying && isPlaying ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center`}>
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{nowPlaying.title}</p>
              <p className="text-xs text-white/50 truncate">{nowPlaying.artist} • {nowPlaying.genre}</p>
              <p className="text-[10px] text-emerald-400/60 flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5" /> Resumed in Kitchen
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${meta.color} transition-all`}
                style={{ width: `${(nowPlaying.elapsed / nowPlaying.duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/30">{formatTime(nowPlaying.elapsed)}</span>
              <span className="text-[10px] text-white/30">{formatTime(nowPlaying.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button onClick={like} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={stopSession}
              className={`w-14 h-14 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}
            >
              <Pause className="w-6 h-6 text-white" />
            </button>
            <button onClick={skip} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Adaptive Music Params */}
          <div className="mt-4 grid grid-cols-5 gap-1.5">
            {[
              { label: 'BPM', value: musicParams.bpm },
              { label: 'Energy', value: musicParams.energy },
              { label: 'Rhythm', value: musicParams.rhythmDensity },
              { label: 'Vocal', value: musicParams.vocalPresence },
              { label: 'Tension', value: musicParams.harmonicTension },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="h-8 bg-white/5 rounded-md flex items-end justify-center overflow-hidden p-0.5">
                  <div
                    className={`w-full rounded-sm bg-gradient-to-t ${meta.color} transition-all duration-700`}
                    style={{ height: `${Math.max(4, label === 'BPM' ? (value / 200) * 100 : value)}%` }}
                  />
                </div>
                <p className="text-[9px] text-white/40 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={startSession}
          className={`w-full rounded-2xl p-6 bg-gradient-to-br ${meta.color} text-white font-semibold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]`}
        >
          <Play className="w-6 h-6" />
          Start Session
        </button>
      )}

      {/* Intensity Slider */}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/50 uppercase tracking-wider">Intensity</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-sm font-semibold text-white">{intensity}%</span>
          </div>
        </div>
        <Slider
          value={[intensity]}
          onValueChange={([v]) => setIntensity(v)}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-white/30">Light</span>
          <span className="text-[10px] text-white/30">Aggressive</span>
        </div>
      </div>

      {/* Session Stats (when playing) */}
      {isPlaying && stats.durationSec > 0 && (
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Session</p>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-white">{formatTime(stats.durationSec)}</p>
              <p className="text-[10px] text-white/40">Duration</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{stats.tracksPlayed}</p>
              <p className="text-[10px] text-white/40">Tracks</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-400">{stats.likes}</p>
              <p className="text-[10px] text-white/40">Likes</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{Math.round(stats.avgAlignment * 100)}%</p>
              <p className="text-[10px] text-white/40">Aligned</p>
            </div>
          </div>

          {/* Mini alignment chart */}
          {stats.alignmentHistory.length > 5 && (
            <div className="mt-3 h-12 flex items-end gap-px">
              {stats.alignmentHistory.slice(-40).map((pt, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm bg-gradient-to-t ${meta.color} opacity-70 transition-all`}
                  style={{ height: `${pt.v * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyDJDashboard;
