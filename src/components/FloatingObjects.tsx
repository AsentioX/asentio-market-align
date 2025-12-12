import { useEffect, useState, useCallback } from 'react';

interface FloatingObject {
  id: number;
  type: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  size: number;
  rotation: number;
}

const icons: Record<string, JSX.Element> = {
  astronaut: (
    <svg viewBox="0 0 64 64" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      {/* Helmet */}
      <circle cx="32" cy="14" r="10" fill="none" strokeWidth="2" />
      <ellipse cx="32" cy="14" rx="6" ry="5" fill="currentColor" />
      {/* Body/Torso */}
      <path d="M24 24 L24 38 L40 38 L40 24 Q40 20 32 20 Q24 20 24 24" fill="currentColor" />
      {/* Backpack */}
      <rect x="40" y="24" width="5" height="10" rx="1" fill="currentColor" />
      {/* Left arm */}
      <path d="M24 26 L16 30 L14 38" fill="none" strokeWidth="3" />
      <circle cx="14" cy="40" r="3" fill="currentColor" />
      {/* Right arm */}
      <path d="M40 26 L48 22 L52 26" fill="none" strokeWidth="3" />
      <circle cx="52" cy="28" r="3" fill="currentColor" />
      {/* Left leg */}
      <path d="M28 38 L26 50 L22 54" fill="none" strokeWidth="3" />
      <ellipse cx="20" cy="56" rx="4" ry="2" fill="currentColor" />
      {/* Right leg */}
      <path d="M36 38 L38 50 L42 54" fill="none" strokeWidth="3" />
      <ellipse cx="44" cy="56" rx="4" ry="2" fill="currentColor" />
    </svg>
  ),
  bracketTL: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 40 L8 8 L40 8" />
    </svg>
  ),
  bracketTR: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 8 L56 8 L56 40" />
    </svg>
  ),
  bracketBL: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 24 L8 56 L40 56" />
    </svg>
  ),
  bracketBR: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 56 L56 56 L56 24" />
    </svg>
  ),
  square: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="12" y="12" width="40" height="40" />
    </svg>
  ),
  diamond: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 8 L56 32 L32 56 L8 32 Z" />
    </svg>
  ),
  satellite: (
    <svg viewBox="0 0 64 64" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="24" y="24" width="16" height="16" rx="2" />
      <rect x="6" y="28" width="14" height="8" />
      <rect x="44" y="28" width="14" height="8" />
      <circle cx="32" cy="12" r="4" />
      <line x1="32" y1="16" x2="32" y2="24" strokeWidth="2" />
    </svg>
  ),
  shuttle: (
    <svg viewBox="0 0 64 64" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Main body outline */}
      <path d="M32 4 Q28 4 26 8 L24 16 L24 40 L20 44 L20 52 L26 48 L26 54 L30 58 L30 62 L32 64 L34 62 L34 58 L38 54 L38 48 L44 52 L44 44 L40 40 L40 16 L38 8 Q36 4 32 4 Z" fill="none" strokeWidth="2" />
      {/* Wings */}
      <path d="M24 28 L8 44 L8 52 L24 40" fill="currentColor" />
      <path d="M40 28 L56 44 L56 52 L40 40" fill="currentColor" />
      {/* Cockpit window */}
      <path d="M29 12 L32 8 L35 12 L35 18 L29 18 Z" fill="currentColor" />
      {/* Center tail fin */}
      <path d="M30 54 L32 48 L34 54" fill="none" strokeWidth="2" />
    </svg>
  ),
  circle: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="32" r="20" />
    </svg>
  ),
  dots: (
    <svg viewBox="0 0 64 64" fill="currentColor">
      <circle cx="16" cy="32" r="4" />
      <circle cx="32" cy="32" r="4" />
      <circle cx="48" cy="32" r="4" />
    </svg>
  ),
};

