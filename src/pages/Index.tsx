import { useEffect } from "react";
import Hero from "@/components/Hero";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import TopographicPattern from "@/components/TopographicPattern";
import WorldTimeMarquee from "@/components/WorldTimeMarquee";
import FloatingObjects from "@/components/FloatingObjects";
import { ArrowRight, CheckCircle2, Globe, Zap, Target } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const expertiseItems = [
    {
      icon: Target,
      titleKey: 'expertise.pmf.title',
      descKey: 'expertise.pmf.desc',
    },
    {
      icon: Globe,
      titleKey: 'expertise.localization.title',
      descKey: 'expertise.localization.desc',
    },
    {
      icon: Zap,
      titleKey: 'expertise.channel.title',
      descKey: 'expertise.channel.desc',
    },
  ];

  return (
    <div className="overflow-x-hidden relative">
      <FloatingObjects />
      
      {/* World Time Marquee */}
      <WorldTimeMarquee />
      
      <Hero />
      
      {/* Expertise Section */}
      <AnimatedSection className="py-24 bg-background relative">
        <TopographicPattern className="opacity-30" />
        
        <div className="container mx-auto relative z-10">
          {/* Section header with red accent */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="w-12 h-1 bg-asentio-red mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              {t('expertise.title')}
            </h2>
          </div>
          
          {/* Expertise cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {expertiseItems.map((item, index) => (
              <div 
                key={index}
                className="group relative bg-card p-8 rounded-xl border border-border hover:border-asentio-red/30 transition-all duration-300 hover:shadow-xl hover:shadow-asentio-red/5"
              >
                {/* Hover accent */}
                <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red rounded-l-xl transition-all duration-300 group-hover:h-full" />
                
                <div className="w-12 h-12 bg-asentio-blue/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-asentio-red/10 transition-colors">
                  <item.icon className="w-6 h-6 text-asentio-blue group-hover:text-asentio-red transition-colors" />
                </div>
                
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  {t(item.titleKey)}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t(item.descKey)}
                </p>
                <Link 
                  to="/services" 
                  className="inline-flex items-center gap-2 text-asentio-blue font-medium group-hover:text-asentio-red transition-colors"
                >
                  {t('expertise.learn')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
      
      {/* Partner Section */}
      <AnimatedSection className="py-24 bg-asentio-blue relative overflow-hidden">
        {/* Topographic overlay */}
        <TopographicPattern variant="dark" className="opacity-100" />
        
        {/* Red accent decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-asentio-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-asentio-red/5 rounded-full blur-2xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-12 h-1 bg-asentio-red mb-6" />
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-primary-foreground">
                  {t('partner.title')}
                </h2>
                <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed">
                  {t('partner.desc')}
                </p>
                <Link to="/services">
                  <Button 
                    size="lg"
                    className="bg-background text-asentio-blue hover:bg-background/90 px-8 py-6 font-medium shadow-lg"
                  >
                    {t('expertise.learn')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="hidden lg:block">
                <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-8 border border-background/20">
                  <h3 className="text-primary-foreground font-semibold text-xl mb-6">
                    {t('partner.expertise.title')}
                  </h3>
                  <ul className="space-y-5">
                    {[
                      t('partner.expertise.market'),
                      t('partner.expertise.team'),
                      t('partner.expertise.insights'),
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-asentio-red flex-shrink-0 mt-0.5" />
                        <span className="text-primary-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
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
            {/* Red accent */}
            <div className="w-12 h-1 bg-asentio-red mx-auto mb-6" />
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              {t('cta.desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact">
                <Button 
                  size="lg" 
                  className="bg-asentio-blue hover:bg-asentio-blue/90 px-10 py-6 text-base font-medium shadow-lg shadow-asentio-blue/20 transition-all hover:shadow-xl"
                >
                  {t('cta.contact')}
                </Button>
              </Link>
              <a href="mailto:info@asentio.com">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-10 py-6 text-base font-medium border-2 hover:bg-muted"
                >
                  Email Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Index;
