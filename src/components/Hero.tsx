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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentServiceIndex(prev => (prev + 1) % services.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-background min-h-[80vh] flex items-center pt-12 pb-16 overflow-hidden">
      {/* Topographic Pattern */}
      <TopographicPattern className="opacity-60" />
      
      {/* AR/AI Background Elements */}
      <ARBackground />
      
      {/* Red accent line */}
      <div className="absolute top-0 left-0 w-1 h-32 bg-gradient-to-b from-asentio-red to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full overflow-hidden">
              <span className="w-2 h-2 bg-asentio-red rounded-full animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase transition-all duration-500">
                {services[currentServiceIndex]}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-foreground">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/contact">
                <Button 
                  size="lg" 
                  className="bg-asentio-blue hover:bg-asentio-blue/90 text-primary-foreground px-8 py-6 text-base font-medium shadow-lg shadow-asentio-blue/20 transition-all hover:shadow-xl hover:shadow-asentio-blue/30"
                >
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link to="/services">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 text-base font-medium border-2 hover:bg-muted"
                >
                  Our Services
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Globe Graphic */}
          <div className="hidden lg:block">
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
