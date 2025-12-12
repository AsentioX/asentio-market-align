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
  const steps: FrameworkStep[] = [{
    label: 'Aware',
    objective: 'Make the consumer aware of the product, brand, or solution.',
    keyFocus: 'Visibility, discovery, relevance',
    channels: 'Advertising, PR, SEO, word of mouth, influencer mentions',
    touchpoints: 'Social posts, landing pages, trade shows, media coverage',
    strategyTip: 'Highlight problem-solution fit in a compelling way that triggers curiosity.'
  }, {
    label: 'Arouse',
    objective: 'Spark interest and desire to learn more or act.',
    keyFocus: 'Emotional connection, differentiation, aspiration',
    channels: 'Brand storytelling, product demos, experiential content',
    touchpoints: 'Videos, product packaging, in-store experiences, testimonials',
    strategyTip: 'Create an emotional or aspirational pull — show how the product improves life or status.'
  }, {
    label: 'Acquire',
    objective: 'Drive the user to purchase or sign up.',
    keyFocus: 'Ease, trust, incentive',
    channels: 'E-commerce platforms, sales teams, retail stores',
    touchpoints: 'Checkout flow, pricing page, promotions, trial offers',
    strategyTip: 'Remove friction — emphasize trust signals, social proof, and a seamless experience.'
  }, {
    label: 'Use',
    objective: 'Ensure a satisfying and delightful product usage experience.',
    keyFocus: 'Usability, onboarding, feature clarity',
    channels: 'Product UX, user guides, customer support',
    touchpoints: 'App interface, quick-start guides, customer success',
    strategyTip: 'Invest in first-use magic — the first few minutes can define long-term satisfaction.'
  }, {
    label: 'Reflect',
    objective: 'Drive loyalty, advocacy, or repeat engagement.',
    keyFocus: 'Value recognition, memory, identity',
    channels: 'Post-purchase emails, loyalty programs, community',
    touchpoints: 'Follow-up surveys, user forums, case studies',
    strategyTip: "Help users internalize the value (\"I'm glad I bought this\") and express it (\"I want to tell others\")."
  }];

  // Circle positions (percentage-based for tooltip positioning)
  const circleRadius = 50;
  const centerX = 250;
  const centerY = 250;
  const orbitRadius = 160;
  const getCirclePosition = (index: number) => {
    const angle = (index * 72 - 90) * (Math.PI / 180);
    return {
      x: centerX + orbitRadius * Math.cos(angle),
      y: centerY + orbitRadius * Math.sin(angle)
    };
  };
  const getConnectionPath = (fromIndex: number, toIndex: number) => {
    const from = getCirclePosition(fromIndex);
    const to = getCirclePosition(toIndex);
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  };

  return <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">How We Do It</h2>
        <p className="text-lg text-gray-600 leading-relaxed">The Consumer Experience Framework is holistic model that maps the <strong>emotional and behavioral journey</strong> a consumer goes through with a product or brand.
        </p>
      </div>

      {/* Circles Left + Content Right */}
      <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center gap-8">
        {/* Circles - Left side */}
        <div className="flex-shrink-0">
          <div className="relative w-[350px] aspect-square">
            <svg viewBox="0 0 500 500" className="w-full h-full">
              {/* Connection lines */}
              {steps.map((_, index) => <path key={`line-${index}`} d={getConnectionPath(index, (index + 1) % 5)} stroke={activeStep !== null && (activeStep === index || activeStep === (index + 1) % 5) ? "#0A2342" : "#cbd5e1"} strokeWidth="2" fill="none" strokeDasharray="6 4" className="transition-all duration-300" />)}

              {/* Circles */}
              {steps.map((step, index) => {
              const pos = getCirclePosition(index);
              const isActive = activeStep === index;
              return <g key={step.label} className="cursor-pointer" onMouseEnter={() => setActiveStep(index)} onMouseLeave={() => setActiveStep(null)}>
                    {isActive && <circle cx={pos.x} cy={pos.y} r={circleRadius + 6} fill="none" stroke="#0A2342" strokeWidth="3" opacity="0.4" />}
                    
                    <circle cx={pos.x} cy={pos.y} r={circleRadius} fill={isActive ? '#0A2342' : '#e2e8f0'} stroke="#0A2342" strokeWidth="2" className="transition-all duration-300" />
                    
                    <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill={isActive ? '#ffffff' : '#0A2342'} className="text-sm font-semibold pointer-events-none select-none transition-all duration-300" style={{
                  fontFamily: 'system-ui, sans-serif'
                }}>
                      {step.label}
                    </text>
                  </g>;
            })}
            </svg>

            {/* Center Content - description in the middle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[160px] h-[160px] flex items-center justify-center">
                {activeStep !== null ? (
                  <div className="text-center p-2 animate-fade-in">
                    <h3 className="text-base font-bold text-asentio-blue mb-1">
                      {steps[activeStep].label}
                    </h3>
                    <p className="text-xs text-gray-600 leading-tight">
                      {steps[activeStep].objective}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      Hover to explore
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content - Right side */}
        <div className="flex-1 flex items-center min-h-[350px]">
          <div className="w-full space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 text-lg mb-1">Focus</h4>
              <p className={`text-gray-600 transition-all duration-300 ${activeStep !== null ? 'opacity-100' : 'opacity-30'}`}>
                {activeStep !== null ? steps[activeStep].keyFocus : 'Hover over a stage to see details'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-lg mb-1">Channels</h4>
              <p className={`text-gray-600 transition-all duration-300 ${activeStep !== null ? 'opacity-100' : 'opacity-30'}`}>
                {activeStep !== null ? steps[activeStep].channels : 'Hover over a stage to see details'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-lg mb-1">Touchpoints</h4>
              <p className={`text-gray-600 transition-all duration-300 ${activeStep !== null ? 'opacity-100' : 'opacity-30'}`}>
                {activeStep !== null ? steps[activeStep].touchpoints : 'Hover over a stage to see details'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default ExperienceFramework;