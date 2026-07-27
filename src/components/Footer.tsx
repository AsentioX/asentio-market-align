import { Link } from "react-router-dom";
import { TAXONOMY } from "@/lib/xrTaxonomy";
import NewsletterSignup from "./NewsletterSignup";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const handleNavClick = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const linkClass = "text-gray-300 hover:text-white transition-colors text-sm";

  return (
    <footer className="bg-asentio-blue text-white pt-12 md:pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* Newsletter band */}
        <div className="border-b border-white/10 pb-10 mb-10">
          <NewsletterSignup source="footer" variant="dark" title="Subscribe to updates" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <img
              src="/lovable-uploads/551d8493-0ba4-4301-99f6-ee9a98e21706.png"
              alt="Asentio"
              className="h-8 mb-4 brightness-0 invert"
            />
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Asentio tracks and advises the companies building the human interface to AI —
              XR, wearables, sensing and the intelligence behind them.
            </p>
            <p className="text-gray-400 text-xs">© {currentYear} Asentio. All rights reserved.</p>
          </div>

          {/* Directory */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">XR Directory</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/xr-directory" onClick={handleNavClick} className={linkClass}>
                  Browse all companies
                </Link>
              </li>
              {TAXONOMY.map((group) => (
                <li key={group.slug}>
                  <Link to={`/xr-directory/category/${group.slug}`} onClick={handleNavClick} className={linkClass}>
                    {group.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/xr-directory/submit" onClick={handleNavClick} className="text-asentio-red hover:text-white transition-colors text-sm font-medium">
                  Add your company
                </Link>
              </li>
            </ul>
          </div>

          {/* Intelligence */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">Intelligence</h4>
            <ul className="space-y-2">
              <li><Link to="/insights" onClick={handleNavClick} className={linkClass}>Insights</Link></li>
              <li><Link to="/research" onClick={handleNavClick} className={linkClass}>Research</Link></li>
              <li><Link to="/research#market-map" onClick={handleNavClick} className={linkClass}>Market map</Link></li>
              <li><Link to="/insights" onClick={handleNavClick} className={linkClass}>Newsletter archive</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" onClick={handleNavClick} className={linkClass}>About Asentio</Link></li>
              <li><Link to="/about/jon-li" onClick={handleNavClick} className={linkClass}>Jon Li</Link></li>
              <li><Link to="/work-with-us" onClick={handleNavClick} className={linkClass}>Work with us</Link></li>
              <li><Link to="/work-with-us/speaking" onClick={handleNavClick} className={linkClass}>Speaking</Link></li>
              <li><Link to="/labs" onClick={handleNavClick} className={linkClass}>Labs</Link></li>
              <li><Link to="/contact" onClick={handleNavClick} className={linkClass}>Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">Get in touch</h4>
            <p className="text-gray-300 text-sm mb-2">info@asentio.com</p>
            <p className="text-gray-300 text-sm mb-4">www.asentio.com</p>
            <Link to="/admin" onClick={handleNavClick} className="text-gray-500 hover:text-gray-300 transition-colors text-xs">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
