
import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      <section className="bg-asentio-blue text-white py-24">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl">
              Strategic guidance to help Chinese consumer electronics brands succeed in the U.S. market.
            </p>
          </div>
        </div>
      </section>

      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 gap-16">
              
              {/* Product Strategy & Market Fit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-block bg-asentio-blue/10 text-asentio-blue px-4 py-1 rounded-full text-sm font-medium mb-4">
                    Core Service
                  </div>
                  <h2 className="text-3xl font-bold mb-6">Product Strategy & Market Fit</h2>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-start">
                      <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      <span>Heuristic UX/UI evaluations for U.S. users</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      <span>Industrial design and packaging reviews</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      <span>Cultural fit analysis to adapt branding and messaging</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      <span>Competitive benchmarking</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-asentio-lightgray rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Our Approach</h3>
                  <p className="text-gray-700 mb-6">
                    We conduct thorough research combining market analysis, competitor evaluation, and consumer behavior insights specific to your product category. This results in actionable recommendations for product adaptations that will resonate with U.S. consumers.
                  </p>
                  <div className="flex justify-center">
                    <div className="w-full max-w-xs bg-white p-4 rounded-lg shadow-sm">
                      <div className="h-4 w-3/4 bg-asentio-blue/20 rounded mb-3"></div>
                      <div className="h-32 bg-gradient-to-br from-asentio-blue/10 to-asentio-red/10 rounded mb-3"></div>
                      <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Go-to-Market & Sales Enablement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1 bg-asentio-lightgray rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">What We Deliver</h3>
                  <p className="text-gray-700 mb-6">
                    A comprehensive go-to-market strategy that addresses distribution channels, sales processes, partnership opportunities, and market entry tactics tailored to your specific product and target audience.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="h-12 flex items-center justify-center">
                        <span className="text-asentio-blue text-2xl">市场</span>
                      </div>
                      <div className="h-0.5 w-1/2 mx-auto bg-asentio-red my-2"></div>
                      <div className="h-12 flex items-center justify-center">
                        <span className="text-asentio-blue text-2xl">Market</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="h-6 w-6 mx-auto border-2 border-asentio-blue rounded-full flex items-center justify-center">
                          <div className="h-4 w-4 bg-asentio-blue rounded-full"></div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">Strategy</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="inline-block bg-asentio-blue/10 text-asentio-blue px-4 py-1 rounded-full text-sm font-medium mb-4">
                    Core Service
                  </div>
                  <h2 className="text-3xl font-bold mb-6">Go-to-Market & Sales Enablement</h2>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-start">
                      <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      <span>Consumer and enterprise GTM strategy and execution</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      <span>Channel development: retail, distributor, and direct sales</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      <span>Strategic partnership identification and engagement</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      <span>Trade show and event strategy</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Branding & Communication */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-block bg-asentio-blue/10 text-asentio-blue px-4 py-1 rounded-full text-sm font-medium mb-4">
                    Core Service
                  </div>
                  <h2 className="text-3xl font-bold mb-6">Branding & Communication</h2>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex items-start">
                      <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      <span>Positioning and messaging tailored to Western audiences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      <span>Visual identity consulting</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-5 w-5 bg-asentio-blue rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </span>
                      <span>Launch narrative and marketing content support</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-asentio-lightgray rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Our Network</h3>
                  <p className="text-gray-700 mb-6">
                    Leverage our established relationships with key U.S. marketing partners, creative agencies, and communication channels. We help you craft compelling brand narratives that resonate with American audiences.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white h-16 rounded-lg shadow-sm flex items-center justify-center">
                      <div className="h-6 w-3/4 bg-asentio-blue/20 rounded"></div>
                    </div>
                    <div className="bg-white h-16 rounded-lg shadow-sm flex items-center justify-center">
                      <div className="h-6 w-3/4 bg-asentio-red/20 rounded"></div>
                    </div>
                    <div className="bg-white h-16 rounded-lg shadow-sm flex items-center justify-center">
                      <div className="h-6 w-3/4 bg-asentio-blue/20 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section bg-asentio-blue text-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Consulting Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-4">
                <div className="w-12 h-12 bg-white text-asentio-blue rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-lg font-semibold mb-2">Discovery</h3>
                <p className="text-sm text-white/80">
                  In-depth analysis of your product and business objectives
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-white text-asentio-blue rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-lg font-semibold mb-2">Assessment</h3>
                <p className="text-sm text-white/80">
                  Market evaluation and competitive positioning analysis
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-white text-asentio-blue rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-lg font-semibold mb-2">Strategy</h3>
                <p className="text-sm text-white/80">
                  Customized recommendations and action plan development
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-white text-asentio-blue rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
                <h3 className="text-lg font-semibold mb-2">Implementation</h3>
                <p className="text-sm text-white/80">
                  Ongoing guidance and support during execution
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your U.S. market approach?</h2>
            <p className="text-xl text-gray-700 mb-8">
              Contact us today to discuss how our services can help your brand succeed.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-asentio-blue hover:bg-asentio-blue/90">
                Start the Conversation
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Services;
