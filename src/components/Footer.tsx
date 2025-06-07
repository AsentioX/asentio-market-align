
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  
  return (
    <footer className="bg-asentio-blue text-white py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img 
              src="/lovable-uploads/551d8493-0ba4-4301-99f6-ee9a98e21706.png" 
              alt="asentio logo" 
              className="h-8 mb-4 brightness-0 invert"
            />
            <p className="text-gray-300 mb-4">
              {t('footer.tagline')}
            </p>
            <p className="text-gray-300">
              © {currentYear} asentio. {t('footer.copyright')}
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">{t('footer.quicklinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">{t('footer.contact')}</h4>
            <p className="text-gray-300 mb-2">info@asentio.com</p>
            <p className="text-gray-300">www.asentio.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
