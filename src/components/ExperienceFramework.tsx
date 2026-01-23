import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FrameworkStep {
  labelKey: string;
  objectiveKey: string;
  keyFocusKey: string;
  channelsKey: string;
  touchpointsKey: string;
}

const ExperienceFramework = () => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState<number | null>(null);
  
  const steps: FrameworkStep[] = [
    {
      labelKey: 'framework.aware',
      objectiveKey: 'framework.aware.objective',
      keyFocusKey: 'framework.aware.focus',
      channelsKey: 'framework.aware.channels',
      touchpointsKey: 'framework.aware.touchpoints',
    },
    {
      labelKey: 'framework.arouse',
      objectiveKey: 'framework.arouse.objective',
      keyFocusKey: 'framework.arouse.focus',
      channelsKey: 'framework.arouse.channels',
      touchpointsKey: 'framework.arouse.touchpoints',
    },
    {
      labelKey: 'framework.acquire',
      objectiveKey: 'framework.acquire.objective',
      keyFocusKey: 'framework.acquire.focus',
      channelsKey: 'framework.acquire.channels',
      touchpointsKey: 'framework.acquire.touchpoints',
    },
    {
      labelKey: 'framework.use',
      objectiveKey: 'framework.use.objective',
      keyFocusKey: 'framework.use.focus',
      channelsKey: 'framework.use.channels',
      touchpointsKey: 'framework.use.touchpoints',
    },
    {
      labelKey: 'framework.reflect',
      objectiveKey: 'framework.reflect.objective',
      keyFocusKey: 'framework.reflect.focus',
      channelsKey: 'framework.reflect.channels',
      touchpointsKey: 'framework.reflect.touchpoints',
    }
  ];

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

  const processSteps = [
    { titleKey: 'services.process.discovery.title', descKey: 'services.process.discovery.desc', number: '01' },
    { titleKey: 'services.process.assessment.title', descKey: 'services.process.assessment.desc', number: '02' },
    { titleKey: 'services.process.strategy.title', descKey: 'services.process.strategy.desc', number: '03' },
    { titleKey: 'services.process.implementation.title', descKey: 'services.process.implementation.desc', number: '04' },
  ];

  return (
    <div className="space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="w-12 h-1 bg-asentio-red mx-auto mb-4 md:mb-6" />
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-foreground">
          {t('framework.title')}
        </h2>
        <p 
          className="text-base md:text-lg text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: t('framework.subtitle') }}
        />
      </div>

      {/* Two-column layout: Interactive diagram left, Process right */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-12 max-w-6xl mx-auto">
        {/* Left: Interactive Circles */}
        <div className="flex-shrink-0 w-full lg:w-auto flex flex-col items-center">
          <div className="relative w-[280px] md:w-[350px] aspect-square">
            <svg viewBox="0 0 500 500" className="w-full h-full">
              {/* Connection lines */}
              {steps.map((_, index) => (
                <path 
                  key={`line-${index}`} 
                  d={getConnectionPath(index, (index + 1) % 5)} 
                  stroke={activeStep !== null && (activeStep === index || activeStep === (index + 1) % 5) ? "#0A2342" : "#cbd5e1"} 
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
                    key={step.labelKey} 
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
                      className="transition-all duration-300" 
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
                      {t(step.labelKey)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Center Content - description in the middle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[160px] h-[160px] flex items-center justify-center">
                {activeStep !== null ? (
                  <div className="text-center p-2 animate-fade-in">
                    <h3 className="text-base font-bold text-asentio-blue mb-1">
                      {t(steps[activeStep].labelKey)}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {t(steps[activeStep].objectiveKey)}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">
                      {t('framework.hover')}
                    </p>
                    <p className="text-[10px] text-muted-foreground/40 mt-1 lg:hidden">
                      Tap to explore
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details below circles on mobile/tablet, hidden on desktop */}
          <div className="w-full max-w-md px-4 md:px-0 mt-6 lg:hidden">
            <div className="w-full space-y-4 bg-muted/30 rounded-xl p-4 md:p-6">
              <div>
                <h4 className="font-semibold text-foreground text-base md:text-lg mb-1">{t('framework.focus')}</h4>
                <p className={`text-sm md:text-base text-muted-foreground transition-all duration-300 ${activeStep !== null ? 'opacity-100' : 'opacity-30'}`}>
                  {activeStep !== null ? t(steps[activeStep].keyFocusKey) : t('framework.hover.details')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-base md:text-lg mb-1">{t('framework.channels')}</h4>
                <p className={`text-sm md:text-base text-muted-foreground transition-all duration-300 ${activeStep !== null ? 'opacity-100' : 'opacity-30'}`}>
                  {activeStep !== null ? t(steps[activeStep].channelsKey) : t('framework.hover.details')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-base md:text-lg mb-1">{t('framework.touchpoints')}</h4>
                <p className={`text-sm md:text-base text-muted-foreground transition-all duration-300 ${activeStep !== null ? 'opacity-100' : 'opacity-30'}`}>
                  {activeStep !== null ? t(steps[activeStep].touchpointsKey) : t('framework.hover.details')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Our Process */}
        <div className="flex-1 w-full lg:max-w-md">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            {t('services.process.title')}
          </h3>
          <div className="space-y-5">
            {processSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-asentio-blue/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-asentio-blue">{step.number}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-base mb-1">
                    {t(step.titleKey)}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceFramework;