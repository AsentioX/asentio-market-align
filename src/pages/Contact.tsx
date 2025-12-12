
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import AnimatedSection from "@/components/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";
import TopographicPattern from "@/components/TopographicPattern";
import { Mail, Globe, MessageSquare, Target, Users, Zap } from "lucide-react";

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: t('contact.success.title'),
        description: t('contact.success.desc'),
      });
      setFormData({
        name: "",
        company: "",
        email: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const whyItems = [
    {
      icon: Target,
      titleKey: 'contact.why.focus.title',
      descKey: 'contact.why.focus.desc',
    },
    {
      icon: Users,
      titleKey: 'contact.why.expertise.title',
      descKey: 'contact.why.expertise.desc',
    },
    {
      icon: Zap,
      titleKey: 'contact.why.approach.title',
      descKey: 'contact.why.approach.desc',
    },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-asentio-blue text-white py-24 relative overflow-hidden">
        <TopographicPattern variant="dark" className="opacity-100" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-asentio-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-asentio-red/5 rounded-full blur-2xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-12 h-1 bg-asentio-red mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t('contact.hero.title')}</h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              {t('contact.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <AnimatedSection className="py-24 bg-background relative">
        <TopographicPattern className="opacity-30" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left side - Contact info */}
              <div>
                <div className="w-12 h-1 bg-asentio-red mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">{t('contact.form.title')}</h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {t('contact.form.subtitle')}
                </p>
                
                <div className="space-y-6">
                  <div className="group flex items-start gap-4">
                    <div className="w-12 h-12 bg-asentio-blue/10 rounded-lg flex items-center justify-center group-hover:bg-asentio-red/10 transition-colors flex-shrink-0">
                      <Mail className="w-5 h-5 text-asentio-blue group-hover:text-asentio-red transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-foreground">{t('contact.form.email')}</h3>
                      <a href="mailto:info@asentio.com" className="text-asentio-blue hover:text-asentio-red transition-colors">
                        info@asentio.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="group flex items-start gap-4">
                    <div className="w-12 h-12 bg-asentio-blue/10 rounded-lg flex items-center justify-center group-hover:bg-asentio-red/10 transition-colors flex-shrink-0">
                      <Globe className="w-5 h-5 text-asentio-blue group-hover:text-asentio-red transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-foreground">{t('contact.form.website')}</h3>
                      <a href="https://www.asentio.com" target="_blank" rel="noopener noreferrer" className="text-asentio-blue hover:text-asentio-red transition-colors">
                        www.asentio.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="group flex items-start gap-4">
                    <div className="w-12 h-12 bg-asentio-blue/10 rounded-lg flex items-center justify-center group-hover:bg-asentio-red/10 transition-colors flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-asentio-blue group-hover:text-asentio-red transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-foreground">{t('contact.form.how')}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {t('contact.form.how.desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Form */}
              <div>
                <div className="group relative bg-card p-8 rounded-xl border border-border hover:border-asentio-red/30 transition-all duration-300 hover:shadow-xl hover:shadow-asentio-red/5">
                  <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red rounded-l-xl transition-all duration-300 group-hover:h-full" />
                  
                  <h3 className="text-2xl font-semibold mb-6 text-foreground">{t('contact.form.send.title')}</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        {t('contact.form.name')}
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-background border-border focus:border-asentio-blue"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                        {t('contact.form.company')}
                      </label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="bg-background border-border focus:border-asentio-blue"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        {t('contact.form.email')}
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-background border-border focus:border-asentio-blue"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        {t('contact.form.message')}
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="min-h-[120px] bg-background border-border focus:border-asentio-blue"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-asentio-blue hover:bg-asentio-blue/90 py-6 text-base font-medium shadow-lg shadow-asentio-blue/20 transition-all hover:shadow-xl"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Why Work With Us Section */}
      <AnimatedSection className="py-24 bg-muted relative">
        <TopographicPattern className="opacity-20" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-12 h-1 bg-asentio-red mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">{t('contact.why.title')}</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {whyItems.map((item, index) => (
                <div 
                  key={index}
                  className="group relative bg-card p-8 rounded-xl border border-border hover:border-asentio-red/30 transition-all duration-300 hover:shadow-xl hover:shadow-asentio-red/5"
                >
                  <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red rounded-l-xl transition-all duration-300 group-hover:h-full" />
                  
                  <div className="w-12 h-12 bg-asentio-blue/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-asentio-red/10 transition-colors">
                    <item.icon className="w-6 h-6 text-asentio-blue group-hover:text-asentio-red transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{t(item.titleKey)}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Contact;
