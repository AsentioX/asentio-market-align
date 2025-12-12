
import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import TopographicPattern from "@/components/TopographicPattern";
import { ArrowRight } from "lucide-react";
import chesterImg from "@/assets/chester.png";
import jonImg from "@/assets/jon.png";

const About = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Golden Gate Bridge Banner */}
      <div className="w-full relative">
        <div className="w-full h-[20vh] md:h-[28vh] overflow-hidden">
          <img 
            alt="Golden Gate Bridge in San Francisco" 
            className="w-full h-full object-cover" 
            src="/lovable-uploads/c5820e67-b1e2-42b5-9be4-c56123dc7c00.png" 
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center px-4">
              <p className="text-base md:text-xl text-white max-w-3xl mx-auto">
                {t('about.banner.text')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Who We Are Section */}
      <AnimatedSection className="py-12 md:py-24 bg-background relative">
        <TopographicPattern className="opacity-30" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="w-12 h-1 bg-asentio-red mb-4 md:mb-6" />
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-foreground">
              {t('about.who.title')}
            </h2>
            <div className="space-y-4 md:space-y-6">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {t('about.who.p1')}
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {t('about.who.p2')}
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {t('about.who.p3')}
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {t('about.who.p4')}
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Team Section */}
      <AnimatedSection className="py-12 md:py-24 bg-muted relative">
        <TopographicPattern className="opacity-20" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <div className="w-12 h-1 bg-asentio-red mx-auto mb-4 md:mb-6" />
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground">
                {t('about.team.title')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Jon */}
              <div className="group relative bg-card p-8 rounded-xl border border-border hover:border-asentio-red/30 transition-all duration-300 hover:shadow-xl hover:shadow-asentio-red/5">
                <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red rounded-l-xl transition-all duration-300 group-hover:h-full" />
                <div className="flex flex-col items-center text-center">
                  <img 
                    src={jonImg} 
                    alt="Jon Li" 
                    className="w-40 h-40 rounded-full object-cover shadow-lg mb-6 ring-4 ring-background"
                  />
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Jon Li</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.team.jon')}
                  </p>
                </div>
              </div>
              
              {/* Chester */}
              <div className="group relative bg-card p-8 rounded-xl border border-border hover:border-asentio-red/30 transition-all duration-300 hover:shadow-xl hover:shadow-asentio-red/5">
                <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red rounded-l-xl transition-all duration-300 group-hover:h-full" />
                <div className="flex flex-col items-center text-center">
                  <img 
                    src={chesterImg} 
                    alt="Chester Mui" 
                    className="w-40 h-40 rounded-full object-cover shadow-lg mb-6 ring-4 ring-background"
                  />
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Chester Mui</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.team.chester')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-24 bg-gradient-to-b from-background to-muted relative">
        <TopographicPattern className="opacity-20" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-1 bg-asentio-red mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              {t('about.cta.title')}
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              {t('about.cta.desc')}
            </p>
            <Link to="/contact">
              <Button 
                size="lg" 
                className="bg-asentio-blue hover:bg-asentio-blue/90 px-10 py-6 text-base font-medium shadow-lg shadow-asentio-blue/20 transition-all hover:shadow-xl"
              >
                {t('about.cta.button')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default About;
