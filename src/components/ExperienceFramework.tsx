import { useState } from 'react';
import { Search, Zap, ShoppingCart, Brain, MessageCircle, Target, Users, Palette, Rocket } from 'lucide-react';

interface FrameworkStep {
  label: string;
  emoji: string;
  objective: string;
  keyFocus: string;
  channels: string;
  touchpoints: string;
  strategyTip: string;
  icon: typeof Search;
}

const ExperienceFramework = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps: FrameworkStep[] = [
    { 
      label: 'aware', 
      emoji: '🔍',
      objective: 'Make the consumer aware of the product, brand, or solution.',
      keyFocus: 'Visibility, discovery, relevance',
      channels: 'Advertising, PR, SEO, word of mouth, influencer mentions',
      touchpoints: 'Social posts, landing pages, trade shows, media coverage',
      strategyTip: 'Highlight problem-solution fit in a compelling way that triggers curiosity.',
      icon: Search
    },
    { 
      label: 'arouse', 
      emoji: '⚡️',
      objective: 'Spark interest and desire to learn more or act.',
      keyFocus: 'Emotional connection, differentiation, aspiration',
      channels: 'Brand storytelling, product demos, experiential content',
      touchpoints: 'Videos, product packaging, in-store experiences, testimonials',
      strategyTip: 'Create an emotional or aspirational pull — show how the product improves life or status.',
      icon: Zap
    },
    { 
      label: 'acquire', 
      emoji: '🛒',
      objective: 'Drive the user to purchase or sign up.',
      keyFocus: 'Ease, trust, incentive',
      channels: 'E-commerce platforms, sales teams, retail stores',
      touchpoints: 'Checkout flow, pricing page, promotions, trial offers',
      strategyTip: 'Remove friction — emphasize trust signals, social proof, and a seamless experience.',
      icon: ShoppingCart
    },
    { 
      label: 'use', 
      emoji: '🧠',
      objective: 'Ensure a satisfying and delightful product usage experience.',
      keyFocus: 'Usability, onboarding, feature clarity',
      channels: 'Product UX, user guides, customer support',
      touchpoints: 'App interface, quick-start guides, customer success',
      strategyTip: 'Invest in first-use magic — the first few minutes can define long-term satisfaction.',
      icon: Brain
    },
    { 
      label: 'reflect', 
      emoji: '💬',
      objective: 'Drive loyalty, advocacy, or repeat engagement.',
      keyFocus: 'Value recognition, memory, identity',
      channels: 'Post-purchase emails, loyalty programs, community',
      touchpoints: 'Follow-up surveys, user forums, case studies',
      strategyTip: "Help users internalize the value (\"I'm glad I bought this\") and express it (\"I want to tell others\").",
      icon: MessageCircle
    },
  ];

  const useCases = [
    { icon: Target, label: 'Consumer product strategy' },
    { icon: Palette, label: 'Experience design (UX/UI)' },
    { icon: Rocket, label: 'Go-to-market planning' },
    { icon: MessageCircle, label: 'Brand storytelling' },
    { icon: Users, label: 'User onboarding flows' },
  ];

  // Circle positions
  const circleRadius = 50;
  const centerX = 180;
  const centerY = 180;
  const orbitRadius = 110;

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
    <div className="space-y-16">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Consumer Experience Framework</h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          The <strong>consumer experience framework</strong> — <em>Aware → Arouse → Acquire → Use → Reflect</em> — is a holistic model that maps the <strong>emotional and behavioral journey</strong> a consumer goes through with a product or brand. It helps companies understand how to design touchpoints and influence decisions across the full lifecycle of engagement.
        </p>
      </div>

      {/* Interactive Diagram + Active Step Detail */}
      <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
        {/* Circles SVG */}
        <div className="w-full lg:w-auto flex-shrink-0">
          <div className="relative w-full max-w-[360px] mx-auto aspect-square">
            <svg 
              viewBox="0 0 360 360" 
              className="w-full h-full"
            >
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
                        r={circleRadius + 6}
                        fill="none"
                        stroke="hsl(210, 70%, 50%)"
                        strokeWidth="3"
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
                      y={pos.y - 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-lg pointer-events-none select-none"
                    >
                      {step.emoji}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 14}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm font-medium fill-slate-700 pointer-events-none select-none capitalize"
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

        {/* Quick overview or active detail */}
        <div className="flex-1 min-h-[300px]">
          {activeStep !== null ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{steps[activeStep].emoji}</span>
                <h3 className="text-2xl font-bold text-gray-900 capitalize">{steps[activeStep].label}</h3>
              </div>
              <p className="text-lg text-blue-800 font-medium mb-4">
                <strong>Objective:</strong> {steps[activeStep].objective}
              </p>
              <div className="space-y-3 text-gray-700">
                <p><strong>Key Focus:</strong> {steps[activeStep].keyFocus}</p>
                <p><strong>Channels:</strong> {steps[activeStep].channels}</p>
                <p><strong>Touchpoints:</strong> {steps[activeStep].touchpoints}</p>
                <p className="bg-white/60 p-3 rounded-lg border border-blue-100">
                  <strong>💡 Strategy Tip:</strong> {steps[activeStep].strategyTip}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Hover over each stage to explore</h3>
              <p className="text-gray-600">Click or hover on any circle to see detailed information about that stage of the consumer journey.</p>
              <div className="grid grid-cols-1 gap-2 mt-6">
                {steps.map((step, index) => (
                  <button
                    key={step.label}
                    onClick={() => setActiveStep(index)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all text-left"
                  >
                    <span className="text-xl">{step.emoji}</span>
                    <span className="font-medium capitalize text-gray-800">{step.label}</span>
                    <span className="text-gray-500 text-sm">— {step.objective}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center">The Five Stages in Detail</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div 
              key={step.label}
              className={`bg-white rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
                activeStep === index ? 'border-blue-400 shadow-lg' : 'border-gray-200'
              }`}
              onMouseEnter={() => setActiveStep(index)}
              onMouseLeave={() => setActiveStep(null)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <span className="text-2xl">{step.emoji}</span>
                  <h4 className="text-lg font-bold text-gray-900 capitalize">{step.label}</h4>
                </div>
              </div>
              
              <p className="text-blue-700 font-medium mb-4">{step.objective}</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-700">Focus:</span> {step.keyFocus}</p>
                <p><span className="font-semibold text-gray-700">Channels:</span> {step.channels}</p>
                <p><span className="font-semibold text-gray-700">Touchpoints:</span> {step.touchpoints}</p>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">💡 Tip:</span> {step.strategyTip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why This Framework Matters */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🧭 Why This Framework Matters
          </h3>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            It reminds teams that <strong>product success isn't just about functionality</strong> — it's about shaping a <em>complete emotional journey</em>, from first discovery to long-term loyalty.
          </p>
          
          <p className="text-gray-600 mb-4 font-medium">This model is especially useful for:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                <useCase.icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{useCase.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceFramework;
