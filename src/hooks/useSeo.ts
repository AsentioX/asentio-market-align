import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  type?: string;
}

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

/**
 * Native DOM head management (the pattern used across the Asentio site).
 */
export const useSeo = ({ title, description, canonicalPath, ogImage, type = 'website' }: SeoOptions) => {
  useEffect(() => {
    document.title = title;
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:type', type);
    setMeta('name', 'twitter:title', title);

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }
    if (ogImage) {
      setMeta('property', 'og:image', ogImage);
      setMeta('name', 'twitter:image', ogImage);
    }

    if (canonicalPath) {
      const href = `https://asentio.com${canonicalPath}`;
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = href;
      setMeta('property', 'og:url', href);
    }
  }, [title, description, canonicalPath, ogImage, type]);
};

export default useSeo;
