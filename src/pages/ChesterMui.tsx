import { useEffect } from 'react';
import { useSeo } from '@/hooks/useSeo';
import { ChesterMuiProfile } from '@/components/profile/ChesterMuiProfile';
import { trackPageView } from '@/lib/analytics';

const ChesterMui = () => {
  useSeo({
    title: 'Chester Mui — Strategy, Finance & Market Entry Advisor | Asentio',
    description:
      'Chester Mui advises brands and technology companies on strategy, finance, market entry and scaling operations across global markets.',
    canonicalPath: '/about/chester-mui',
    type: 'profile',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/about/chester-mui');
  }, []);

  return <ChesterMuiProfile />;
};

export default ChesterMui;
