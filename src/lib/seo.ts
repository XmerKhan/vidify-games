import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description?: string;
  keywords?: string[];
  canonicalPath?: string;
  jsonLd?: object | object[];
}

const SITE_ORIGIN = 'https://vidifygames.com';
const SITE_NAME = 'Vidify Games';

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(data: object | object[]) {
  const id = 'dynamic-jsonld';
  let el = document.getElementById(id);
  if (el) el.remove();
  el = document.createElement('script');
  el.id = id;
  el.setAttribute('type', 'application/ld+json');
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
}

export function useSEO({ title, description, keywords, canonicalPath, jsonLd }: SEOOptions) {
  useEffect(() => {
    document.title = title;
    if (description) setMeta('description', description);
    if (keywords && keywords.length) setMeta('keywords', keywords.join(', '));
    setMeta('og:title', title, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');
    if (description) setMeta('og:description', description, 'property');
    if (canonicalPath) {
      const url = canonicalPath === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${canonicalPath}`;
      setCanonical(url);
      setMeta('og:url', url, 'property');
    }
    if (jsonLd) setJsonLd(jsonLd);
  }, [title, description, keywords, canonicalPath, jsonLd]);
}

export { SITE_ORIGIN, SITE_NAME };
