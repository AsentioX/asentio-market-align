import { useEffect } from "react";
import Hero from "@/components/Hero";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <div className="overflow-x-hidden">
      <Hero />
      
      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-asentio-lightgray p-6 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-4">Product-Market Fit</h3>
                <p className="text-gray-700 mb-4">
                  We analyze U.S. consumer expectations and preferences to align your products with market demands.
                </p>
                <Link to="/services" className="text-asentio-blue font-medium hover:underline">
                  Learn more
                </Link>
              </div>
              <div className="bg-asentio-lightgray p-6 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-4">Localization Advisory</h3>
                <p className="text-gray-700 mb-4">
                  Cultural nuances matter. We help adapt your product, messaging, and experience for U.S. consumers.
                </p>
                <Link to="/services" className="text-asentio-blue font-medium hover:underline">
                  Learn more
                </Link>
              </div>
              <div className="bg-asentio-lightgray p-6 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-4">Channel Strategy</h3>
                <p className="text-gray-700 mb-4">
                  Navigate the complex U.S. retail and e-commerce landscape with our expert guidance.
                </p>
                <Link to="/services" className="text-asentio-blue font-medium hover:underline">
                  Learn more
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
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  A Strategic Partner, Not Just a Marketing Agency
                </h2>
                <p className="text-lg mb-6">
                  Asentio combines deep market knowledge with cross-cultural expertise to help your brand navigate the crucial product-market fit challenges in the U.S.
                </p>
                <Link to="/why-asentio">
                  <Button className="bg-white text-asentio-blue hover:bg-white/90">
                    Why Choose Asentio
                  </Button>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-asentio-red/20 rounded-lg transform rotate-3"></div>
                  <div className="relative bg-white p-8 rounded-lg shadow-lg transform -rotate-3">
                    <h3 className="text-asentio-blue font-semibold text-xl mb-4">Cross-Cultural Expertise</h3>
                    <ul className="text-gray-700 space-y-4">
                      <li className="flex items-start">
                        <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </span>
                        <span>Deep understanding of both Chinese and U.S. markets</span>
                      </li>
                      <li className="flex items-start">
                        <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </span>
                        <span>Bilingual team with bicultural experience</span>
                      </li>
                      <li className="flex items-start">
                        <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-white text-xs">✓</span>
                        </span>
                        <span>Strategic insights that bridge East and West</span>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Succeed in the U.S. Market?</h2>
            <p className="text-xl text-gray-700 mb-8">
              Let's discuss how we can help your consumer electronics brand achieve product-market fit in the United States.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-asentio-blue hover:bg-asentio-blue/90">
                  Contact Us
                </Button>
              </Link>
              <a href="mailto:info@asentio.com">
                
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>;
};
export default Index;