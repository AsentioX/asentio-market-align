import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket } from 'lucide-react';

const DirectoryCTA = () => {
  return (
    <section className="bg-gradient-to-br from-asentio-blue to-asentio-blue/90 text-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
            <Rocket className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Are you an XR or AI product company looking to enter the U.S. market?
          </h2>
          
          <p className="text-lg text-gray-300 mb-8">
            Let Asentio help you navigate the market, build your brand, and reach your target customers.
          </p>
          
          <Link to="/contact">
            <Button size="lg" className="bg-white text-asentio-blue hover:bg-gray-100 font-semibold px-8">
              Book a Strategy Call with Asentio
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DirectoryCTA;
