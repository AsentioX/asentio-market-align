import { useEffect } from 'react';
import { useSeo } from '@/hooks/useSeo';
import { JonLiProfile } from '@/components/profile/JonLiProfile';
import { trackPageView } from '@/lib/analytics';

const JonLi = () => {
  useSeo({
    title: 'Jon Li — XR, AI & Wearables Advisor and Speaker | Asentio',
    description:
      'Jon Li leads Asentio, advising device makers, AI companies and investors on XR, wearables, human-centered design and US market strategy. Available for speaking and workshops.',
    canonicalPath: '/about/jon-li',
    type: 'profile',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/about/jon-li');
  }, []);

  return <JonLiProfile />;
};

export default JonLi;
