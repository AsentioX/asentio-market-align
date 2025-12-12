import { useState } from 'react';

interface FrameworkStep {
  label: string;
  description: string;
}

const ExperienceFramework = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps: FrameworkStep[] = [
    { label: 'aware', description: 'Build awareness and capture attention through strategic positioning' },
    { label: 'arouse', description: 'Spark interest and emotional connection with your audience' },
    { label: 'acquire', description: 'Convert interest into action and customer acquisition' },
    { label: 'use', description: 'Deliver exceptional product experiences that delight users' },
    { label: 'reflect', description: 'Gather insights and feedback for continuous improvement' },
  ];

  // Circle positions arranged in a pentagon pattern
  const circleRadius = 55;
  const centerX = 200;
  const centerY = 200;
  const orbitRadius = 120;

  // Calculate positions for 5 circles in a pentagon arrangement
  const getCirclePosition = (index: number) => {
    // Start from top and go clockwise
    const angle = (index * 72 - 90) * (Math.PI / 180);
    return {
      x: centerX + orbitRadius * Math.cos(angle),
      y: centerY + orbitRadius * Math.sin(angle),
    };
  };

  // Get connection line between two circles
  const getConnectionPath = (fromIndex: number, toIndex: number) => {
    const from = getCirclePosition(fromIndex);
    const to = getCirclePosition(toIndex);
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
      {/* Circles SVG */}
      <div className="relative w-full max-w-[420px] aspect-square">
        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full"
        >
          {/* Connection lines between circles */}
          {steps.map((_, index) => (
            <path
              key={`line-${index}`}
              d={getConnectionPath(index, (index + 1) % 5)}
              stroke="hsl(210, 50%, 80%)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
              className="transition-all duration-300"
            />
          ))}

          {/* Circles */}
          {steps.map((step, index) => {
            const pos = getCirclePosition(index);
            const isActive = activeStep === index;
            
            return (
              <g 
                key={step.label}
                className="cursor-pointer"
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
              >
                {/* Outer glow when active */}
                {isActive && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={circleRadius + 8}
                    fill="none"
                    stroke="hsl(210, 70%, 60%)"
                    strokeWidth="3"
                    opacity="0.5"
                    className="animate-pulse"
                  />
                )}
                
                {/* Main circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={circleRadius}
                  fill={isActive ? 'hsl(210, 70%, 75%)' : 'hsl(210, 60%, 90%)'}
                  stroke="hsl(210, 60%, 60%)"
                  strokeWidth="2"
                  className="transition-all duration-300 hover:fill-[hsl(210,70%,80%)]"
                />
                
                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-base font-light fill-slate-600 pointer-events-none select-none"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {step.label}
                </text>
              </g>
            );
          })}

          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-medium fill-slate-500 pointer-events-none"
          >
            Experience
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-medium fill-slate-500 pointer-events-none"
          >
            Framework
          </text>
        </svg>
      </div>

      {/* Description panel */}
      <div className="flex-1 min-h-[200px] lg:min-h-[280px]">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Experience Framework</h3>
        <p className="text-gray-600 mb-6">
          Our proven 5-step framework guides every engagement, ensuring comprehensive coverage of the customer journey.
        </p>
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                activeStep === index 
                  ? 'bg-blue-50 border-blue-300 shadow-md' 
                  : 'bg-gray-50 border-gray-200 hover:border-blue-200'
              }`}
              onMouseEnter={() => setActiveStep(index)}
              onMouseLeave={() => setActiveStep(null)}
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg font-semibold capitalize ${
                  activeStep === index ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {step.label}
                </span>
                <span className={`text-sm ${
                  activeStep === index ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceFramework;
