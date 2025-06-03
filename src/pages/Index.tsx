
import { useEffect } from "react";
import Hero from "@/components/Hero";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="overflow-x-hidden">
      <Hero />
      
      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">{t('expertise.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-asentio-lightgray p-6 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-4">{t('expertise.pmf.title')}</h3>
                <p className="text-gray-700 mb-4">
                  {t('expertise.pmf.desc')}
                </p>
                <Link to="/services" className="text-asentio-blue font-medium hover:underline">
                  {t('expertise.learn')}
                </Link>
              </div>
              <div className="bg-asentio-lightgray p-6 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-4">{t('expertise.localization.title')}</h3>
                <p className="text-gray-700 mb-4">
                  {t('expertise.localization.desc')}
                </p>
                <Link to="/services" className="text-asentio-blue font-medium hover:underline">
                  {t('expertise.learn')}
                </Link>
              </div>
              <div className="bg-asentio-lightgray p-6 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-4">{t('expertise.channel.title')}</h3>
                <p className="text-gray-700 mb-4">
                  {t('expertise.channel.desc')}
                </p>
                <Link to="/services" className="text-asentio-blue font-medium hover:underline">
                  {t('expertise.learn')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      
      <AnimatedSection className="section bg-asentio-blue text-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('partner.title')}</h2>
                <p className="text-lg mb-6">
                  {t('partner.desc')}
                </p>
                <Link to="/why-asentio">
                  <Button className="bg-white text-asentio-blue hover:bg-white/90">
                    {t('partner.cta')}
                  </Button>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-asentio-red/20 rounded-lg transform rotate-3"></div>
                  <div className="relative bg-white p-8 rounded-lg shadow-lg transform -rotate-3">
                    <h3 className="text-asentio-blue font-semibold text-xl mb-4">{t('partner.expertise.title')}</h3>
                    <ul className="text-gray-700 space-y-4">
                      <li className="flex items-start">
                        <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </span>
                        <span>{t('partner.expertise.market')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </span>
                        <span>{t('partner.expertise.team')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </span>
                        <span>{t('partner.expertise.insights')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      
      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('cta.title')}</h2>
            <p className="text-xl text-gray-700 mb-8">
              {t('cta.desc')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-asentio-blue hover:bg-asentio-blue/90">
                  {t('cta.contact')}
                </Button>
              </Link>
              <a href="mailto:info@asentio.com">
                
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Index;
