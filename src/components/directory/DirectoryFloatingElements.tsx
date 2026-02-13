import { useMemo, useEffect, useState, useCallback } from 'react';
import glassesWayfarer from '@/assets/floating/glasses-wayfarer.png';
import glassesRoundThick from '@/assets/floating/glasses-round-thick.png';
import glassesClubmaster from '@/assets/floating/glasses-clubmaster.png';
import glassesRoundRed from '@/assets/floating/glasses-round-red.png';
import glassesSmartOutline from '@/assets/floating/glasses-smart-outline.png';
import glassesSmartFilled from '@/assets/floating/glasses-smart-filled.png';
import glassesVrGoggles from '@/assets/floating/glasses-vr-goggles.png';
import glassesVrHeadset from '@/assets/floating/glasses-vr-headset.png';
import iconRocket from '@/assets/floating/icon-rocket.png';
import iconUfo from '@/assets/floating/icon-ufo.png';
import iconExplosion from '@/assets/floating/icon-explosion.png';

const floatingImages = [glassesWayfarer, glassesRoundThick, glassesClubmaster, glassesRoundRed, glassesSmartOutline, glassesSmartFilled, glassesVrGoggles, glassesVrHeadset];
const streakImages = [iconRocket, iconUfo];

interface ElementConfig {
  src: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
}

interface StreakConfig {
  id: number;
  src: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  duration: number;
  alive: boolean;
}

interface ExplosionConfig {
  id: number;
  x: number;
  y: number;
}

