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
    <div className="space-y-8 px-4 md:px-0">
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

      {/* Two-column layout with card styling */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Interactive Circles with background card */}
          <div className="relative order-2 lg:order-1">
            <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl p-6 md:p-10 border border-border/50">
              <div className="relative w-full max-w-[320px] md:max-w-[380px] aspect-square mx-auto">
                <svg viewBox="0 0 500 500" className="w-full h-full">
                  {/* Connection lines */}
                  {steps.map((_, index) => (
                    <path 
                      key={`line-${index}`} 
                      d={getConnectionPath(index, (index + 1) % 5)} 
                      stroke={activeStep !== null && (activeStep === index || activeStep === (index + 1) % 5) ? "hsl(var(--asentio-blue))" : "hsl(var(--border))"} 
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
                            r={circleRadius + 8} 
                            fill="none" 
                            stroke="hsl(var(--asentio-blue))" 
                            strokeWidth="3" 
                            opacity="0.3" 
                            className="animate-pulse"
                          />
                        )}
                        
                        <circle 
                          cx={pos.x} 
                          cy={pos.y} 
                          r={circleRadius} 
                          fill={isActive ? 'hsl(var(--asentio-blue))' : 'hsl(var(--muted))'} 
                          stroke="hsl(var(--asentio-blue))" 
                          strokeWidth="2.5" 
                          className="transition-all duration-300" 
                        />
                        
                        <text 
                          x={pos.x} 
                          y={pos.y} 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          fill={isActive ? 'hsl(var(--background))' : 'hsl(var(--asentio-blue))'} 
                          className="text-sm font-semibold pointer-events-none select-none transition-all duration-300" 
                          style={{ fontFamily: 'system-ui, sans-serif' }}
                        >
                          {t(step.labelKey)}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[140px] h-[140px] md:w-[160px] md:h-[160px] flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full shadow-lg">
                    {activeStep !== null ? (
                      <div className="text-center p-3 animate-fade-in">
                        <h3 className="text-sm md:text-base font-bold text-asentio-blue mb-1">
                          {t(steps[activeStep].labelKey)}
                        </h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">
                          {t(steps[activeStep].objectiveKey)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">
                          {t('framework.hover')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Our Process */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              {t('services.process.title')}
            </h3>
            <div className="space-y-6">
              {processSteps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex gap-5 group hover:translate-x-1 transition-transform duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-asentio-blue/10 border-2 border-asentio-blue/20 flex items-center justify-center group-hover:bg-asentio-blue/20 group-hover:border-asentio-blue/40 transition-all duration-300">
                    <span className="text-sm font-bold text-asentio-blue">{step.number}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-semibold text-foreground text-lg mb-1 group-hover:text-asentio-blue transition-colors duration-300">
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

        {/* Details section on mobile - shown below when step is active */}
        <div className="lg:hidden mt-6">
          {activeStep !== null && (
            <div className="bg-muted/30 rounded-xl p-5 animate-fade-in border border-border/50">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">{t('framework.focus')}</h4>
                  <p className="text-sm text-muted-foreground">{t(steps[activeStep].keyFocusKey)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">{t('framework.channels')}</h4>
                  <p className="text-sm text-muted-foreground">{t(steps[activeStep].channelsKey)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">{t('framework.touchpoints')}</h4>
                  <p className="text-sm text-muted-foreground">{t(steps[activeStep].touchpointsKey)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceFramework;