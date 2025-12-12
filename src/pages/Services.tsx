
import { useEffect, useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import ExperienceFramework from "@/components/ExperienceFramework";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Target, Rocket, MessageSquare, TrendingUp, Users, Lightbulb } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Services = () => {
  const { t } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [quoteIndices, setQuoteIndices] = useState<number[]>([0, 0, 0]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Rotate quotes when hover changes
  useEffect(() => {
    if (hoveredIndex !== null) {
      setQuoteIndices(prev => prev.map((qi, i) => 
        i !== hoveredIndex ? (qi + 1) % quotes[i].length : qi
      ));
    }
  }, [hoveredIndex]);

  const quotes = [
    [
      { text: "Design is not just what it looks like. Design is how it works.", author: "Steve Jobs" },
      { text: "Good design is obvious. Great design is transparent.", author: "Joe Sparano" },
      { text: "The details are not the details. They make the design.", author: "Charles Eames" },
      { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    ],
    [
      { text: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne" },
      { text: "Make the customer the hero of your story.", author: "Ann Handley" },
      { text: "People don't buy what you do, they buy why you do it.", author: "Simon Sinek" },
      { text: "Content is fire, social media is gasoline.", author: "Jay Baer" },
    ],
    [
      { text: "Your brand is what people say about you when you're not in the room.", author: "Jeff Bezos" },
      { text: "A brand is a voice and a product is a souvenir.", author: "Lisa Gansky" },
      { text: "Products are made in a factory but brands are created in the mind.", author: "Walter Landor" },
      { text: "The best brands stand for something bigger than their products.", author: "Allen Adamson" },
    ]
  ];

  const services = [
    {
      title: t('services.product.title'),
      icon: Target,
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      items: [
        t('services.product.item1'),
        t('services.product.item2'),
        t('services.product.item3'),
        t('services.product.item4')
      ]
    },
    {
      title: t('services.gtm.title'),
      icon: Rocket,
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      items: [
        t('services.gtm.item1'),
        t('services.gtm.item2'),
        t('services.gtm.item3'),
        t('services.gtm.item4')
      ]
    },
    {
      title: t('services.branding.title'),
      icon: MessageSquare,
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
      items: [
        t('services.branding.item1'),
        t('services.branding.item2'),
        t('services.branding.item3')
      ]
    }
  ];

  const processSteps = [
    {
      number: "01",
      title: t('services.process.discovery.title'),
      description: t('services.process.discovery.desc'),
      icon: Lightbulb
    },
    {
      number: "02",
      title: t('services.process.assessment.title'),
      description: t('services.process.assessment.desc'),
      icon: TrendingUp
    },
    {
      number: "03",
      title: t('services.process.strategy.title'),
      description: t('services.process.strategy.desc'),
      icon: Target
    },
    {
      number: "04",
      title: t('services.process.implementation.title'),
      description: t('services.process.implementation.desc'),
      icon: Users
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-asentio-blue to-blue-800 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t('services.hero.title')} <span className="text-blue-200">{t('services.hero.title.highlight')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              {t('services.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Services Cards */}
      <AnimatedSection className="section bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('services.what.title')}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('services.what.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const isHovered = hoveredIndex === index;
                const showQuote = hoveredIndex !== null && hoveredIndex !== index;
                
                return (
                  <Card 
                    key={index} 
                    className={`${service.color} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-lg flex items-center justify-center`}>
                        <service.icon className={`h-8 w-8 ${service.iconColor}`} />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="transition-all duration-300">
                      {/* Show items when hovered */}
                      <div className={`grid transition-all duration-300 ${isHovered ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                        <div className="overflow-hidden">
                          <ul className="space-y-3">
                            {service.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {/* Show quote when another card is hovered */}
                      <div className={`grid transition-all duration-300 ${showQuote ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                        <div className="overflow-hidden flex items-center justify-center min-h-[120px]">
                          <div className="text-center py-4 px-2 flex flex-col items-center justify-center h-full">
                            <p className="text-gray-500 italic text-sm leading-relaxed">"{quotes[index][quoteIndices[index]].text}"</p>
                            <p className="text-gray-400 text-xs mt-2">— {quotes[index][quoteIndices[index]].author}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Experience Framework Section */}
      <AnimatedSection className="section bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-7xl mx-auto">
            <ExperienceFramework />
          </div>
        </div>
      </AnimatedSection>

      {/* Process Section */}
      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('services.process.title')}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('services.process.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-asentio-blue to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      {step.number}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-asentio-blue" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="section bg-gradient-to-r from-asentio-blue via-blue-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('services.cta.title')} <span className="text-blue-200">{t('services.cta.title.highlight')}</span>
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
              {t('services.cta.subtitle')}
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-white text-asentio-blue hover:bg-gray-100 font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                {t('services.cta.button')}
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Services;
