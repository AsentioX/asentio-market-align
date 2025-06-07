import { useEffect } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <div className="pt-0">
      {/* Golden Gate Bridge Banner */}
      <div className="w-full relative">
        <div className="w-full h-[28vh] overflow-hidden">
          <img alt="Golden Gate Bridge in San Francisco" className="w-full h-full object-cover" src="/lovable-uploads/c5820e67-b1e2-42b5-9be4-c56123dc7c00.png" />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center">
              
              <p className="text-xl text-white max-w-3xl mx-auto px-4">We help consumer electronics brands achieve product-market fit in the United States through strategic guidance and cross-cultural expertise.</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatedSection className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
                <p className="text-lg text-gray-700 mb-4">Asentio is a strategic consultancy bridging the gap between global innovations and the U.S. consumer market.</p>
                <p className="text-lg text-gray-700 mb-4">
                  Founded by experts with deep experience in both Chinese manufacturing expertise and U.S. market knowledge, we provide the crucial insights that help products succeed across cultures.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  Our team combines technical understanding with market savvy to ensure your products resonate with American consumers while maintaining your brand's unique value proposition.
                </p>
                <p className="text-lg text-gray-700">
                  We also support U.S. brands seeking to partner with or source from Chinese companies, bridging cultural and strategic gaps on both sides.
                </p>
              </div>
              <div className="bg-asentio-lightgray p-8 rounded-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-asentio-blue rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">a</div>
                  <h3 className="text-2xl font-bold">Our Mission</h3>
                </div>
                <p className="text-gray-700 mb-6">
                  To empower Chinese consumer electronics brands to successfully adapt their products and strategies for the U.S. market, creating sustainable growth and lasting consumer relationships.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-asentio-red rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">V</div>
                  <h3 className="text-2xl font-bold">Our Values</h3>
                </div>
                <ul className="mt-4 space-y-2 text-gray-700">
                  <li>• Strategic clarity and practical guidance</li>
                  <li>• Cross-cultural understanding and respect</li>
                  <li>• Data-driven insights with creative solutions</li>
                  <li>• Long-term partnerships built on trust</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section bg-asentio-lightgray">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Why It Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-asentio-blue">The Challenge</h3>
                <p className="text-gray-700">
                  Many Chinese brands struggle to gain traction in the U.S. despite having innovative, quality products. The gap isn't about product quality—it's about understanding subtle market expectations, consumer behaviors, and cultural nuances that can make or break success.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-asentio-blue">Our Approach</h3>
                <p className="text-gray-700">
                  asentio provides the critical cross-cultural bridge, combining deep knowledge of Chinese manufacturing capabilities with nuanced understanding of U.S. consumer expectations. We help you adapt strategically without losing your brand's core identity and strengths.
                </p>
              </div>
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-asentio-blue">The asentio Difference</h3>
              <p className="text-gray-700 mb-4">
                Unlike general marketing agencies, we specialize exclusively in helping Chinese consumer electronics brands navigate the U.S. market. Our team has lived and worked extensively in both China and the United States, giving us a unique perspective on the challenges and opportunities.
              </p>
              <p className="text-gray-700">
                We don't just offer advice—we provide actionable strategies rooted in real-world experience and data-driven insights specific to your product category and target audience.
              </p>
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
    </div>;
};
export default About;