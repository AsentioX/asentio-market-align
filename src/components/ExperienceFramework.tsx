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

  // Pentagon vertices (clockwise from top-left)
  // Outer pentagon points
  const outerPoints = [
    { x: 200, y: 30 },   // top-left (aware)
    { x: 370, y: 30 },   // top-right (arouse)
    { x: 450, y: 200 },  // right (acquire)
    { x: 285, y: 350 },  // bottom (use)
    { x: 120, y: 200 },  // left (reflect)
  ];

  // Inner pentagon points (smaller, creates the hollow center)
  const innerPoints = [
    { x: 230, y: 120 },  // top-left
    { x: 340, y: 120 },  // top-right
    { x: 380, y: 200 },  // right
    { x: 285, y: 270 },  // bottom
    { x: 190, y: 200 },  // left
  ];

  // Label positions
  const labelPositions = [
    { x: 185, y: 75 },   // aware
    { x: 355, y: 75 },   // arouse
    { x: 400, y: 210 },  // acquire
    { x: 285, y: 320 },  // use
    { x: 145, y: 210 },  // reflect
  ];

  // Create path for each segment
  const createSegmentPath = (index: number) => {
    const nextIndex = (index + 1) % 5;
    const outer1 = outerPoints[index];
    const outer2 = outerPoints[nextIndex];
    const inner1 = innerPoints[index];
    const inner2 = innerPoints[nextIndex];
    
    return `M ${outer1.x} ${outer1.y} 
            L ${outer2.x} ${outer2.y} 
            L ${inner2.x} ${inner2.y} 
            L ${inner1.x} ${inner1.y} Z`;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
      {/* Pentagon SVG */}
      <div className="relative w-full max-w-[500px] aspect-square">
        <svg 
          viewBox="70 0 430 380" 
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
        >
          {/* Pentagon segments */}
          {steps.map((step, index) => (
            <g key={step.label}>
              <path
                d={createSegmentPath(index)}
                fill={activeStep === index ? 'hsl(210, 70%, 75%)' : 'hsl(210, 60%, 90%)'}
                stroke="hsl(210, 60%, 60%)"
                strokeWidth="2"
                className="transition-all duration-300 cursor-pointer hover:fill-[hsl(210,70%,80%)]"
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
              />
              <text
                x={labelPositions[index].x}
                y={labelPositions[index].y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-lg font-light fill-slate-600 pointer-events-none select-none"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                {step.label}
              </text>
            </g>
          ))}
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
