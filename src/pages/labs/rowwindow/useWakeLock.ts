import { useEffect, useRef } from 'react';

type WakeLockSentinelLike = {
  release: () => Promise<void>;
  addEventListener: (type: string, cb: () => void) => void;
  released?: boolean;
};

/**
 * Keeps the screen awake while `active` is true. Mobile browsers throttle then
 * freeze timers, geolocation watches, and devicemotion once the screen dims —
 * which makes an in-progress row look like it "stopped by itself".
 * Re-acquires the lock when the tab becomes visible again (the OS drops it on blur).
 */
export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    if (!active || typeof navigator === 'undefined') return;
    const wl = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinelLike> } }).wakeLock;
    if (!wl) return;

    let cancelled = false;

    const acquire = async () => {
      if (cancelled || sentinelRef.current) return;
      try {
        const sentinel = await wl.request('screen');
        if (cancelled) { sentinel.release().catch(() => {}); return; }
        sentinelRef.current = sentinel;
        sentinel.addEventListener('release', () => { sentinelRef.current = null; });
      } catch { /* user agent refused — non-fatal */ }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      sentinelRef.current?.release().catch(() => {});
      sentinelRef.current = null;
    };
  }, [active]);
}
