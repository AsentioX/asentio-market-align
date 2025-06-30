
import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Target, Rocket, MessageSquare, TrendingUp, Users, Lightbulb } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Services = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              {services.map((service, index) => (
                <Card key={index} className={`${service.color} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-lg flex items-center justify-center`}>
                      <service.icon className={`h-8 w-8 ${service.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {service.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
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
