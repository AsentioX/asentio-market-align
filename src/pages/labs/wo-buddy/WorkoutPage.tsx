import { useState, useEffect, useRef } from 'react';
import { Dumbbell, Wind, Accessibility, Camera, CameraOff, Info, Heart, Check, Share2, Sparkles } from 'lucide-react';
import { calculateScore } from './mockData';
import { shareContent, buildWorkoutShareText } from './shareUtils';
import CameraTrackingView from './CameraTrackingView';

type Mode = 'strength' | 'cardio' | 'bodyweight';

const strengthExercises = ['Bench Press', 'Squats', 'Deadlift', 'Overhead Press', 'Barbell Row', 'Curls'];
const cardioActivities = ['Run', 'Row', 'Bike'];
const bodyweightExercises = ['Push-ups', 'Burpees', 'Squats', 'Pull-ups', 'Sit-ups'];

const modeConfig = {
  strength: { icon: <Dumbbell className="w-5 h-5" />, label: 'Strength', emoji: '🏋️', gradient: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', active: 'from-blue-500/30 to-blue-600/10', color: 'text-blue-400' },
  cardio: { icon: <Wind className="w-5 h-5" />, label: 'Cardio', emoji: '🏃', gradient: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/20', active: 'from-orange-500/30 to-orange-600/10', color: 'text-orange-400' },
  bodyweight: { icon: <Accessibility className="w-5 h-5" />, label: 'Bodyweight', emoji: '💪', gradient: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', active: 'from-purple-500/30 to-purple-600/10', color: 'text-purple-400' },
};

const WorkoutPage = () => {
  const [mode, setMode] = useState<Mode>('strength');
  const [cameraTracking, setCameraTracking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [exercise, setExercise] = useState(strengthExercises[0]);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(135);

  const [cardioActivity, setCardioActivity] = useState(cardioActivities[0]);
  const [distance, setDistance] = useState(5);
  const [time, setTime] = useState(25);

  const [bwExercise, setBwExercise] = useState(bodyweightExercises[0]);
  const [bwReps, setBwReps] = useState(20);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cameraTracking) {
      intervalRef.current = setInterval(() => {
        if (mode === 'strength') setReps(r => r + 1);
        else if (mode === 'bodyweight') setBwReps(r => r + 1);
      }, 800);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [cameraTracking, mode]);

  const [heartRate, setHeartRate] = useState(72);
  useEffect(() => {
    if (cameraTracking) {
      const hr = setInterval(() => setHeartRate(h => Math.min(180, Math.max(100, h + Math.floor(Math.random() * 11) - 5))), 1500);
      return () => clearInterval(hr);
    } else {
      setHeartRate(72);
    }
  }, [cameraTracking]);

  const getIntensity = () => {
    if (heartRate < 110) return { label: 'Light Intensity', color: 'text-green-400', msg: 'Warm up zone — ease into it', bg: 'from-green-500/10 to-green-600/5' };
    if (heartRate < 145) return { label: 'Moderate Intensity', color: 'text-yellow-400', msg: 'Great pace — keep going!', bg: 'from-yellow-500/10 to-yellow-600/5' };
    return { label: 'High Intensity', color: 'text-red-400', msg: 'You\'re pushing hard — stay strong!', bg: 'from-red-500/10 to-red-600/5' };
  };

  const handleSubmit = () => {
    let details: Record<string, number> = {};
    if (mode === 'strength') details = { sets, reps, weight };
    else if (mode === 'cardio') details = { distance, time };
    else details = { reps: bwReps };
    const s = calculateScore(mode, details);
    setScore(s);
    setSubmitted(true);
    setCameraTracking(false);
  };

  const handleReset = () => {
    setSubmitted(false);
    setScore(0);
    setReps(10);
    setBwReps(20);
  };

  if (submitted) {
    const cfg = modeConfig[mode];
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
            <Check className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-sm shadow-lg shadow-amber-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">Workout Complete!</h2>
          <p className="text-white/40 text-sm">Great effort on your {cfg.label.toLowerCase()} session.</p>
        </div>
        <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl p-6 border border-white/[0.08] w-full max-w-xs">
          <p className="text-5xl font-bold text-emerald-400">+{score}</p>
          <p className="text-xs text-white/40 mt-1">points earned</p>
          <div className="mt-4 flex items-start gap-1.5 text-[11px] text-white/30 bg-white/[0.03] rounded-xl p-3">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Score = effort across reps, weight, distance, and time.</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleReset} className="text-sm text-emerald-400 font-medium bg-emerald-500/10 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-colors">
            Log Another Workout
          </button>
          <button
            onClick={() => shareContent(buildWorkoutShareText(
              mode === 'strength' ? exercise : mode === 'cardio' ? cardioActivity : bwExercise,
              score, mode
            ))}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    );
  }

  const intensity = getIntensity();
  const currentScore = calculateScore(mode, mode === 'strength' ? { sets, reps, weight } : mode === 'cardio' ? { distance, time } : { reps: bwReps });

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Log Workout</h2>

      {/* Mode selector — visual cards */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.entries(modeConfig) as [Mode, typeof modeConfig.strength][]).map(([id, cfg]) => (
          <button
            key={id}
            onClick={() => { setMode(id); setCameraTracking(false); }}
            className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl text-xs font-medium transition-all border ${
              mode === id
                ? `bg-gradient-to-b ${cfg.active} ${cfg.border} ${cfg.color} shadow-lg`
                : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.06]'
            }`}
          >
            <span className="text-2xl">{cfg.emoji}</span>
            <span className="flex items-center gap-1">{cfg.icon}{cfg.label}</span>
          </button>
        ))}
      </div>

      {/* Camera tracking toggle */}
      {mode !== 'cardio' && (
        <button
          onClick={() => setCameraTracking(!cameraTracking)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-sm transition-all ${
            cameraTracking
              ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400'
              : 'bg-white/[0.03] border-white/5 text-white/40'
          }`}
        >
          <span className="flex items-center gap-2">
            {cameraTracking ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            Camera Tracking (Demo)
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${cameraTracking ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
            {cameraTracking ? 'ON' : 'OFF'}
          </span>
        </button>
      )}

      {/* Live feedback */}
      {cameraTracking && (
        <div className={`bg-gradient-to-r ${intensity.bg} rounded-xl p-4 border border-white/[0.08] space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase tracking-wider">Live Feedback</span>
            <span className="flex items-center gap-1.5 text-xs bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
              <Heart className="w-3 h-3 text-red-400 animate-pulse" />
              <span className="font-mono text-red-400 font-bold">{heartRate} bpm</span>
            </span>
          </div>
          <p className={`text-sm font-semibold ${intensity.color}`}>{intensity.label}</p>
          <p className="text-xs text-white/40">{intensity.msg}</p>
        </div>
      )}

      {/* Inputs */}
      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08] space-y-4">
        {mode === 'strength' && (
          <>
            <InputSelect label="Exercise" value={exercise} options={strengthExercises} onChange={setExercise} />
            <div className="grid grid-cols-3 gap-3">
              <NumberInput label="Sets" value={sets} onChange={setSets} />
              <NumberInput label="Reps" value={reps} onChange={setReps} />
              <NumberInput label="Weight (lbs)" value={weight} onChange={setWeight} step={5} />
            </div>
            <div className="text-xs text-white/30 bg-white/[0.03] rounded-lg px-3 py-2">
              📊 Volume: <span className="text-white/60 font-medium">{(sets * reps * weight).toLocaleString()} lbs</span>
            </div>
          </>
        )}
        {mode === 'cardio' && (
          <>
            <InputSelect label="Activity" value={cardioActivity} options={cardioActivities} onChange={setCardioActivity} />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Distance (km)" value={distance} onChange={setDistance} step={0.5} />
              <NumberInput label="Time (min)" value={time} onChange={setTime} />
            </div>
            <div className="text-xs text-white/30 bg-white/[0.03] rounded-lg px-3 py-2">
              📊 Pace: <span className="text-white/60 font-medium">{distance > 0 ? (time / distance).toFixed(1) : '0'} min/km</span>
            </div>
          </>
        )}
        {mode === 'bodyweight' && (
          <>
            <InputSelect label="Exercise" value={bwExercise} options={bodyweightExercises} onChange={setBwExercise} />
            <NumberInput label="Total Reps" value={bwReps} onChange={setBwReps} />
          </>
        )}
      </div>

      {/* Score preview */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-2xl p-4 border border-emerald-500/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Estimated Score</span>
          <p className="text-xs text-white/50 mt-0.5">Based on your current inputs</p>
        </div>
        <span className="text-2xl font-bold text-emerald-400">+{currentScore}</span>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.15),transparent)]" />
        <span className="relative">Complete Workout</span>
      </button>
    </div>
  );
};

function NumberInput({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">{label}</label>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(0, value - step))} className="w-8 h-8 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-lg transition-colors">−</button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-center text-sm font-medium text-white focus:outline-none focus:border-emerald-500/30"
        />
        <button onClick={() => onChange(value + step)} className="w-8 h-8 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-lg transition-colors">+</button>
      </div>
    </div>
  );
}

function InputSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 appearance-none"
      >
        {options.map(o => <option key={o} value={o} className="bg-[#1a1a2e]">{o}</option>)}
      </select>
    </div>
  );
}

export default WorkoutPage;
