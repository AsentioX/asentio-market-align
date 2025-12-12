
import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import chesterImg from "@/assets/chester.png";
import jonImg from "@/assets/jon.png";

const About = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-0">
      {/* Golden Gate Bridge Banner */}
      <div className="w-full relative">
        <div className="w-full h-[28vh] overflow-hidden">
          <img 
            alt="Golden Gate Bridge in San Francisco" 
            className="w-full h-full object-cover" 
            src="/lovable-uploads/c5820e67-b1e2-42b5-9be4-c56123dc7c00.png" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-white max-w-3xl mx-auto px-4">
                {t('about.banner.text')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">{t('about.who.title')}</h2>
                <p className="text-lg text-gray-700 mb-4">
                  {t('about.who.p1')}
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  {t('about.who.p2')}
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  {t('about.who.p3')}
                </p>
                <p className="text-lg text-gray-700">
                  {t('about.who.p4')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">{t('about.team.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col items-center text-center">
                <img 
                  src={chesterImg} 
                  alt="Chester Mui" 
                  className="w-48 h-48 rounded-full object-cover shadow-lg mb-6"
                />
                <h3 className="text-xl font-semibold mb-3">Chester Mui</h3>
                <p className="text-gray-700">
                  {t('about.team.chester')}
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <img 
                  src={jonImg} 
                  alt="Jon Li" 
                  className="w-48 h-48 rounded-full object-cover shadow-lg mb-6"
                />
                <h3 className="text-xl font-semibold mb-3">Jon Li</h3>
                <p className="text-gray-700">
                  {t('about.team.jon')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('about.cta.title')}</h2>
            <p className="text-xl text-gray-700 mb-8">
              {t('about.cta.desc')}
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-asentio-blue hover:bg-asentio-blue/90">
                {t('about.cta.button')}
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default About;