const objectTypes = ['astronaut', 'bracketTL', 'bracketTR', 'bracketBL', 'bracketBR', 'square', 'diamond', 'satellite', 'shuttle', 'circle', 'dots'];

const getRandomEdgePosition = (side: 'left' | 'right' | 'top' | 'bottom') => {
  switch (side) {
    case 'left':
      return { x: -10, y: Math.random() * 100 };
    case 'right':
      return { x: 110, y: Math.random() * 100 };
    case 'top':
      return { x: Math.random() * 100, y: -10 };
    case 'bottom':
      return { x: Math.random() * 100, y: 110 };
  }
};

const sides: ('left' | 'right' | 'top' | 'bottom')[] = ['left', 'right', 'top', 'bottom'];

const getOppositeSide = (side: 'left' | 'right' | 'top' | 'bottom') => {
  const opposites = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' } as const;
  return opposites[side];
};

const MAX_OBJECTS = 3;

const FloatingObjects = () => {
  const [objects, setObjects] = useState<FloatingObject[]>([]);
  const [idCounter, setIdCounter] = useState(0);

  const createObject = useCallback((specificType?: string, bypassLimit = false) => {
    setObjects(prev => {
      // Don't add if we're at max capacity (unless user initiated)
      if (!bypassLimit && prev.length >= MAX_OBJECTS) return prev;
      
      const type = specificType || objectTypes[Math.floor(Math.random() * objectTypes.length)];
      const startSide = sides[Math.floor(Math.random() * sides.length)];
      const endSide = getOppositeSide(startSide);
      const start = getRandomEdgePosition(startSide);
      const end = getRandomEdgePosition(endSide);

      const newObject: FloatingObject = {
        id: Date.now() + Math.random(),
        type,
        startX: start.x,
        startY: start.y,
        endX: end.x,
        endY: end.y,
        duration: 15 + Math.random() * 20, // 15-35 seconds
        size: 32 + Math.random() * 40, // 32-72px
        rotation: Math.random() * 30 - 15, // subtle rotation -15 to 15 degrees
      };

      // Schedule removal after animation completes
      setTimeout(() => {
        setObjects(current => current.filter(obj => obj.id !== newObject.id));
      }, newObject.duration * 1000);

      return [...prev, newObject];
    });
    
    setIdCounter(prev => prev + 1);
  }, []);

  // Handle keyboard input for spawning specific objects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const keyNumber = parseInt(e.key);
      if (keyNumber >= 1 && keyNumber <= 8) {
        createObject(objectTypes[keyNumber - 1], true); // bypass limit for user-initiated spawns
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createObject]);

  // Random interval spawning
  useEffect(() => {
    const scheduleNext = () => {
      // Random interval between 3-12 seconds
      const nextInterval = 3000 + Math.random() * 9000;
      
      return setTimeout(() => {
        createObject();
        timeoutId = scheduleNext();
      }, nextInterval);
    };

    // Initial spawn after 2 seconds
    let timeoutId = setTimeout(() => {
      createObject();
      timeoutId = scheduleNext();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [createObject]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {objects.map(obj => (
        <div
          key={obj.id}
          className="absolute text-foreground/80"
          style={{
            width: obj.size,
            height: obj.size,
            left: `${obj.startX}%`,
            top: `${obj.startY}%`,
            transform: `rotate(${obj.rotation}deg)`,
            animation: `float-across-${obj.id} ${obj.duration}s linear forwards`,
          }}
        >
          {icons[obj.type]}
          <style>
            {`
              @keyframes float-across-${obj.id} {
                0% {
                  left: ${obj.startX}%;
                  top: ${obj.startY}%;
                  opacity: 0;
                }
                5% {
                  opacity: 1;
                }
                95% {
                  opacity: 1;
                }
                100% {
                  left: ${obj.endX}%;
                  top: ${obj.endY}%;
                  opacity: 0;
                }
              }
            `}
          </style>
        </div>
      ))}
    </div>
  );
};

export default FloatingObjects;
