import { useEffect, useState } from 'react';

interface Node {
  id: number;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  radius: number;
  color: 'red' | 'blue';
  speed: number;
  angle: number;
  range: number; // movement range
}

interface Connection {
  from: number;
  to: number;
  color: 'red' | 'blue';
}

const GlobeGraphic = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 0, baseX: 120, baseY: 140, x: 120, y: 140, radius: 8, color: 'red', speed: 0.008, angle: 0, range: 35 },
    { id: 1, baseX: 280, baseY: 160, x: 280, y: 160, radius: 6, color: 'blue', speed: 0.012, angle: Math.PI / 3, range: 30 },
    { id: 2, baseX: 200, baseY: 280, x: 200, y: 280, radius: 7, color: 'blue', speed: 0.006, angle: Math.PI, range: 35 },
    { id: 3, baseX: 160, baseY: 200, x: 160, y: 200, radius: 5, color: 'blue', speed: 0.015, angle: Math.PI / 2, range: 25 },
    { id: 4, baseX: 240, baseY: 220, x: 240, y: 220, radius: 7, color: 'red', speed: 0.009, angle: Math.PI * 1.5, range: 30 },
    { id: 5, baseX: 180, baseY: 110, x: 180, y: 110, radius: 5, color: 'red', speed: 0.011, angle: Math.PI / 4, range: 25 },
    { id: 6, baseX: 300, baseY: 240, x: 300, y: 240, radius: 5, color: 'red', speed: 0.007, angle: Math.PI * 0.8, range: 28 },
  ]);

  const connections: Connection[] = [
    { from: 0, to: 5, color: 'red' },
    { from: 5, to: 1, color: 'blue' },
    { from: 0, to: 3, color: 'red' },
    { from: 3, to: 4, color: 'blue' },
    { from: 4, to: 2, color: 'red' },
    { from: 1, to: 6, color: 'blue' },
    { from: 6, to: 4, color: 'red' },
  ];

  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          const newAngle = node.angle + node.speed;
          // Create elliptical movement pattern
          const offsetX = Math.cos(newAngle) * node.range;
          const offsetY = Math.sin(newAngle * 0.7) * node.range * 0.6;
          
          return {
            ...node,
            angle: newAngle,
            x: node.baseX + offsetX,
            y: node.baseY + offsetY,
          };
        })
      );
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, []);

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
        
        {/* Connection lines - these move with the dots */}
        {connections.map((conn, i) => {
          const fromNode = nodes[conn.from];
          const toNode = nodes[conn.to];
          return (
            <line
              key={i}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              className={conn.color === 'red' ? 'stroke-asentio-red/50' : 'stroke-asentio-blue/40'}
              strokeWidth="1.5"
            />
          );
        })}
        
        {/* Connection nodes - animated */}
        {nodes.map(node => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.radius}
            className={node.color === 'red' ? 'fill-asentio-red' : 'fill-asentio-blue'}
          />
        ))}
        
        {/* Orbiting ring */}
        <g className="animate-orbit-3d" style={{ transformOrigin: '200px 200px' }}>
          <ellipse
            cx="200"
            cy="200"
            rx="180"
            ry="180"
            className="stroke-asentio-red/20"
            strokeWidth="1"
            strokeDasharray="8 4"
            fill="none"
          />
          
          {/* Orbiting dot */}
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