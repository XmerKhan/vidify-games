import { Link } from 'react-router-dom';
import { useSEO, SITE_ORIGIN, SITE_NAME } from '../lib/seo';

export default function TermsPage() {
  useSEO({
    title: 'Terms of Service | Vidify Games',
    description: 'Read the Vidify Games terms of service. Understand the rules for using our free educational gaming platform.',
    canonicalPath: '/terms',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `Terms of Service | ${SITE_NAME}`,
      url: `${SITE_ORIGIN}/terms`,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_ORIGIN },
    },
  });

  return (
    <div className="container-content py-10 max-w-3xl">
      <nav className="flex items-center gap-2 text-sm text-ink-400 mb-6">
        <Link to="/" className="hover:text-ink-700">Home</Link>
        <span>/</span>
        <span className="text-ink-600">Terms of Service</span>
      </nav>

      <h1 className="font-display font-extrabold text-3xl text-ink-900 mb-4">Terms of Service</h1>
      <p className="text-sm text-ink-400 mb-8">Last updated: July 15, 2026</p>

      <div className="prose-edu">
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using Vidify Games (the "Site"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the Site.
        </p>

        <h2>Use of the Site</h2>
        <p>
          Vidify Games provides free educational games for personal, non-commercial use. You agree to use the Site only for its intended educational purpose and not to:
        </p>
        <ul>
          <li>Attempt to reverse-engineer, modify, or redistribute the games or their source code.</li>
          <li>Use the Site in any way that could damage, disable, or impair it.</li>
          <li>Attempt to gain unauthorized access to any part of the Site.</li>
          <li>Use automated tools to scrape or extract content from the Site.</li>
        </ul>

        <h2>Intellectual Property</h2>
        <p>
          All games, articles, designs, and content on Vidify Games are original works created by the Vidify Games team. You may play the games and read the content for free, but you may not copy, reproduce, or distribute them without permission.
        </p>

        <h2>No Warranties</h2>
        <p>
          The Site and all games are provided "as is" without warranty of any kind. We do not guarantee that the games will be error-free, uninterrupted, or perfectly accurate. Educational content is provided for informational purposes and should not be considered professional financial, technical, or academic advice.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          Vidify Games is not liable for any damages arising from the use of the Site. The games are educational tools, not professional advice. Financial concepts illustrated in our games are simplified for teaching purposes and should not be used as the basis for real financial decisions.
        </p>

        <h2>Changes to the Site</h2>
        <p>
          We may add, modify, or remove games and features at any time without notice. We may also update these Terms of Service periodically; continued use of the Site after changes constitutes acceptance of the new terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Reach us at <a href="mailto:hello@vidifygames.com" className="text-brand-700 font-semibold hover:underline">hello@vidifygames.com</a> or through our <Link to="/contact" className="text-brand-700 font-semibold hover:underline">contact page</Link>.
        </p>
      </div>
    </div>
  );
}
