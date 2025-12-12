const GlobeGraphic = () => {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-asentio-blue/10 to-transparent blur-3xl animate-pulse-glow" />
      
      {/* Main globe */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        fill="none"
      >
        {/* Globe outline */}
        <circle
          cx="200"
          cy="200"
          r="150"
          className="stroke-asentio-blue/30"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="200"
          cy="200"
          r="148"
          className="fill-background/50"
        />
        
        {/* Latitude lines */}
        <ellipse cx="200" cy="200" rx="150" ry="30" className="stroke-asentio-blue/15" strokeWidth="0.75" />
        <ellipse cx="200" cy="200" rx="150" ry="75" className="stroke-asentio-blue/15" strokeWidth="0.75" />
        <ellipse cx="200" cy="200" rx="150" ry="120" className="stroke-asentio-blue/15" strokeWidth="0.75" />
        
        {/* Longitude lines */}
        <ellipse cx="200" cy="200" rx="30" ry="150" className="stroke-asentio-blue/15" strokeWidth="0.75" />
        <ellipse cx="200" cy="200" rx="75" ry="150" className="stroke-asentio-blue/15" strokeWidth="0.75" />
        <ellipse cx="200" cy="200" rx="120" ry="150" className="stroke-asentio-blue/15" strokeWidth="0.75" />
        
        {/* Connection nodes */}
        <circle cx="120" cy="140" r="6" className="fill-asentio-red animate-pulse-glow" />
        <circle cx="280" cy="160" r="5" className="fill-asentio-blue animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <circle cx="200" cy="280" r="6" className="fill-asentio-red animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <circle cx="160" cy="220" r="4" className="fill-asentio-blue animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
        <circle cx="240" cy="240" r="5" className="fill-asentio-red animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <circle cx="180" cy="120" r="4" className="fill-asentio-blue animate-pulse-glow" style={{ animationDelay: '2.5s' }} />
        
        {/* Connection lines */}
        <line x1="120" y1="140" x2="180" y2="120" className="stroke-asentio-red/40" strokeWidth="1" />
        <line x1="180" y1="120" x2="280" y2="160" className="stroke-asentio-blue/40" strokeWidth="1" />
        <line x1="120" y1="140" x2="160" y2="220" className="stroke-asentio-red/40" strokeWidth="1" />
        <line x1="160" y1="220" x2="240" y2="240" className="stroke-asentio-blue/40" strokeWidth="1" />
        <line x1="240" y1="240" x2="200" y2="280" className="stroke-asentio-red/40" strokeWidth="1" />
        <line x1="280" y1="160" x2="240" y2="240" className="stroke-asentio-blue/40" strokeWidth="1" />
        
        {/* Orbiting ring */}
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="50"
          className="stroke-asentio-red/20"
          strokeWidth="1"
          strokeDasharray="8 4"
          transform="rotate(-20 200 200)"
        />
        
        {/* Orbiting dot */}
        <g className="animate-orbit" style={{ transformOrigin: '200px 200px' }}>
          <circle cx="380" cy="200" r="4" className="fill-asentio-red/60" />
        </g>
      </svg>
      
      {/* Floating accent elements */}
      <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-asentio-red/30 animate-float-slow" />
      <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-asentio-red/30 animate-float-slow" style={{ animationDelay: '-10s' }} />
    </div>
  );
};

export default GlobeGraphic;
