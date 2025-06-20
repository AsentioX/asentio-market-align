import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-gradient-to-r from-gray-100 to-asentio-lightgray min-h-[67vh] flex items-center pt-20 py-[40px]">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-700">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-asentio-blue hover:bg-asentio-blue/90 text-white px-8">
                  {t('hero.cta')}
                </Button>
              </Link>
              <a href="mailto:info@asentio.com">
                
              </a>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-asentio-red rounded-full opacity-20"></div>
              <div className="absolute -right-10 top-10 w-32 h-32 bg-asentio-blue rounded-full opacity-10"></div>
              <div className="relative z-10 bg-white p-6 shadow-xl rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex items-center mb-4">
                  <div className="w-4 h-4 rounded-full bg-asentio-red mr-4"></div>
                  <div className="w-4 h-4 rounded-full bg-asentio-blue"></div>
                </div>
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
                  <img alt="Person smiling while looking at a device with blue light" className="object-cover w-full h-full" src="/lovable-uploads/290120a4-5e56-4a18-8887-0f4647623e7d.png" />
                </AspectRatio>
                <div className="h-5 w-20 rounded bg-slate-200">
                  <div className="h-5 w-25 bg-slate-200"></div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default Hero;
