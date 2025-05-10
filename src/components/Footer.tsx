
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-asentio-blue text-white py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Asentio<span className="text-asentio-red">.</span></h3>
            <p className="text-gray-300 mb-4">
              Aligning Chinese Innovation with U.S. Market Expectations
            </p>
            <p className="text-gray-300">
              © {currentYear} Asentio. All rights reserved.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/why-asentio" className="text-gray-300 hover:text-white transition-colors">
                  Why Asentio
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Contact</h4>
            <p className="text-gray-300 mb-2">info@asentio.com</p>
            <p className="text-gray-300">www.asentio.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
