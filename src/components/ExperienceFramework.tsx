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
  const circleRadius = 45;
  const centerX = 160;
  const centerY = 160;
  const orbitRadius = 100;

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

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Consumer Experience Framework</h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          The <strong>consumer experience framework</strong> — <em>Aware → Arouse → Acquire → Use → Reflect</em> — is a holistic model that maps the <strong>emotional and behavioral journey</strong> a consumer goes through with a product or brand.
        </p>
      </div>

      {/* Interactive Diagram + Stages List */}
      <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
        {/* Circles SVG */}
        <div className="w-full lg:w-auto flex-shrink-0">
          <div className="relative w-full max-w-[320px] mx-auto aspect-square">
            <svg viewBox="0 0 320 320" className="w-full h-full">
              {/* Connection lines */}
              {steps.map((_, index) => (
                <path
                  key={`line-${index}`}
                  d={getConnectionPath(index, (index + 1) % 5)}
                  stroke={activeStep !== null && (activeStep === index || activeStep === (index + 1) % 5) 
                    ? "hsl(210, 60%, 50%)" 
                    : "hsl(210, 50%, 80%)"}
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
                    onClick={() => setActiveStep(activeStep === index ? null : index)}
                  >
                    {isActive && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={circleRadius + 5}
                        fill="none"
                        stroke="hsl(210, 70%, 50%)"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                    )}
                    
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={circleRadius}
                      fill={isActive ? 'hsl(210, 70%, 70%)' : 'hsl(210, 60%, 90%)'}
                      stroke="hsl(210, 60%, 55%)"
                      strokeWidth="2"
                      className="transition-all duration-300"
                    />
                    
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm font-medium fill-slate-700 pointer-events-none select-none"
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
                className="text-xs font-medium fill-slate-400 pointer-events-none"
              >
                JOURNEY
              </text>
            </svg>
          </div>
        </div>

        {/* Stages List */}
        <div className="flex-1 space-y-3">
          {steps.map((step, index) => {
            const isActive = activeStep === index;
            return (
              <div
                key={step.label}
                className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-blue-50 border-blue-300 shadow-md' 
                    : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                }`}
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div className="flex items-start gap-4">
                  <h4 className={`text-lg font-bold min-w-[80px] ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                    {step.label}
                  </h4>
                  <div className="flex-1">
                    <p className={`font-medium mb-2 ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                      {step.objective}
                    </p>
                    {isActive && (
                      <div className="space-y-1 text-sm text-gray-600 animate-fade-in">
                        <p><span className="font-semibold">Focus:</span> {step.keyFocus}</p>
                        <p><span className="font-semibold">Channels:</span> {step.channels}</p>
                        <p><span className="font-semibold">Touchpoints:</span> {step.touchpoints}</p>
                        <p className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">
                          <span className="font-semibold">💡 Tip:</span> {step.strategyTip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExperienceFramework;
