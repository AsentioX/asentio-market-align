
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh' | 'es' | 'de';

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
    'partner.expertise.market': 'Deep understanding of both global and U.S. markets',
    'partner.expertise.team': 'Bilingual team with bicultural experience',
    'partner.expertise.insights': 'Strategic insights that bridge East and West',
    
    // CTA section
    'cta.title': 'Ready to Succeed in the U.S. Market?',
    'cta.desc': 'Let\'s discuss how we can help your consumer electronics brand achieve product-market fit in the United States.',
    'cta.contact': 'Contact Us',
    
    // About page
    'about.banner.text': 'We help consumer electronics brands achieve product-market fit in the United States through strategic guidance and cross-cultural expertise.',
    'about.who.title': 'Who We Are',
    'about.who.p1': 'Asentio is a cross-border strategic consultancy that helps international technology companies succeed in the U.S. market.',
    'about.who.p2': 'Founded by professionals with deep experience in both global and American markets, we specialize in translating global innovation into local success.',
    'about.who.p3': 'Our team blends technical expertise with cultural and market insight to ensure your product resonates with U.S. consumer and customers - without losing the essence of your brand.',
    'about.who.p4': 'We also work with U.S. companies looking to collaborate with or source from China, bridging strategic and cultural gaps to create lasting partnerships.',
    'about.team.title': 'Team',
    'about.team.chester': '20+ years experience in strategy and finance, bringing brands and products into new markets, building large teams and scaling businesses.',
    'about.team.jon': '20+ years in consumer electronics, mobile devices, and electric vehicles across China, the US and the EU. Product management + UI/UX expert.',
    'about.cta.title': 'Ready to bridge the gap?',
    'about.cta.desc': 'Let\'s discuss how our expertise can help your brand succeed in the U.S. market.',
    'about.cta.button': 'Get in Touch',
    
    // Services page
    'services.hero.title': 'Our',
    'services.hero.title.highlight': 'Services',
    'services.hero.subtitle': 'Strategic guidance to help global consumer electronics brands succeed in the U.S. market.',
    'services.what.title': 'What We Do',
    'services.what.subtitle': 'Comprehensive solutions designed to bridge the gap between global innovation and local market success',
    'services.product.title': 'Product Strategy & Market Fit',
    'services.product.item1': 'Heuristic UX/UI evaluations for U.S. users',
    'services.product.item2': 'Industrial design and packaging reviews',
    'services.product.item3': 'Cultural fit analysis to adapt branding and messaging',
    'services.product.item4': 'Competitive benchmarking',
    'services.gtm.title': 'Go-To-Market',
    'services.gtm.item1': 'Consumer and enterprise GTM strategy and execution',
    'services.gtm.item2': 'Channel development: retail, distributor, and direct sales',
    'services.gtm.item3': 'Strategic partnership identification and engagement',
    'services.gtm.item4': 'Trade show and event strategy',
    'services.branding.title': 'Branding & Communication',
    'services.branding.item1': 'Positioning and messaging tailored to Western audiences',
    'services.branding.item2': 'Visual identity consulting',
    'services.branding.item3': 'Launch narrative and marketing content support',
    'services.process.title': 'Our Process',
    'services.process.subtitle': 'A proven methodology that transforms market challenges into strategic opportunities',
    'services.process.discovery.title': 'Discovery',
    'services.process.discovery.desc': 'In-depth analysis of your product and business objectives',
    'services.process.assessment.title': 'Assessment',
    'services.process.assessment.desc': 'Market evaluation and competitive positioning analysis',
    'services.process.strategy.title': 'Strategy',
    'services.process.strategy.desc': 'Customized recommendations and action plan development',
    'services.process.implementation.title': 'Implementation',
    'services.process.implementation.desc': 'Ongoing guidance and support during execution',
    'services.cta.title': 'Ready to Transform Your',
    'services.cta.title.highlight': 'U.S. Market Approach?',
    'services.cta.subtitle': 'Contact us today to discuss how our services can help your brand succeed in the American market.',
    'services.cta.button': 'Start the Conversation',
    
    // Contact page
    'contact.hero.title': 'Contact Us',
    'contact.hero.subtitle': 'Let\'s discuss how we can help your brand succeed in the U.S. market.',
    'contact.form.title': 'Get in Touch',
    'contact.form.subtitle': 'Ready to explore how asentio can help your brand achieve product-market fit in the U.S.? We\'re here to answer your questions and discuss your specific needs.',
    'contact.form.email': 'Email',
    'contact.form.website': 'Website',
    'contact.form.how': 'How We Work',
    'contact.form.how.desc': 'After receiving your inquiry, we\'ll schedule an initial consultation to understand your specific goals and challenges. From there, we\'ll propose a tailored approach to help your brand succeed in the U.S. market.',
    'contact.form.send.title': 'Send Us a Message',
    'contact.form.name': 'Name',
    'contact.form.company': 'Company',
    'contact.form.message': 'Message',
    'contact.form.sending': 'Sending...',
    'contact.form.send': 'Send Message',
    'contact.why.title': 'Why Work With Us',
    'contact.why.focus.title': 'Specialized Focus',
    'contact.why.focus.desc': 'We exclusively help global consumer electronics brands succeed in the U.S. market.',
    'contact.why.expertise.title': 'Cross-Cultural Expertise',
    'contact.why.expertise.desc': 'Our bicultural team understands both global and American business environments.',
    'contact.why.approach.title': 'Strategic Approach',
    'contact.why.approach.desc': 'We focus on product-market fit before marketing to ensure sustainable success.',
    'contact.success.title': 'Message sent',
    'contact.success.desc': 'Thank you for contacting asentio. We\'ll be in touch soon.',
    
    // Footer
    'footer.tagline': 'Aligning Global Innovations with US Market Expectations',
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
    
    // About page
    'about.banner.text': '我们通过战略指导和跨文化专业知识，帮助消费电子品牌在美国实现产品市场契合度。',
    'about.who.title': '我们是谁',
    'about.who.p1': 'Asentio是一家跨境战略咨询公司，帮助国际科技公司在美国市场取得成功。',
    'about.who.p2': '由在中美两国市场拥有丰富经验的专业人士创立，我们专门将全球创新转化为本地成功。',
    'about.who.p3': '我们的团队将技术专长与文化和市场洞察相结合，确保您的产品与美国消费者和客户产生共鸣——同时不失去您品牌的本质。',
    'about.who.p4': '我们还与寻求与中国合作或从中国采购的美国公司合作，弥合战略和文化差距，创造持久的合作伙伴关系。',
    'about.team.title': '团队',
    'about.team.chester': '20多年战略和金融经验，将品牌和产品带入新市场，建立大型团队并扩展业务。',
    'about.team.jon': '20多年消费电子、移动设备和电动汽车领域经验，跨越中国、美国和欧盟。产品管理+UI/UX专家。',
    'about.cta.title': '准备好搭建桥梁了吗？',
    'about.cta.desc': '让我们讨论我们的专业知识如何帮助您的品牌在美国市场取得成功。',
    'about.cta.button': '联系我们',
    
    // Services page
    'services.hero.title': '我们的',
    'services.hero.title.highlight': '服务',
    'services.hero.subtitle': '为全球消费电子品牌在美国市场取得成功提供战略指导。',
    'services.what.title': '我们的服务内容',
    'services.what.subtitle': '旨在弥合全球创新与本地市场成功之间差距的综合解决方案',
    'services.product.title': '产品策略与市场契合度',
    'services.product.item1': '针对美国用户的启发式用户体验/界面评估',
    'services.product.item2': '工业设计和包装审查',
    'services.product.item3': '文化契合度分析，调整品牌和信息传递',
    'services.product.item4': '竞争对手基准分析',
    'services.gtm.title': '市场推广',
    'services.gtm.item1': '消费者和企业市场推广策略与执行',
    'services.gtm.item2': '渠道开发：零售、分销商和直销',
    'services.gtm.item3': '战略合作伙伴识别与参与',
    'services.gtm.item4': '贸易展览和活动策略',
    'services.branding.title': '品牌与传播',
    'services.branding.item1': '针对西方受众的定位和信息传递',
    'services.branding.item2': '视觉识别咨询',
    'services.branding.item3': '发布叙述和营销内容支持',
    'services.process.title': '我们的流程',
    'services.process.subtitle': '将市场挑战转化为战略机遇的成熟方法论',
    'services.process.discovery.title': '发现',
    'services.process.discovery.desc': '深入分析您的产品和业务目标',
    'services.process.assessment.title': '评估',
    'services.process.assessment.desc': '市场评估和竞争定位分析',
    'services.process.strategy.title': '策略',
    'services.process.strategy.desc': '定制建议和行动计划制定',
    'services.process.implementation.title': '实施',
    'services.process.implementation.desc': '执行过程中的持续指导和支持',
    'services.cta.title': '准备好转变您的',
    'services.cta.title.highlight': '美国市场方法了吗？',
    'services.cta.subtitle': '今天就联系我们，讨论我们的服务如何帮助您的品牌在美国市场取得成功。',
    'services.cta.button': '开始对话',
    
    // Contact page
    'contact.hero.title': '联系我们',
    'contact.hero.subtitle': '让我们讨论如何帮助您的品牌在美国市场取得成功。',
    'contact.form.title': '联系我们',
    'contact.form.subtitle': '准备好探索asentio如何帮助您的品牌在美国实现产品市场契合度？我们在这里回答您的问题并讨论您的具体需求。',
    'contact.form.email': '邮箱',
    'contact.form.website': '网站',
    'contact.form.how': '我们的工作方式',
    'contact.form.how.desc': '收到您的询问后，我们将安排初步咨询，了解您的具体目标和挑战。然后，我们将提出量身定制的方法，帮助您的品牌在美国市场取得成功。',
    'contact.form.send.title': '给我们发送消息',
    'contact.form.name': '姓名',
    'contact.form.company': '公司',
    'contact.form.message': '消息',
    'contact.form.sending': '发送中...',
    'contact.form.send': '发送消息',
    'contact.why.title': '为什么与我们合作',
    'contact.why.focus.title': '专业专注',
    'contact.why.focus.desc': '我们专门帮助全球消费电子品牌在美国市场取得成功。',
    'contact.why.expertise.title': '跨文化专业知识',
    'contact.why.expertise.desc': '我们的双文化团队了解中美两国的商业环境。',
    'contact.why.approach.title': '战略方法',
    'contact.why.approach.desc': '我们在营销之前专注于产品市场契合度，以确保可持续的成功。',
    'contact.success.title': '消息已发送',
    'contact.success.desc': '感谢您联系asentio。我们很快会与您联系。',
    
    // Footer
    'footer.tagline': '使全球创新与美国市场期望保持一致',
    'footer.copyright': '版权所有。',
    'footer.quicklinks': '快速链接',
    'footer.contact': '联系方式',
    'footer.whyus': '为什么选择asentio'
  },
  es: {} as typeof translations.en,
  de: {} as typeof translations.en
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const langTranslations = translations[language];
    const translatedValue = langTranslations[key as keyof typeof translations['en']];
    // Fall back to English if translation is missing (for es/de placeholders)
    if (!translatedValue) {
      return translations.en[key as keyof typeof translations['en']] || key;
    }
    return translatedValue;
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
