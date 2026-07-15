import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Wallet, Code2, Globe, Sparkles, Trophy, Zap, TrendingUp, Star, Flame, Baby } from 'lucide-react';
import { games, categories } from '../data/games';
import GameCard from '../components/GameCard';
import NewsletterSignup from '../components/NewsletterSignup';
import { useSEO } from '../lib/seo';
import { getGameStats } from '../lib/storage';

export default function HomePage() {
  useSEO({
    title: 'Vidify Games — Learn While You Play | Free Educational Games',
    description:
      'Vidify Games offers free original educational games for brain-training, finance literacy, and tech skills. Play, learn, and level up your mind.',
    keywords: ['educational games', 'brain training', 'finance games', 'logic games', 'free learning games'],
    canonicalPath: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Vidify Games',
      url: 'https://vidifygames.com',
      description: 'Free educational gaming platform with original brain-training, finance literacy, and tech-skill games.',
      email: 'hello@vidifygames.com',
    },
  });

  // Recommended: games sorted by best score (most played first)
  const recommended = [...games].sort((a, b) => {
    const sa = getGameStats(a.slug);
    const sb = getGameStats(b.slug);
    return sb.timesPlayed - sa.timesPlayed || sb.bestScore - sa.bestScore;
  }).slice(0, 3);

  // Trending: mix of categories, rotated
  const trending = [...games].sort((a, b) => {
    const sa = getGameStats(a.slug);
    const sb = getGameStats(b.slug);
    return (sb.bestScore + sb.timesPlayed * 10) - (sa.bestScore + sa.timesPlayed * 10);
  }).slice(0, 4);

  // New games: reverse order to show "newest"
  const newGames = [...games].reverse().slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-ink-900">
        {/* Decorative shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 h-40 w-40 rounded-full bg-brand-300 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-32 w-32 rounded-full bg-info-400 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-purple-400 blur-2xl" />
        </div>
        <div className="container-content py-16 lg:py-24 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs font-semibold text-white mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Learn while you play
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
              Train your brain with games that teach <span className="text-brand-300">real skills</span>.
            </h1>
            <p className="mt-5 text-lg text-brand-100 leading-relaxed max-w-xl">
              Vidify Games is a free collection of original educational games. Budget a salary, trade fake stocks, crack codes, and more — every game is built from scratch to teach something useful.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/games/budget-master" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 active:scale-[0.98] transition-all shadow-soft">
                Start Playing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 active:scale-[0.98] transition-all">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-content py-8">
        <h2 className="font-display font-bold text-2xl text-ink-900 mb-6">Explore by Category</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categories).map(([key, cat]) => {
            const icons: Record<string, typeof Wallet> = {
              finance: Wallet,
              tech: Code2,
              educational: Globe,
              kids: Baby,
            };
            const Icon = icons[key];
            return (
              <Link
                key={key}
                to={`/category/${key}`}
                className="card-hover group p-5"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-${cat.color}-100 text-${cat.color}-700`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display font-bold text-base text-ink-900 group-hover:text-brand-700 transition-colors">
                  {cat.label}
                </h3>
                <p className="mt-1 text-sm text-ink-500 leading-relaxed">{cat.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recommended for You */}
      <section className="container-content py-8">
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-6 w-6 text-accent-500" />
          <h2 className="font-display font-bold text-2xl text-ink-900">Recommended for You</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>

      {/* Trending Games - horizontal scroll style */}
      <section className="bg-gradient-to-b from-ink-50 to-white border-y border-ink-200">
        <div className="container-content py-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6 text-info-600" />
            <h2 className="font-display font-bold text-2xl text-ink-900">Trending Games</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </div>
      </section>

      {/* New Games - compact list style */}
      <section className="container-content py-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="font-display font-bold text-2xl text-ink-900">New Games</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {newGames.map((game) => (
            <GameCard key={game.slug} game={game} variant="compact" />
          ))}
        </div>
      </section>

      {/* Why play with us */}
      <section className="bg-white border-y border-ink-200">
        <div className="container-content py-12">
          <h2 className="font-display font-bold text-2xl text-ink-900 text-center mb-8">Why Play With Us</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Brain className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-display font-bold text-base text-ink-900">Original Games</h3>
              <p className="mt-1 text-sm text-ink-500 leading-relaxed">
                Every game is built from scratch with real logic — no embeds, no iframes, no third-party games.
              </p>
            </div>
            <div className="text-center">
              <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-info-100 text-info-700">
                <Zap className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-display font-bold text-base text-ink-900">Real Skills</h3>
              <p className="mt-1 text-sm text-ink-500 leading-relaxed">
                Each game teaches a practical skill: budgeting, debugging, binary, vocabulary, geography, and more.
              </p>
            </div>
            <div className="text-center">
              <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-accent-100 text-accent-700">
                <Trophy className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-display font-bold text-base text-ink-900">Track Progress</h3>
              <p className="mt-1 text-sm text-ink-500 leading-relaxed">
                Local leaderboards and achievement badges save automatically. Compete with yourself and improve.
              </p>
            </div>
            <div className="text-center">
              <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Flame className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-display font-bold text-base text-ink-900">Always Free</h3>
              <p className="mt-1 text-sm text-ink-500 leading-relaxed">
                No paywalls, no signups, no downloads. Just open a page and start learning through play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* All games */}
      <section className="container-content py-12">
        <h2 className="font-display font-bold text-2xl text-ink-900 mb-6">All Games</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-brand-600">
        <div className="container-content py-12">
          <div className="max-w-2xl">
            <h2 className="font-display font-bold text-2xl text-white mb-2">Get notified when we add new games</h2>
            <p className="text-brand-100 mb-5 text-sm leading-relaxed">
              We are always building new educational games. Drop your email and we will let you know when something new lands. No spam, ever.
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </div>
  );
}
