import { Link } from 'react-router-dom';
import { Target, Heart, Code2, Users } from 'lucide-react';
import { useSEO, SITE_ORIGIN, SITE_NAME } from '../lib/seo';

export default function AboutPage() {
  useSEO({
    title: 'About Us | Vidify Games',
    description: 'Vidify Games is a free educational gaming platform built to teach real-world skills through original, interactive games. Learn our mission and story.',
    canonicalPath: '/about',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: `About ${SITE_NAME}`,
      url: `${SITE_ORIGIN}/about`,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_ORIGIN },
    },
  });

  return (
    <div className="container-content py-10 max-w-3xl">
      <nav className="flex items-center gap-2 text-sm text-ink-400 mb-6">
        <Link to="/" className="hover:text-ink-700">Home</Link>
        <span>/</span>
        <span className="text-ink-600">About</span>
      </nav>

      <h1 className="font-display font-extrabold text-3xl text-ink-900 mb-4">About Vidify Games</h1>

      <div className="prose-edu">
        <p>
          Vidify Games started with a simple observation: the best learning happens when you are having too much fun to notice. We believe education does not have to mean dry textbooks and multiple-choice quizzes. It can mean racing the clock to convert binary numbers, cracking a color-coded cipher, or deciding whether to save or spend a windfall.
        </p>

        <h2>Our Mission</h2>
        <p>
          We build original games that teach practical skills — the kind you actually use in daily life. Budgeting, investing, debugging code, mental arithmetic, vocabulary, geography. These are not abstract academic exercises. They are the tools that help people navigate their careers, their finances, and their world with confidence.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 my-8 not-prose">
          <div className="card p-5">
            <Target className="h-6 w-6 text-brand-600 mb-2" />
            <h3 className="font-display font-bold text-ink-900">Original, Not Aggregated</h3>
            <p className="text-sm text-ink-500 mt-1">Every game on Vidify Games is built from scratch with real game logic. No embeds, no iframes, no third-party content.</p>
          </div>
          <div className="card p-5">
            <Heart className="h-6 w-6 text-brand-600 mb-2" />
            <h3 className="font-display font-bold text-ink-900">Free, Forever</h3>
            <p className="text-sm text-ink-500 mt-1">No paywalls, no signups, no downloads. We believe educational tools should be accessible to everyone.</p>
          </div>
          <div className="card p-5">
            <Code2 className="h-6 w-6 text-brand-600 mb-2" />
            <h3 className="font-display font-bold text-ink-900">Built for the Web</h3>
            <p className="text-sm text-ink-500 mt-1">Our games run in any modern browser on any device. No installs, no plugins, no friction.</p>
          </div>
          <div className="card p-5">
            <Users className="h-6 w-6 text-brand-600 mb-2" />
            <h3 className="font-display font-bold text-ink-900">Made for Learners</h3>
            <p className="text-sm text-ink-500 mt-1">Each game page includes an original article explaining the skill, how to play, and tips for improvement.</p>
          </div>
        </div>

        <h2>What Makes Us Different</h2>
        <p>
          Most game sites aggregate content from elsewhere — they embed other people's games and call it a collection. Vidify Games is the opposite. Every game here was designed and built specifically for this platform, with game mechanics chosen to reinforce a specific skill. The article below each game is not filler content; it is a genuine educational resource written to help you understand what you are learning and why it matters.
        </p>

        <h2>Who We Are</h2>
        <p>
          Vidify Games is built by a small team of developers and educators who believe the web is the most powerful learning tool ever created — if you use it right. We are not a venture-backed startup or a media conglomerate. We are people who like building things and want those things to be genuinely useful.
        </p>

        <p>
          If you have an idea for a game we should build, a skill we should teach, or just want to say hello, you can reach us through our <Link to="/contact" className="text-brand-700 font-semibold hover:underline">contact page</Link>. We read every message.
        </p>
      </div>
    </div>
  );
}
