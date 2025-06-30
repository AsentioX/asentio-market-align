
import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
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
                We help consumer electronics brands achieve product-market fit in the United States through strategic guidance and cross-cultural expertise.
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
                <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Asentio is a cross-border strategic consultancy that helps international technology companies succeed in the U.S. market.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  Founded by professionals with deep experience in both Chinese and American markets, we specialize in translating global innovation into local success.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  Our team blends technical expertise with cultural and commercial insight to ensure your product resonates with U.S. customers—without losing the essence of your brand.
                </p>
                <p className="text-lg text-gray-700">
                  We also work with U.S. companies looking to collaborate with or source from China, bridging strategic and cultural gaps to create lasting partnerships.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl font-bold mb-6">Leadership</h2>
                <h3 className="text-xl font-semibold text-asentio-blue mb-4">Jon Li</h3>
                <p className="text-lg text-gray-700">
                  Jon Li is a product of Detroit and North Carolina. He has over 15 years of experience spanning both the U.S. and China. He combines deep product expertise with cross-cultural insight.
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <img 
                  src="/lovable-uploads/8a95cdac-ce43-4150-b29a-a16818c5bc00.png" 
                  alt="Jon Li presenting at a conference" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to bridge the gap?</h2>
            <p className="text-xl text-gray-700 mb-8">
              Let's discuss how our expertise can help your brand succeed in the U.S. market.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-asentio-blue hover:bg-asentio-blue/90">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default About;
