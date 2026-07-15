import { Link } from 'react-router-dom';
import { useSEO, SITE_ORIGIN, SITE_NAME } from '../lib/seo';

export default function PrivacyPage() {
  useSEO({
    title: 'Privacy Policy | Vidify Games',
    description: 'Read the Vidify Games privacy policy. We do not collect personal data. Game scores are stored locally in your browser.',
    canonicalPath: '/privacy',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'PrivacyPolicy',
      name: `Privacy Policy | ${SITE_NAME}`,
      url: `${SITE_ORIGIN}/privacy`,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_ORIGIN },
    },
  });

  return (
    <div className="container-content py-10 max-w-3xl">
      <nav className="flex items-center gap-2 text-sm text-ink-400 mb-6">
        <Link to="/" className="hover:text-ink-700">Home</Link>
        <span>/</span>
        <span className="text-ink-600">Privacy Policy</span>
      </nav>

      <h1 className="font-display font-extrabold text-3xl text-ink-900 mb-4">Privacy Policy</h1>
      <p className="text-sm text-ink-400 mb-8">Last updated: July 15, 2026</p>

      <div className="prose-edu">
        <h2>Overview</h2>
        <p>
          Vidify Games respects your privacy. This policy explains what information we collect, how we use it, and the choices you have. The short version: we do not require an account, we do not sell your data, and your game scores are stored only in your own browser.
        </p>

        <h2>Information We Collect</h2>
        <p>
          <strong>Game scores:</strong> When you play a game, your scores are saved in your browser's local storage. This data never leaves your device and is not transmitted to our servers.</p>
        <p>
          <strong>Newsletter signups:</strong> If you subscribe to our newsletter, we collect the email address you provide. We use it solely to send you updates about new games and features. You can unsubscribe at any time.</p>
        <p>
          <strong>Contact form submissions:</strong> If you contact us through our contact form, we receive the name, email, and message you provide. We use this information only to respond to your inquiry.</p>
        <p>
          <strong>Anonymous analytics:</strong> We may use third-party analytics tools to understand how visitors use the site. This data is aggregated and does not identify individual users.</p>

        <h2>Local Storage</h2>
        <p>
          Vidify Games uses browser local storage to save your game scores, achievements, and sound preferences. This data is stored entirely on your device and is not shared with us or any third party. You can clear this data at any time through your browser settings.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          Vidify Games is designed for general audiences and does not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it.
        </p>

        <h2>Your Choices</h2>
        <ul>
          <li>You can clear your saved game scores at any time by clearing your browser's local storage.</li>
          <li>You can unsubscribe from our newsletter using the link in any email we send.</li>
          <li>You can disable cookies in your browser settings.</li>
        </ul>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this privacy policy, you can reach us at <a href="mailto:hello@vidifygames.com" className="text-brand-700 font-semibold hover:underline">hello@vidifygames.com</a> or through our <Link to="/contact" className="text-brand-700 font-semibold hover:underline">contact page</Link>.
        </p>
      </div>
    </div>
  );
}
