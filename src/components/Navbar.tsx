import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import whiteLogo from "@/assets/logo-asentio-white.png.asset.json";

interface NavItem {
  label: string;
  to: string;
  match: (path: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "HAI Directory", to: "/hai-directory", match: (p) => p.startsWith("/hai-directory") },
  { label: "Insights", to: "/insights", match: (p) => p.startsWith("/insights") },
  { label: "About", to: "/about", match: (p) => p.startsWith("/about") },
  { label: "Work With Us", to: "/work-with-us", match: (p) => p.startsWith("/work-with-us") },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    
  }, [location.pathname]);

  const linkTone = isScrolled ? "text-gray-700" : "text-gray-300";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 shadow-md backdrop-blur-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src={isScrolled ? "/lovable-uploads/551d8493-0ba4-4301-99f6-ee9a98e21706.png" : whiteLogo.url}
            alt="Asentio — the human interface to AI"
            className="h-8"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-7">
          {NAV_ITEMS.map((item) => {
            const active = item.match(location.pathname);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${linkTone} hover:text-asentio-blue transition-colors font-medium pb-1 inline-flex items-center gap-1 ${
                  active ? "border-b-2 border-asentio-red" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}


          <LanguageToggle />

          <Link to="/contact">
            <Button variant="default" className="bg-asentio-blue hover:bg-asentio-blue/90">
              Contact
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`lg:hidden p-2 ${linkTone}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-md py-4 animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-gray-700 hover:text-asentio-blue transition-colors py-2 px-4 font-medium"
              >
                {item.label}
              </Link>
            ))}

            <Link
              to="/hai-directory/submit"
              className="text-asentio-red font-medium py-2 px-4"
            >
              Add Your Company
            </Link>

            <div className="px-4 py-2">
              <LanguageToggle />
            </div>
            <Link to="/contact" className="bg-asentio-blue text-white py-2 px-4 rounded mx-4 text-center">
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
