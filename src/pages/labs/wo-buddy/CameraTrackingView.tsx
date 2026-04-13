import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Camera, Eye, Zap, Activity } from 'lucide-react';
import { usePoseDetection, PoseDetectionResult } from './usePoseDetection';
import { createRepCounter } from './repCounter';

interface CameraTrackingViewProps {
  exercise: string;
  repCount: number;
  onRepDetected: () => void;
  heartRate: number;
  intensity: { label: string; color: string; msg: string };
}

const CameraTrackingView = ({ exercise, repCount, onRepDetected, heartRate, intensity }: CameraTrackingViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [repFlash, setRepFlash] = useState(false);
  const [phase, setPhase] = useState<'up' | 'down' | 'unknown'>('unknown');
  const [formScore, setFormScore] = useState('Detecting...');
  const [confidence, setConfidence] = useState(0);
  const prevRepCountRef = useRef(0);

  // Create rep counter, reset when exercise changes
  const repCounter = useMemo(() => createRepCounter(exercise), [exercise]);

  const handlePoseResult = useCallback((result: PoseDetectionResult) => {
    const state = repCounter.update(result.landmarks);
    setPhase(state.phase);
    setFormScore(state.formScore);

    // Calculate confidence from landmark visibility
    const avgVisibility = result.landmarks.reduce((sum, lm) => sum + (lm.visibility ?? 0), 0) / result.landmarks.length;
    setConfidence(Math.round(avgVisibility * 100));

    // Detect new rep
    if (state.repCount > prevRepCountRef.current) {
      prevRepCountRef.current = state.repCount;
      onRepDetected();
      setRepFlash(true);
      setTimeout(() => setRepFlash(false), 400);
    }
  }, [repCounter, onRepDetected]);

  // Reset counter when exercise changes
  useEffect(() => {
    prevRepCountRef.current = 0;
    repCounter.reset();
  }, [exercise, repCounter]);

  const { loading, error, cameraActive } = usePoseDetection({
    videoRef,
    canvasRef,
    enabled: true,
    onResult: handlePoseResult,
  });

  const detectedLabel = repCounter.getLabel();

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-black">
      {/* Camera view */}
      <div className="relative aspect-[4/3] bg-black overflow-hidden">
        {/* Video feed */}
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="text-center space-y-2">
              <Camera className="w-10 h-10 text-white/20 mx-auto" />
              <p className="text-xs text-white/30">
                {loading ? 'Loading pose model...' : error ?? 'Initializing camera...'}
              </p>
            </div>
          </div>
        )}

        {/* Hidden video for non-camera case */}
        {!cameraActive && <video ref={videoRef} className="hidden" autoPlay playsInline muted />}

        {/* Skeleton overlay canvas (mirrored to match video) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
        />

        {/* Rep flash overlay */}
        {repFlash && (
          <div className="absolute inset-0 bg-emerald-400/10 pointer-events-none animate-pulse" />
        )}

        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between">
          {/* Detection label */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 border border-emerald-500/20">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-medium">Detected</span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">{detectedLabel}</p>
            <p className="text-[10px] text-white/40">{confidence}% visibility</p>
          </div>

          {/* Heart rate */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 border border-red-500/20">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-red-400 animate-pulse" />
              <span className="font-mono text-lg font-bold text-red-400">{heartRate}</span>
              <span className="text-[10px] text-red-400/60">bpm</span>
            </div>
            <p className={`text-[10px] mt-0.5 font-medium ${intensity.color}`}>{intensity.label}</p>
          </div>
        </div>

        {/* Center rep counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className={`bg-black/70 backdrop-blur-xl rounded-2xl px-6 py-3 border transition-all ${
            repFlash ? 'border-emerald-400/60 shadow-lg shadow-emerald-500/30 scale-110' : 'border-white/10'
          }`}>
            <div className="text-center">
              <p className="text-4xl font-black text-white tabular-nums">{repCount}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">reps</p>
            </div>
          </div>
        </div>

        {/* Phase indicator */}
        <div className="absolute bottom-4 right-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
            phase === 'down'
              ? 'bg-amber-500/20 border border-amber-500/30'
              : phase === 'up'
              ? 'bg-emerald-500/20 border border-emerald-500/30'
              : 'bg-white/10 border border-white/10'
          }`}>
            {phase === 'down' ? '⬇️' : phase === 'up' ? '⬆️' : '👁️'}
          </div>
        </div>

        {/* Form feedback */}
        <div className="absolute bottom-4 left-3">
          <div className={`bg-black/60 backdrop-blur-md rounded-lg px-2.5 py-1.5 border text-[10px] font-medium ${
            formScore === 'Excellent' ? 'border-emerald-500/20 text-emerald-400' :
            formScore === 'Great' ? 'border-blue-500/20 text-blue-400' :
            formScore === 'Adjust depth' ? 'border-amber-500/20 text-amber-400' :
            'border-white/10 text-white/60'
          }`}>
            <Zap className="w-3 h-3 inline mr-1" />
            Form: {formScore}
          </div>
        </div>

        {/* Recording indicator */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 bg-red-500/20 backdrop-blur-md rounded-full px-3 py-1 border border-red-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-400 font-medium uppercase tracking-wider">
              {loading ? 'Loading' : 'Tracking'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-3 bg-white/[0.03] border-t border-white/[0.06]">
        <p className="text-xs text-white/50 text-center">{intensity.msg}</p>
      </div>
    </div>
  );
};

export default CameraTrackingView;
