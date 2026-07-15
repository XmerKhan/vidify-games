import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Brain, Menu, X } from 'lucide-react';
import { categories } from '../data/games';
import SoundToggle from './SoundToggle';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-ink-200">
      <nav className="container-content flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-lg text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Brain className="h-5 w-5" />
          </span>
          Vidify Games
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {Object.entries(categories).map(([key, cat]) => (
            <NavLink
              key={key}
              to={`/category/${key}`}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
                }`
              }
            >
              {cat.label}
            </NavLink>
          ))}
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
              }`
            }
          >
            About
          </NavLink>
          <SoundToggle />
        </div>

        <button
          className="md:hidden p-2 rounded-lg text-ink-700 hover:bg-ink-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-ink-200 bg-white">
          <div className="container-content py-3 space-y-1">
            {Object.entries(categories).map(([key, cat]) => (
              <Link
                key={key}
                to={`/category/${key}`}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                {cat.label}
              </Link>
            ))}
            <Link to="/about" className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100">
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
