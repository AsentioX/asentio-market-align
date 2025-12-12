import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import ARBackground from "./ARBackground";
import TopographicPattern from "./TopographicPattern";
import GlobeGraphic from "./GlobeGraphic";

const services = [
  "Product Strategy",
  "Go-To-Market",
  "Brand Positioning",
  "US Market Entry",
  "Consumer Insights",
  "Channel Strategy",
];

const Hero = () => {
  const { t } = useLanguage();
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [isFlashing, setIsFlashing] = useState(true);

  useEffect(() => {
    let flashCount = 0;
    let timeoutId: NodeJS.Timeout;

    const getRandomIndex = (excludeIndex?: number) => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * services.length);
      } while (newIndex === excludeIndex);
      return newIndex;
    };

    const runCycle = () => {
      // Flash phase: 5 random items at 1 second each
      if (flashCount < 5) {
        setIsFlashing(true);
        setCurrentServiceIndex(prev => getRandomIndex(prev));
        flashCount++;
        timeoutId = setTimeout(runCycle, 1000);
      } else {
        // Hold phase: stay on current for 5 seconds
        setIsFlashing(false);
        flashCount = 0;
        timeoutId = setTimeout(runCycle, 5000);
      }
    };

    runCycle();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <section className="relative bg-background min-h-[60vh] md:min-h-[80vh] flex items-center pt-8 md:pt-12 pb-12 md:pb-16 overflow-hidden px-4 md:px-0">
      {/* Topographic Pattern */}
      <TopographicPattern className="opacity-60" />
      
      {/* AR/AI Background Elements */}
      <ARBackground />
      
      {/* Red accent line */}
      <div className="absolute top-0 left-0 w-1 h-32 bg-gradient-to-b from-asentio-red to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-6 md:space-y-8 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-muted rounded-full overflow-hidden">
              <span className="w-2 h-2 bg-asentio-red rounded-full animate-pulse" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground tracking-wide uppercase transition-all duration-500">
                {services[currentServiceIndex]}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-foreground">
              {t('hero.title')}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4 justify-center lg:justify-start">
              <Link to="/contact" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-asentio-blue hover:bg-asentio-blue/90 text-primary-foreground px-6 md:px-8 py-5 md:py-6 text-base font-medium shadow-lg shadow-asentio-blue/20 transition-all hover:shadow-xl hover:shadow-asentio-blue/30"
                >
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link to="/services" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto px-6 md:px-8 py-5 md:py-6 text-base font-medium border-2 hover:bg-muted"
                >
                  {t('hero.services')}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Globe Graphic - show smaller version on tablet, hide on mobile */}
          <div className="hidden md:block">
            <GlobeGraphic />
          </div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
