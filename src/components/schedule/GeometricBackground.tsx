const GeometricBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e]" />
      
      {/* Texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Floating 3D shapes */}
      {/* Wireframe cube - top left */}
      <div className="absolute top-[10%] left-[5%] w-32 h-32 opacity-40 animate-undulate-1">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <g stroke="rgba(255, 105, 180, 0.6)" strokeWidth="1" fill="none">
            {/* Front face */}
            <polygon points="30,30 70,30 70,70 30,70" />
            {/* Back face */}
            <polygon points="40,20 80,20 80,60 40,60" />
            {/* Connecting lines */}
            <line x1="30" y1="30" x2="40" y2="20" />
            <line x1="70" y1="30" x2="80" y2="20" />
            <line x1="70" y1="70" x2="80" y2="60" />
            <line x1="30" y1="70" x2="40" y2="60" />
          </g>
        </svg>
      </div>

      {/* Solid cone - bottom left */}
      <div className="absolute bottom-[20%] left-[8%] w-24 h-32 opacity-60 animate-undulate-2">
        <svg viewBox="0 0 80 100" className="w-full h-full">
          <defs>
            <linearGradient id="coneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(147, 112, 219, 0.8)" />
              <stop offset="100%" stopColor="rgba(75, 0, 130, 0.6)" />
            </linearGradient>
          </defs>
          <polygon points="40,10 70,90 10,90" fill="url(#coneGradient)" />
        </svg>
      </div>

      {/* Wireframe fan/arc - top right */}
      <div className="absolute top-[8%] right-[5%] w-40 h-40 opacity-50 animate-undulate-3">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <g stroke="rgba(255, 182, 193, 0.5)" strokeWidth="0.8" fill="none">
            {[...Array(12)].map((_, i) => (
              <line 
                key={i}
                x1="100" 
                y1="100" 
                x2={100 - 80 * Math.cos((i * 7.5 * Math.PI) / 180)} 
                y2={100 - 80 * Math.sin((i * 7.5 * Math.PI) / 180)} 
              />
            ))}
            <path d="M 20,100 A 80,80 0 0,1 100,20" />
          </g>
        </svg>
      </div>

      {/* Half ring/torus - right side */}
      <div className="absolute top-[25%] right-[15%] w-20 h-20 opacity-50 animate-undulate-1">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="torusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0, 255, 255, 0.6)" />
              <stop offset="100%" stopColor="rgba(147, 112, 219, 0.4)" />
            </linearGradient>
          </defs>
          <path 
            d="M 10,50 A 40,40 0 0,1 90,50" 
            stroke="url(#torusGradient)" 
            strokeWidth="12" 
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Solid icosahedron/gem - center right */}
      <div className="absolute top-[15%] right-[30%] w-20 h-20 opacity-50 animate-undulate-2">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="gemGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(186, 135, 217, 0.9)" />
              <stop offset="100%" stopColor="rgba(106, 90, 205, 0.7)" />
            </linearGradient>
            <linearGradient id="gemGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(147, 112, 219, 0.8)" />
              <stop offset="100%" stopColor="rgba(75, 0, 130, 0.6)" />
            </linearGradient>
          </defs>
          <polygon points="50,10 80,40 65,85 35,85 20,40" fill="url(#gemGradient1)" />
          <polygon points="50,10 80,40 50,50 20,40" fill="url(#gemGradient2)" />
        </svg>
      </div>

      {/* Wireframe icosahedron - bottom right */}
      <div className="absolute bottom-[15%] right-[8%] w-28 h-28 opacity-40 animate-undulate-3">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <g stroke="rgba(186, 135, 217, 0.5)" strokeWidth="1" fill="none">
            <polygon points="50,10 85,35 75,75 25,75 15,35" />
            <line x1="50" y1="10" x2="50" y2="50" />
            <line x1="85" y1="35" x2="50" y2="50" />
            <line x1="75" y1="75" x2="50" y2="50" />
            <line x1="25" y1="75" x2="50" y2="50" />
            <line x1="15" y1="35" x2="50" y2="50" />
          </g>
        </svg>
      </div>

      {/* Wireframe cube - bottom center */}
      <div className="absolute bottom-[30%] left-[40%] w-20 h-20 opacity-30 animate-undulate-1">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <g stroke="rgba(128, 128, 128, 0.4)" strokeWidth="1" fill="none">
            <polygon points="30,40 70,40 70,80 30,80" />
            <polygon points="40,30 80,30 80,70 40,70" />
            <line x1="30" y1="40" x2="40" y2="30" />
            <line x1="70" y1="40" x2="80" y2="30" />
            <line x1="70" y1="80" x2="80" y2="70" />
            <line x1="30" y1="80" x2="40" y2="70" />
          </g>
        </svg>
      </div>

      {/* Small floating gem - left center */}
      <div className="absolute top-[45%] left-[3%] w-16 h-16 opacity-50 animate-undulate-2">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="smallGemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(186, 135, 217, 0.8)" />
              <stop offset="100%" stopColor="rgba(147, 112, 219, 0.5)" />
            </linearGradient>
          </defs>
          <polygon points="50,15 75,45 60,85 40,85 25,45" fill="url(#smallGemGradient)" />
        </svg>
      </div>

      {/* Glow effects */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-[80px]" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px]" />
    </div>
  );
};

export default GeometricBackground;
