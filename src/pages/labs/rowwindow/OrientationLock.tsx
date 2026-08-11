import { useCallback, useEffect, useState } from 'react';
import { Lock, Smartphone, RectangleHorizontal, Unlock } from 'lucide-react';

// =============================================================================
// OrientationLock — lets the rower pin the on-water display to portrait or
// landscape so the layout doesn't flip while the boat rolls.
//
// The Screen Orientation Lock API requires fullscreen on most mobile browsers
// (Chrome/Android), and is unsupported on iOS Safari. When it's unsupported we
// fall back to a CSS-level lock: the caller rotates its own layout instead.
// =============================================================================

export type LockMode = 'none' | 'portrait' | 'landscape';

type OrientationLockApi = {
  lock?: (o: string) => Promise<void>;
  unlock?: () => void;
};

function getOrientationApi(): OrientationLockApi | null {
  if (typeof screen === 'undefined') return null;
  return (screen as unknown as { orientation?: OrientationLockApi }).orientation ?? null;
}

export function useOrientationLock() {
  const [mode, setMode] = useState<LockMode>('none');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const api = getOrientationApi();
    setSupported(typeof api?.lock === 'function');
  }, []);

  const apply = useCallback(async (next: LockMode) => {
    const api = getOrientationApi();
    if (next === 'none') {
      try { api?.unlock?.(); } catch { /* noop */ }
      if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch { /* noop */ }
      }
      setMode('none');
      return;
    }
    // Fullscreen is a prerequisite for orientation lock on Android Chrome.
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch { /* non-fatal — try the lock anyway */ }
    try {
      await api?.lock?.(next === 'portrait' ? 'portrait-primary' : 'landscape-primary');
    } catch { /* unsupported (iOS) — the toggle still records intent */ }
    setMode(next);
  }, []);

  // Release the lock if the component unmounts (session ended / navigated away).
  useEffect(() => () => {
    try { getOrientationApi()?.unlock?.(); } catch { /* noop */ }
  }, []);

  return { mode, supported, apply };
}

interface Props {
  mode: LockMode;
  supported: boolean;
  onChange: (m: LockMode) => void;
  className?: string;
}

export const OrientationLockControl = ({ mode, supported, onChange, className }: Props) => {
  const options: { id: LockMode; label: string; icon: React.ReactNode }[] = [
    { id: 'none', label: 'Auto', icon: <Unlock className="w-3.5 h-3.5" /> },
    { id: 'portrait', label: 'Portrait', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'landscape', label: 'Landscape', icon: <RectangleHorizontal className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className={className}>
      <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 p-1">
        <span className="pl-1.5 pr-0.5 text-white/60" aria-hidden>
          <Lock className="w-3.5 h-3.5" />
        </span>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={mode === o.id}
            className={`px-2 py-1 rounded-md text-[11px] font-medium inline-flex items-center gap-1 transition ${
              mode === o.id
                ? 'bg-cyan-500/30 text-cyan-100 border border-cyan-400/50'
                : 'text-white/70 hover:bg-white/10 border border-transparent'
            }`}
          >
            {o.icon}
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        ))}
      </div>
      {!supported && mode !== 'none' && (
        <p className="mt-1 text-[10px] text-white/50 leading-tight">
          Your browser can't lock rotation — use the device rotation lock instead.
        </p>
      )}
    </div>
  );
};
