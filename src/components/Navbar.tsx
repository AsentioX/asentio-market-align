import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { TAXONOMY } from "@/lib/xrTaxonomy";

interface NavItem {
  label: string;
  to: string;
  match: (path: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "HAI Directory", to: "/hai-directory", match: (p) => p.startsWith("/hai-directory") },
  { label: "Insights", to: "/insights", match: (p) => p.startsWith("/insights") },
  { label: "Research", to: "/research", match: (p) => p.startsWith("/research") },
  { label: "About", to: "/about", match: (p) => p.startsWith("/about") },
  { label: "Work With Us", to: "/work-with-us", match: (p) => p.startsWith("/work-with-us") },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDirectoryOpen(false);
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
            src="/lovable-uploads/551d8493-0ba4-4301-99f6-ee9a98e21706.png"
            alt="Asentio — the human interface to AI"
            className="h-8"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-7">
          {NAV_ITEMS.map((item) => {
            const active = item.match(location.pathname);
            const isDirectory = item.to === "/hai-directory";

            return (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => isDirectory && setDirectoryOpen(true)}
                onMouseLeave={() => isDirectory && setDirectoryOpen(false)}
              >
                <Link
                  to={item.to}
                  className={`${linkTone} hover:text-asentio-blue transition-colors font-medium pb-1 inline-flex items-center gap-1 ${
                    active ? "border-b-2 border-asentio-red" : ""
                  }`}
                >
                  {item.label}
                  {isDirectory && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>

                {isDirectory && directoryOpen && (
                  <div className="absolute left-0 top-full pt-4">
                    <div className="w-64 bg-white rounded-lg shadow-xl border border-border py-2 animate-fade-in">
                      {TAXONOMY.map((group) => (
                        <Link
                          key={group.slug}
                          to={`/hai-directory/category/${group.slug}`}
                          className="block px-4 py-2 hover:bg-muted transition-colors"
                        >
                          <span className="block text-sm font-medium text-gray-800">{group.label}</span>
                          <span className="block text-xs text-muted-foreground">{group.blurb}</span>
                        </Link>
                      ))}
                      <div className="border-t border-border mt-2 pt-2">
                        <Link
                          to="/hai-directory/submit"
                          className="block px-4 py-2 text-sm font-medium text-asentio-red hover:bg-muted transition-colors"
                        >
                          Add Your Company
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

            <div className="px-4 pt-2 pb-1 text-xs uppercase tracking-wide text-muted-foreground">
              Directory categories
            </div>
            {TAXONOMY.map((group) => (
              <Link
                key={group.slug}
                to={`/hai-directory/category/${group.slug}`}
                className="text-gray-600 text-sm hover:text-asentio-blue transition-colors py-1.5 px-6"
              >
                {group.label}
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
