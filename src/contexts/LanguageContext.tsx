
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.why': 'Why Us',
    'nav.contact': 'Contact Us',
    
    // Hero section
    'hero.title': 'Translating Innovations for the US Market',
    'hero.subtitle': 'Building meaningful partnerships between manufacturers and US consumers.',
    'hero.cta': 'Talk to Us',
    
    // Expertise section
    'expertise.title': 'Our Expertise',
    'expertise.pmf.title': 'Product-Market Fit',
    'expertise.pmf.desc': 'We analyze U.S. consumer expectations and preferences to align your products with market demands.',
    'expertise.localization.title': 'Localization Advisory',
    'expertise.localization.desc': 'Cultural nuances matter. We help adapt your product, messaging, and experience for U.S. consumers.',
    'expertise.channel.title': 'Channel Strategy',
    'expertise.channel.desc': 'Navigate the complex U.S. retail and e-commerce landscape with our expert guidance.',
    'expertise.learn': 'Learn more',
    
    // Strategic partner section
    'partner.title': 'A Strategic Partner',
    'partner.desc': 'asentio combines deep market knowledge with cross-cultural expertise to help your brand navigate the crucial product-market fit challenges in the U.S.',
    'partner.cta': 'Why Choose asentio',
    'partner.expertise.title': 'Cross-Cultural Expertise',
    'partner.expertise.market': 'Deep understanding of both Chinese and U.S. markets',
    'partner.expertise.team': 'Bilingual team with bicultural experience',
    'partner.expertise.insights': 'Strategic insights that bridge East and West',
    
    // CTA section
    'cta.title': 'Ready to Succeed in the U.S. Market?',
    'cta.desc': 'Let\'s discuss how we can help your consumer electronics brand achieve product-market fit in the United States.',
    'cta.contact': 'Contact Us',
    
    // Footer
    'footer.tagline': 'Aligning Chinese Innovation with U.S. Market Expectations',
    'footer.copyright': 'All rights reserved.',
    'footer.quicklinks': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.whyus': 'Why asentio'
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.about': '关于我们',
    'nav.services': '服务',
    'nav.why': '为什么选择我们',
    'nav.contact': '联系我们',
    
    // Hero section
    'hero.title': '为美国市场转化创新',
    'hero.subtitle': '在制造商和美国消费者之间建立有意义的合作伙伴关系。',
    'hero.cta': '联系我们',
    
    // Expertise section
    'expertise.title': '我们的专业能力',
    'expertise.pmf.title': '产品市场契合度',
    'expertise.pmf.desc': '我们分析美国消费者的期望和偏好，使您的产品与市场需求保持一致。',
    'expertise.localization.title': '本土化咨询',
    'expertise.localization.desc': '文化细节很重要。我们帮助您调整产品、信息传递和用户体验以适应美国消费者。',
    'expertise.channel.title': '渠道策略',
    'expertise.channel.desc': '在我们专家指导下，导航复杂的美国零售和电子商务环境。',
    'expertise.learn': '了解更多',
    
    // Strategic partner section
    'partner.title': '战略合作伙伴',
    'partner.desc': 'asentio结合深厚的市场知识和跨文化专业能力，帮助您的品牌应对在美国市场的关键产品市场契合度挑战。',
    'partner.cta': '为什么选择asentio',
    'partner.expertise.title': '跨文化专业能力',
    'partner.expertise.market': '深度了解中美两国市场',
    'partner.expertise.team': '具有双文化经验的双语团队',
    'partner.expertise.insights': '连接东西方的战略洞察',
    
    // CTA section
    'cta.title': '准备好在美国市场取得成功了吗？',
    'cta.desc': '让我们讨论如何帮助您的消费电子品牌在美国实现产品市场契合度。',
    'cta.contact': '联系我们',
    
    // Footer
    'footer.tagline': '使中国创新与美国市场期望保持一致',
    'footer.copyright': '版权所有。',
    'footer.quicklinks': '快速链接',
    'footer.contact': '联系方式',
    'footer.whyus': '为什么选择asentio'
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
