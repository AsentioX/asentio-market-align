import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
const Hero = () => {
  return <section className="relative bg-gradient-to-r from-gray-100 to-asentio-lightgray min-h-screen flex items-center pt-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">Aligning Chinese Innovation with U.S. Market Expectations — and Vice Versa</h1>
            <p className="text-xl text-gray-700">
              Asentio helps Chinese consumer electronics brands succeed in the U.S., and enables U.S. companies to build meaningful partnerships with Chinese manufacturers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-asentio-blue hover:bg-asentio-blue/90 text-white px-8">
                  Talk to Us
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
                <div className="flex items-center justify-between mt-4">
                  <div className="h-6 w-24 bg-gray-100 rounded"></div>
                  <div className="h-8 w-20 bg-asentio-blue rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>;
};
export default Hero;