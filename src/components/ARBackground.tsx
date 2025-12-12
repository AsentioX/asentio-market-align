const ARBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Neural Network Nodes */}
      <svg
        className="absolute top-10 left-10 w-64 h-64 opacity-[0.08] animate-float-slow"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="40" cy="40" r="4" className="fill-primary animate-pulse-glow" />
        <circle cx="100" cy="30" r="3" className="fill-primary animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <circle cx="160" cy="60" r="4" className="fill-primary animate-pulse-glow" style={{ animationDelay: '4s' }} />
        <circle cx="80" cy="100" r="3" className="fill-primary animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <circle cx="140" cy="120" r="4" className="fill-primary animate-pulse-glow" style={{ animationDelay: '3s' }} />
        <line x1="40" y1="40" x2="100" y2="30" className="stroke-primary" strokeWidth="0.5" />
        <line x1="100" y1="30" x2="160" y2="60" className="stroke-primary" strokeWidth="0.5" />
        <line x1="40" y1="40" x2="80" y2="100" className="stroke-primary" strokeWidth="0.5" />
        <line x1="80" y1="100" x2="140" y2="120" className="stroke-primary" strokeWidth="0.5" />
        <line x1="160" y1="60" x2="140" y2="120" className="stroke-primary" strokeWidth="0.5" />
        <line x1="100" y1="30" x2="80" y2="100" className="stroke-primary" strokeWidth="0.5" />
      </svg>

      {/* AR Corner Brackets - Top Left */}
      <svg
        className="absolute top-20 left-[15%] w-16 h-16 opacity-[0.12] animate-rotate-slow"
        viewBox="0 0 60 60"
        fill="none"
      >
        <path d="M5 20 L5 5 L20 5" className="stroke-asentio-red" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 5 L55 5 L55 20" className="stroke-asentio-red" strokeWidth="2" strokeLinecap="round" />
        <path d="M55 40 L55 55 L40 55" className="stroke-asentio-red" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 55 L5 55 L5 40" className="stroke-asentio-red" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Scanning Line */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-asentio-red/20 to-transparent animate-scan-line" />

      {/* Floating Grid Pattern */}
      <svg
        className="absolute bottom-20 right-10 w-80 h-80 opacity-[0.05] animate-drift"
        viewBox="0 0 300 300"
        fill="none"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 60}
            x2="300"
            y2={i * 60}
            className="stroke-foreground"
            strokeWidth="0.5"
          />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={`v-${i}`}
            x1={i * 60}
            y1="0"
            x2={i * 60}
            y2="300"
            className="stroke-foreground"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* Orbiting Particles */}
      <div className="absolute top-1/2 right-1/4 w-40 h-40">
        <div className="absolute inset-0 animate-orbit">
          <div className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-asentio-red/30" />
        </div>
        <div className="absolute inset-0 animate-orbit" style={{ animationDelay: '-10s', animationDuration: '35s' }}>
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 -translate-x-1/2 rounded-full bg-primary/20" />
        </div>
        <div className="absolute inset-0 animate-orbit" style={{ animationDelay: '-20s', animationDuration: '45s' }}>
          <div className="absolute top-0 left-1/2 w-1 h-1 -translate-x-1/2 rounded-full bg-asentio-red/20" />
        </div>
      </div>

      {/* AR Targeting Reticle */}
      <svg
        className="absolute bottom-32 left-1/4 w-24 h-24 opacity-[0.08] animate-pulse-glow"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="30" className="stroke-primary" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="20" className="stroke-asentio-red" strokeWidth="0.5" />
        <line x1="50" y1="15" x2="50" y2="25" className="stroke-primary" strokeWidth="1" />
        <line x1="50" y1="75" x2="50" y2="85" className="stroke-primary" strokeWidth="1" />
        <line x1="15" y1="50" x2="25" y2="50" className="stroke-primary" strokeWidth="1" />
        <line x1="75" y1="50" x2="85" y2="50" className="stroke-primary" strokeWidth="1" />
      </svg>

      {/* Second Neural Network - Right Side */}
      <svg
        className="absolute top-1/3 right-20 w-48 h-48 opacity-[0.06] animate-float-slow"
        style={{ animationDelay: '-15s' }}
        viewBox="0 0 150 150"
        fill="none"
      >
        <circle cx="30" cy="75" r="3" className="fill-asentio-red animate-pulse-glow" />
        <circle cx="75" cy="30" r="3" className="fill-primary animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <circle cx="120" cy="75" r="3" className="fill-asentio-red animate-pulse-glow" style={{ animationDelay: '4s' }} />
        <circle cx="75" cy="120" r="3" className="fill-primary animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <circle cx="75" cy="75" r="4" className="fill-asentio-red animate-pulse-glow" style={{ animationDelay: '3s' }} />
        <line x1="30" y1="75" x2="75" y2="75" className="stroke-primary" strokeWidth="0.5" />
        <line x1="75" y1="30" x2="75" y2="75" className="stroke-primary" strokeWidth="0.5" />
        <line x1="120" y1="75" x2="75" y2="75" className="stroke-asentio-red" strokeWidth="0.5" />
        <line x1="75" y1="120" x2="75" y2="75" className="stroke-primary" strokeWidth="0.5" />
      </svg>

      {/* Data Stream Lines */}
      <div className="absolute top-0 left-1/3 w-px h-full opacity-[0.03]">
        <div className="h-20 w-full bg-gradient-to-b from-transparent via-asentio-red to-transparent animate-data-stream" />
      </div>
      <div className="absolute top-0 left-2/3 w-px h-full opacity-[0.03]">
        <div className="h-20 w-full bg-gradient-to-b from-transparent via-primary to-transparent animate-data-stream" style={{ animationDelay: '-5s' }} />
      </div>
    </div>
  );
};

export default ARBackground;
