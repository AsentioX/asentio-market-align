
import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WhyAsentio = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      <section className="bg-asentio-blue text-white py-24">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Why asentio</h1>
            <p className="text-xl">
              Your strategic partner for navigating the U.S. consumer electronics market.
            </p>
          </div>
        </div>
      </section>

      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Strategic Partner, Not Just a Marketing Agency</h2>
                <p className="text-lg text-gray-700 mb-6">
                  While marketing agencies focus on promotion and visibility, asentio goes deeper to ensure your products are fundamentally aligned with U.S. consumer expectations before marketing begins.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  We provide strategic guidance on product development, feature prioritization, user experience, and market positioning—ensuring your products are optimized for success from the ground up.
                </p>
                <p className="text-lg text-gray-700">
                  Our team has successfully helped U.S. and Chinese companies align on product, process, and partnership. We understand the risk of misalignment — and how to prevent it.
                </p>
              </div>
              <div className="bg-asentio-lightgray rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-6">The asentio Difference:</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-asentio-blue rounded-full flex items-center justify-center text-white mr-4 mt-1 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Proactive Strategy</h4>
                      <p className="text-gray-700">We address fundamental product-market fit issues before they become costly marketing challenges.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-asentio-blue rounded-full flex items-center justify-center text-white mr-4 mt-1 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Specialized Focus</h4>
                      <p className="text-gray-700">We concentrate exclusively on Chinese-American consumer electronics partnerships—this is our expertise, not one of many services.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-asentio-blue text-white p-8 md:p-12 rounded-lg">
              <h2 className="text-3xl font-bold mb-8">Our Promise to Clients</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Honest Assessment</h3>
                    <p className="text-white/90">
                      We provide straightforward evaluations of your product's strengths and challenges in the U.S. market, even when the feedback may be difficult to hear.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Practical Solutions</h3>
                    <p className="text-white/90">
                      Our recommendations balance ideal scenarios with practical constraints, delivering strategies that can be implemented within your operational and resource realities.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Cultural Bridge</h3>
                    <p className="text-white/90">
                      We navigate the complex cultural differences in business practices, communication styles, and consumer expectations between China and the United States.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Long-Term Partnership</h3>
                    <p className="text-white/90">
                      We measure our success by your sustained growth in the U.S. market, not just initial entry. Our goal is to establish your brand as a recognized and respected player in the American consumer electronics landscape.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section bg-asentio-lightgray">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Partner with asentio?</h2>
            <p className="text-xl text-gray-700 mb-8">
              Take the first step toward achieving product-market fit in the U.S. consumer electronics market.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-asentio-blue hover:bg-asentio-blue/90">
                Schedule a Consultation
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default WhyAsentio;
