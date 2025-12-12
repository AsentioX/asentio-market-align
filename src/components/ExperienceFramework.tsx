import { useState } from 'react';

interface FrameworkStep {
  label: string;
  objective: string;
  keyFocus: string;
  channels: string;
  touchpoints: string;
  strategyTip: string;
}

const ExperienceFramework = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps: FrameworkStep[] = [
    { 
      label: 'Aware', 
      objective: 'Make the consumer aware of the product, brand, or solution.',
      keyFocus: 'Visibility, discovery, relevance',
      channels: 'Advertising, PR, SEO, word of mouth, influencer mentions',
      touchpoints: 'Social posts, landing pages, trade shows, media coverage',
      strategyTip: 'Highlight problem-solution fit in a compelling way that triggers curiosity.',
    },
    { 
      label: 'Arouse', 
      objective: 'Spark interest and desire to learn more or act.',
      keyFocus: 'Emotional connection, differentiation, aspiration',
      channels: 'Brand storytelling, product demos, experiential content',
      touchpoints: 'Videos, product packaging, in-store experiences, testimonials',
      strategyTip: 'Create an emotional or aspirational pull — show how the product improves life or status.',
    },
    { 
      label: 'Acquire', 
      objective: 'Drive the user to purchase or sign up.',
      keyFocus: 'Ease, trust, incentive',
      channels: 'E-commerce platforms, sales teams, retail stores',
      touchpoints: 'Checkout flow, pricing page, promotions, trial offers',
      strategyTip: 'Remove friction — emphasize trust signals, social proof, and a seamless experience.',
    },
    { 
      label: 'Use', 
      objective: 'Ensure a satisfying and delightful product usage experience.',
      keyFocus: 'Usability, onboarding, feature clarity',
      channels: 'Product UX, user guides, customer support',
      touchpoints: 'App interface, quick-start guides, customer success',
      strategyTip: 'Invest in first-use magic — the first few minutes can define long-term satisfaction.',
    },
    { 
      label: 'Reflect', 
      objective: 'Drive loyalty, advocacy, or repeat engagement.',
      keyFocus: 'Value recognition, memory, identity',
      channels: 'Post-purchase emails, loyalty programs, community',
      touchpoints: 'Follow-up surveys, user forums, case studies',
      strategyTip: "Help users internalize the value (\"I'm glad I bought this\") and express it (\"I want to tell others\").",
    },
  ];

  // Circle positions
  const circleRadius = 50;
  const centerX = 200;
  const centerY = 200;
  const orbitRadius = 130;

  const getCirclePosition = (index: number) => {
    const angle = (index * 72 - 90) * (Math.PI / 180);
    return {
      x: centerX + orbitRadius * Math.cos(angle),
      y: centerY + orbitRadius * Math.sin(angle),
    };
  };

  const getConnectionPath = (fromIndex: number, toIndex: number) => {
    const from = getCirclePosition(fromIndex);
    const to = getCirclePosition(toIndex);
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  };

  const handleStepClick = (index: number) => {
    setActiveStep(activeStep === index ? null : index);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Consumer Experience Framework</h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          The <strong>consumer experience framework</strong> — <em>Aware → Arouse → Acquire → Use → Reflect</em> — is a holistic model that maps the <strong>emotional and behavioral journey</strong> a consumer goes through with a product or brand.
        </p>
      </div>

      {/* Centered Circles */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-[400px] aspect-square">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* Connection lines */}
            {steps.map((_, index) => (
              <path
                key={`line-${index}`}
                d={getConnectionPath(index, (index + 1) % 5)}
                stroke={activeStep !== null && (activeStep === index || activeStep === (index + 1) % 5) 
                  ? "#0A2342" 
                  : "#cbd5e1"}
                strokeWidth="2"
                fill="none"
                strokeDasharray="6 4"
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
                  onClick={() => handleStepClick(index)}
                >
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={circleRadius + 6}
                      fill="none"
                      stroke="#0A2342"
                      strokeWidth="3"
                      opacity="0.4"
                    />
                  )}
                  
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={circleRadius}
                    fill={isActive ? '#0A2342' : '#e2e8f0'}
                    stroke="#0A2342"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:fill-[#1a3a5c]"
                  />
                  
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isActive ? '#ffffff' : '#0A2342'}
                    className="text-sm font-semibold pointer-events-none select-none transition-all duration-300"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    {step.label}
                  </text>
                </g>
              );
            })}

            {/* Center label */}
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#64748b"
              className="text-xs font-medium pointer-events-none"
            >
              JOURNEY
            </text>
          </svg>
        </div>
      </div>

      {/* Description - only shown when a stage is selected */}
      {activeStep !== null && (
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="bg-gray-50 border-2 border-asentio-blue/20 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-asentio-blue mb-3">
              {steps[activeStep].label}
            </h3>
            <p className="text-lg text-gray-700 font-medium mb-4">
              {steps[activeStep].objective}
            </p>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-semibold text-gray-800">Focus:</span> {steps[activeStep].keyFocus}</p>
              <p><span className="font-semibold text-gray-800">Channels:</span> {steps[activeStep].channels}</p>
              <p><span className="font-semibold text-gray-800">Touchpoints:</span> {steps[activeStep].touchpoints}</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800">
                  <span className="font-semibold">💡 Tip:</span> {steps[activeStep].strategyTip}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hint text when nothing selected */}
      {activeStep === null && (
        <p className="text-center text-gray-500 text-sm">
          Click on a stage to learn more
        </p>
      )}
    </div>
  );
};

export default ExperienceFramework;