const DirectoryFloatingElements = () => {
  const [streaks, setStreaks] = useState<StreakConfig[]>([]);
  const [explosions, setExplosions] = useState<ExplosionConfig[]>([]);
  const [killCount, setKillCount] = useState(0);

  const elements = useMemo<ElementConfig[]>(() => {
    const els: ElementConfig[] = [];
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 49297;
      return x - Math.floor(x);
    };
    for (let i = 0; i < floatingImages.length; i++) {
      els.push({
        src: floatingImages[i],
        x: seededRandom(i * 7 + 1) * 90 + 5,
        y: seededRandom(i * 13 + 3) * 80 + 10,
        size: 32 + seededRandom(i * 17 + 5) * 40,
        opacity: 0.15 + seededRandom(i * 23 + 7) * 0.15,
        duration: 12 + seededRandom(i * 31 + 11) * 50,
        delay: seededRandom(i * 37 + 13) * -40,
        driftX: 10 + seededRandom(i * 41 + 17) * 20,
      });
    }
    return els;
  }, []);

  const spawnStreak = useCallback(() => {
    const src = streakImages[Math.floor(Math.random() * streakImages.length)];
    const pattern = Math.floor(Math.random() * 4);
    let startX: number, startY: number, endX: number, endY: number;

    switch (pattern) {
      case 0: // left to right, slight angle
        startX = -10; startY = 10 + Math.random() * 70;
        endX = 110; endY = startY + (Math.random() * 40 - 20);
        break;
      case 1: // right to left, slight angle
        startX = 110; startY = 10 + Math.random() * 70;
        endX = -10; endY = startY + (Math.random() * 40 - 20);
        break;
      case 2: // diagonal top-left to bottom-right
        startX = -10; startY = -10;
        endX = 80 + Math.random() * 30; endY = 80 + Math.random() * 30;
        break;
      default: // diagonal top-right to bottom-left
        startX = 110; startY = -10;
        endX = -10 + Math.random() * 30; endY = 80 + Math.random() * 30;
        break;
    }

    const streak: StreakConfig = {
      id: Date.now() + Math.random(),
      src,
      startX, startY, endX, endY,
      size: 30 + Math.random() * 20,
      duration: 2 + Math.random() * 2,
      alive: true,
    };
    setStreaks(prev => [...prev, streak]);
    setTimeout(() => {
      setStreaks(prev => prev.filter(s => s.id !== streak.id));
    }, streak.duration * 1000 + 500);
  }, []);

  const handleStreakClick = useCallback((streak: StreakConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const container = (e.currentTarget as HTMLElement).closest('.streak-container');
    const containerRect = container?.getBoundingClientRect() || rect;
    const x = ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100;
    const y = ((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 100;

    setStreaks(prev => prev.filter(s => s.id !== streak.id));
    setKillCount(prev => prev + 1);

    const explosion: ExplosionConfig = { id: Date.now() + Math.random(), x, y };
    setExplosions(prev => [...prev, explosion]);
    setTimeout(() => {
      setExplosions(prev => prev.filter(ex => ex.id !== explosion.id));
    }, 600);
  }, []);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 14000;
      return setTimeout(() => {
        spawnStreak();
        timeoutId = scheduleNext();
      }, delay);
    };
    let timeoutId = setTimeout(() => {
      spawnStreak();
      timeoutId = scheduleNext();
    }, 5000);
    return () => clearTimeout(timeoutId);
  }, [spawnStreak]);

  return (
    <>
      <style>{`
        @keyframes float-drift {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          25% { transform: translate3d(var(--drift-x), -25%, 0) rotate(5deg); }
          50% { transform: translate3d(0, -50%, 0) rotate(0deg); }
          75% { transform: translate3d(calc(var(--drift-x) * -1), -75%, 0) rotate(-5deg); }
          100% { transform: translate3d(0, -100%, 0) rotate(0deg); }
        }
        @keyframes explosion-pop {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(20deg); opacity: 0.8; }
          100% { transform: scale(0) rotate(45deg); opacity: 0; }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none streak-container" style={{ cursor: 'crosshair' }}>
        {/* Slow floating glasses */}
        {elements.map((el, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: el.size,
              height: el.size,
              opacity: el.opacity,
              '--drift-x': `${el.driftX}px`,
              animation: `float-drift ${el.duration}s linear ${el.delay}s infinite`,
              filter: 'brightness(2) invert(1) drop-shadow(0 0 2px rgba(255,255,255,0.3))',
            } as React.CSSProperties}
          >
            <img src={el.src} alt="" className="w-full h-full object-contain" draggable={false} />
          </div>
        ))}

        {/* Streaking rocket/UFO - clickable */}
        {streaks.map(s => {
          const angle = Math.atan2(s.endY - s.startY, s.endX - s.startX) * (180 / Math.PI);
          return (
            <div
              key={s.id}
              className="absolute pointer-events-auto"
              onClick={(e) => handleStreakClick(s, e)}
              style={{
                left: `${s.startX}%`,
                top: `${s.startY}%`,
                width: s.size,
                height: s.size,
                cursor: 'crosshair',
                zIndex: 20,
                filter: 'brightness(2) invert(1) drop-shadow(0 0 4px rgba(255,255,255,0.5))',
                transform: `rotate(${angle - 45}deg)`,
                animation: `streak-path-${s.id} ${s.duration}s ease-in-out forwards`,
              } as React.CSSProperties}
            >
              <img src={s.src} alt="" className="w-full h-full object-contain" draggable={false} />
              <style>{`
                @keyframes streak-path-${s.id} {
                  0% { left: ${s.startX}%; top: ${s.startY}%; opacity: 0; }
                  5% { opacity: 0.6; }
                  90% { opacity: 0.6; }
                  100% { left: ${s.endX}%; top: ${s.endY}%; opacity: 0; }
                }
              `}</style>
            </div>
          );
        })}

        {/* Explosions */}
        {explosions.map(ex => (
          <div
            key={ex.id}
            className="absolute"
            style={{
              left: `${ex.x}%`,
              top: `${ex.y}%`,
              width: 60,
              height: 60,
              marginLeft: -30,
              marginTop: -30,
              zIndex: 30,
              filter: 'brightness(2) invert(1) drop-shadow(0 0 6px rgba(255,255,255,0.7))',
              animation: 'explosion-pop 0.6s ease-out forwards',
            }}
          >
            <img src={iconExplosion} alt="" className="w-full h-full object-contain" draggable={false} />
          </div>
        ))}
      </div>

      {/* Kill counter */}
      {killCount > 0 && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/20 shadow-lg"
          style={{ cursor: 'default' }}
        >
          <img src={iconExplosion} alt="" className="w-5 h-5 invert" draggable={false} />
          <span className="font-bold text-sm">{killCount}</span>
        </div>
      )}
    </>
  );
};

export default DirectoryFloatingElements;
