import { useMemo } from 'react';
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

const images = [glassesWayfarer, glassesRoundThick, glassesClubmaster, glassesRoundRed, glassesSmartOutline, glassesSmartFilled, glassesVrGoggles, glassesVrHeadset, iconRocket, iconUfo];

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

const DirectoryFloatingElements = () => {
  const elements = useMemo<ElementConfig[]>(() => {
    const els: ElementConfig[] = [];
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 49297;
      return x - Math.floor(x);
    };
    for (let i = 0; i < images.length; i++) {
      els.push({
        src: images[i],
        x: seededRandom(i * 7 + 1) * 90 + 5,
        y: seededRandom(i * 13 + 3) * 80 + 10,
        size: 32 + seededRandom(i * 17 + 5) * 40,
        opacity: 0.15 + seededRandom(i * 23 + 7) * 0.15,
        duration: 25 + seededRandom(i * 31 + 11) * 35,
        delay: seededRandom(i * 37 + 13) * -40,
        driftX: 10 + seededRandom(i * 41 + 17) * 20,
      });
    }
    return els;
  }, []);

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
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      </div>
    </>
  );
};

export default DirectoryFloatingElements;
