import { useEffect, useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import ExperienceFramework from "@/components/ExperienceFramework";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Target, Rocket, MessageSquare, TrendingUp, Users, Lightbulb, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import TopographicPattern from "@/components/TopographicPattern";
const Services = () => {
  const {
    t
  } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [quoteIndices, setQuoteIndices] = useState<number[]>([0, 0, 0]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Rotate quotes when hover changes
  useEffect(() => {
    if (hoveredIndex !== null) {
      setQuoteIndices(prev => prev.map((qi, i) => i !== hoveredIndex ? (qi + 1) % quotes[i].length : qi));
    }
  }, [hoveredIndex]);
  const quotes = [[{
    text: "Design is not just what it looks like. Design is how it works.",
    author: "Steve Jobs"
  }, {
    text: "Good design is obvious. Great design is transparent.",
    author: "Joe Sparano"
  }, {
    text: "The details are not the details. They make the design.",
    author: "Charles Eames"
  }, {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci"
  }], [{
    text: "The best marketing doesn't feel like marketing.",
    author: "Tom Fishburne"
  }, {
    text: "Make the customer the hero of your story.",
    author: "Ann Handley"
  }, {
    text: "People don't buy what you do, they buy why you do it.",
    author: "Simon Sinek"
  }, {
    text: "Content is fire, social media is gasoline.",
    author: "Jay Baer"
  }], [{
    text: "Your brand is what people say about you when you're not in the room.",
    author: "Jeff Bezos"
  }, {
    text: "A brand is a voice and a product is a souvenir.",
    author: "Lisa Gansky"
  }, {
    text: "Products are made in a factory but brands are created in the mind.",
    author: "Walter Landor"
  }, {
    text: "The best brands stand for something bigger than their products.",
    author: "Allen Adamson"
  }]];
  const services = [{
    title: t('services.product.title'),
    icon: Target,
    items: [t('services.product.item1'), t('services.product.item2'), t('services.product.item3'), t('services.product.item4')]
  }, {
    title: t('services.gtm.title'),
    icon: Rocket,
    items: [t('services.gtm.item1'), t('services.gtm.item2'), t('services.gtm.item3'), t('services.gtm.item4')]
  }, {
    title: t('services.branding.title'),
    icon: MessageSquare,
    items: [t('services.branding.item1'), t('services.branding.item2'), t('services.branding.item3')]
  }];
  const processSteps = [{
    number: "01",
    title: t('services.process.discovery.title'),
    description: t('services.process.discovery.desc'),
    icon: Lightbulb
  }, {
    number: "02",
    title: t('services.process.assessment.title'),
    description: t('services.process.assessment.desc'),
    icon: TrendingUp
  }, {
    number: "03",
    title: t('services.process.strategy.title'),
    description: t('services.process.strategy.desc'),
    icon: Target
  }, {
    number: "04",
    title: t('services.process.implementation.title'),
    description: t('services.process.implementation.desc'),
    icon: Users
  }];
  return <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-asentio-blue text-white py-16 md:py-24 relative overflow-hidden">
        <TopographicPattern variant="dark" className="opacity-100" />
        <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-asentio-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 md:w-48 h-24 md:h-48 bg-asentio-red/5 rounded-full blur-2xl" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-12 h-1 bg-asentio-red mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              {t('services.hero.title')} <span className="text-blue-200">{t('services.hero.title.highlight')}</span>
            </h1>
            <p className="text-lg md:text-2xl text-blue-100 leading-relaxed">
              {t('services.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Services Cards */}
      <AnimatedSection className="py-12 md:py-24 bg-background relative">
        <TopographicPattern className="opacity-30" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <div className="w-12 h-1 bg-asentio-red mx-auto mb-4 md:mb-6" />
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t('services.what.title')}
              </h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('services.what.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {services.map((service, index) => {
              const isHovered = hoveredIndex === index;
              const showQuote = hoveredIndex !== null && hoveredIndex !== index;
              return <div key={index} className="group relative bg-card p-8 rounded-xl border border-border hover:border-asentio-red/30 transition-all duration-300 hover:shadow-xl hover:shadow-asentio-red/5" onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                    <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red rounded-l-xl transition-all duration-300 group-hover:h-full" />
                    
                    <div className="text-center pb-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-asentio-blue/10 rounded-lg flex items-center justify-center group-hover:bg-asentio-red/10 transition-colors">
                        
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
                    </div>
                    
                    <div className="transition-all duration-300">
                      {/* Show items when hovered */}
                      <div className={`grid transition-all duration-300 ${isHovered ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                        
                      </div>
                      {/* Show quote when another card is hovered */}
                      {!isHovered && <div className={`grid transition-all duration-300 ${showQuote ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                          <div className="overflow-hidden">
                            <div className="text-center py-6 px-2 flex flex-col items-center justify-center">
                              <p className="text-muted-foreground italic text-sm leading-relaxed">"{quotes[index][quoteIndices[index]].text}"</p>
                              <p className="text-muted-foreground/60 text-xs mt-2">— {quotes[index][quoteIndices[index]].author}</p>
                            </div>
                          </div>
                        </div>}
                    </div>
                  </div>;
            })}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Experience Framework Section */}
      <AnimatedSection className="py-12 md:py-24 bg-muted relative">
        <TopographicPattern className="opacity-20" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-7xl mx-auto">
            <ExperienceFramework />
          </div>
        </div>
      </AnimatedSection>

      {/* Process Section */}
      <AnimatedSection className="py-12 md:py-24 bg-background relative">
        <TopographicPattern className="opacity-30" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <div className="w-12 h-1 bg-asentio-red mx-auto mb-4 md:mb-6" />
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t('services.process.title')}
              </h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('services.process.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {processSteps.map((step, index) => <div key={index} className="group text-center">
                  <div className="relative mb-4 md:mb-6">
                    <div className="w-14 h-14 md:w-20 md:h-20 mx-auto bg-asentio-blue rounded-full flex items-center justify-center text-white text-lg md:text-2xl font-bold shadow-lg group-hover:shadow-xl group-hover:shadow-asentio-blue/20 transition-all duration-300">
                      {step.number}
                    </div>
                    <div className="absolute -bottom-1 md:-bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 md:w-12 md:h-12 bg-card rounded-full flex items-center justify-center border border-border group-hover:border-asentio-red/30 transition-colors">
                      <step.icon className="h-4 w-4 md:h-6 md:w-6 text-asentio-blue group-hover:text-asentio-red transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-base md:text-xl font-bold text-foreground mb-2 md:mb-3">{step.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.description}</p>
                </div>)}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-12 md:py-24 bg-asentio-blue text-white relative overflow-hidden">
        <TopographicPattern variant="dark" className="opacity-100" />
        <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-asentio-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 md:w-48 h-24 md:h-48 bg-asentio-red/5 rounded-full blur-2xl" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-12 h-1 bg-asentio-red mx-auto mb-4 md:mb-6" />
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              {t('services.cta.title')} <span className="text-blue-200">{t('services.cta.title.highlight')}</span>
            </h2>
            <p className="text-base md:text-2xl text-blue-100 mb-8 md:mb-10 leading-relaxed">
              {t('services.cta.subtitle')}
            </p>
            <Link to="/contact" className="inline-block">
              <Button size="lg" className="bg-background text-asentio-blue hover:bg-background/90 px-8 md:px-10 py-5 md:py-6 text-base font-medium shadow-lg transition-all hover:shadow-xl">
                {t('services.cta.button')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>;
};
export default Services;