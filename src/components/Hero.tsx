import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useLanguage } from "@/contexts/LanguageContext";
import ARBackground from "./ARBackground";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-gradient-to-br from-background via-background to-muted min-h-[67vh] flex items-center pt-20 py-[40px] overflow-hidden">
      {/* AR/AI Background Elements */}
      <ARBackground />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-asentio-blue hover:bg-asentio-blue/90 text-primary-foreground px-8">
                  {t('hero.cta')}
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-asentio-red rounded-full opacity-20 animate-pulse-glow"></div>
              <div className="absolute -right-10 top-10 w-32 h-32 bg-asentio-blue rounded-full opacity-10 animate-float-slow"></div>
              <div className="relative z-10 bg-card p-6 shadow-xl rounded-lg border border-border overflow-hidden">
                <div className="flex items-center mb-4">
                  <div className="w-4 h-4 rounded-full bg-asentio-red mr-4"></div>
                  <div className="w-4 h-4 rounded-full bg-asentio-blue"></div>
                </div>
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
                  <img alt="Person smiling while looking at a device with blue light" className="object-cover w-full h-full" src="/lovable-uploads/290120a4-5e56-4a18-8887-0f4647623e7d.png" />
                </AspectRatio>
                <div className="h-5 w-20 rounded bg-muted mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
