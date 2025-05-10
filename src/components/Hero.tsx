import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const Hero = () => {
  return <section className="relative bg-gradient-to-r from-asentio-lightgray to-white min-h-screen flex items-center pt-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Aligning Chinese Innovation with U.S. Market Expectations
            </h1>
            <p className="text-xl text-gray-700">
              Asentio helps Chinese consumer electronics brands find product-market fit in the U.S.
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
              <div className="relative z-10 bg-white p-6 shadow-xl rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-4 h-4 rounded-full bg-asentio-red mr-4"></div>
                  <div className="w-4 h-4 rounded-full bg-asentio-blue"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-100 rounded"></div>
                  <div className="h-32 bg-gradient-to-r from-asentio-blue/5 to-asentio-red/5 rounded"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-24 bg-gray-100 rounded"></div>
                    <div className="h-8 w-20 bg-asentio-blue rounded"></div>
                  </div>
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