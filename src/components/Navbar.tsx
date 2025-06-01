
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/95 shadow-md backdrop-blur-sm py-3" : "bg-transparent py-5"
    }`}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/551d8493-0ba4-4301-99f6-ee9a98e21706.png" 
            alt="asentio logo" 
            className="h-8"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-asentio-blue transition-colors font-medium">
            Home
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-asentio-blue transition-colors font-medium">
            About
          </Link>
          <Link to="/services" className="text-gray-700 hover:text-asentio-blue transition-colors font-medium">
            Services
          </Link>
          <Link to="/why-asentio" className="text-gray-700 hover:text-asentio-blue transition-colors font-medium">Why Us</Link>
          <Link to="/contact">
            <Button variant="default" className="bg-asentio-blue hover:bg-asentio-blue/90">
              Contact Us
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md py-4 animate-fade-in">
          <div className="container mx-auto flex flex-col space-y-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-asentio-blue transition-colors py-2 px-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-asentio-blue transition-colors py-2 px-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/services"
              className="text-gray-700 hover:text-asentio-blue transition-colors py-2 px-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/why-asentio"
              className="text-gray-700 hover:text-asentio-blue transition-colors py-2 px-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Why asentio
            </Link>
            <Link
              to="/contact"
              className="bg-asentio-blue text-white py-2 px-4 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
