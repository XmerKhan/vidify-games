import { Link } from 'react-router-dom';
import { Brain, Mail } from 'lucide-react';
import { categories } from '../data/games';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="container-content py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-lg text-ink-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Brain className="h-5 w-5" />
              </span>
              Vidify Games
            </Link>
            <p className="mt-3 text-sm text-ink-500 leading-relaxed">
              Free educational games that teach real-world skills. Learn while you play, level up your mind.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-900 mb-3">Categories</h3>
            <ul className="space-y-2">
              {Object.entries(categories).map(([key, cat]) => (
                <li key={key}>
                  <Link to={`/category/${key}`} className="text-sm text-ink-500 hover:text-brand-700">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-900 mb-3">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-ink-500 hover:text-brand-700">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-ink-500 hover:text-brand-700">Contact</Link></li>
              <li><Link to="/privacy" className="text-sm text-ink-500 hover:text-brand-700">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-ink-500 hover:text-brand-700">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-900 mb-3">Get in touch</h3>
            <a
              href="mailto:hello@vidifygames.com"
              className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-brand-700"
            >
              <Mail className="h-4 w-4" />
              hello@vidifygames.com
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-ink-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-400">
            &copy; {new Date().getFullYear()} Vidify Games. All games are original works built for educational use.
          </p>
          <p className="text-xs text-ink-400">
            Built for learners, not for profit.
          </p>
        </div>
      </div>
    </footer>
  );
}
