import { useParams, Link } from 'react-router-dom';
import { categories, getGamesByCategory, type Category } from '../data/games';
import GameCard from '../components/GameCard';
import { useSEO, SITE_ORIGIN, SITE_NAME } from '../lib/seo';

const categoryIntros: Record<string, string> = {
  finance: 'Master money management through interactive finance games that make personal finance engaging and practical. From building emergency funds and climbing credit scores to simulating stock market trades and deciding whether to rent or buy a home, these games cover the full spectrum of financial literacy. Each game adapts to your skill level with adjustable difficulty, tracks your progress with local leaderboards, and rewards milestones with achievement badges. Whether you are a student learning to budget for the first time or an adult sharpening your investment instincts, these free finance games turn complex concepts into hands-on practice.',
  tech: 'Sharpen your technical and logical thinking with games designed for aspiring developers, IT professionals, and puzzle enthusiasts. Debug code, decode binary, master keyboard shortcuts, simulate logic gates, and optimize website performance — all through interactive browser-based gameplay. Difficulty scales from beginner to expert, making these tech and logic games suitable for both newcomers and seasoned professionals. Track your improvement with local leaderboards, earn achievement badges, and build real-world skills that translate directly to computer science and software engineering.',
  educational: 'Expand your general knowledge across science, geography, history, and language with educational games that adapt to your level. Match chemical elements on the periodic table, identify capital cities, sequence historical events, and race through science facts — each game offers adjustable difficulty, local leaderboards, and achievement badges to keep you motivated. These free educational games are designed for curious minds of all ages who want to learn something new while having fun. No signups, no downloads, no paywalls — just open a page and start learning.',
  kids: 'Spark a love of learning with gentle, kid-friendly games that combine playful fun with foundational skills. Count colorful critters, sort shapes, mix colors, match animals to their habitats, and build patterns — all at a relaxed pace with no harsh timers or pressure. This collection also includes logic and puzzle games like code breaking, memory matching, math sprints, and word chains that grow with young learners through adjustable difficulty levels. Every game features local leaderboards and achievement badges to celebrate progress, and the entire experience is free, browser-based, and safe for children.',
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const cat = category as Category;
  const meta = categories[cat];
  const gamesList = getGamesByCategory(cat);

  const canonicalPath = `/category/${cat}`;
  const categoryUrl = `${SITE_ORIGIN}${canonicalPath}`;

  const jsonLd = meta ? {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: meta.label,
    description: meta.description,
    url: categoryUrl,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_ORIGIN },
  } : null;

  useSEO({
    title: meta
      ? `${meta.label} — Play Free Online | ${SITE_NAME}`
      : `Category Not Found | ${SITE_NAME}`,
    description: meta?.description || 'Browse educational games by category.',
    canonicalPath: meta ? canonicalPath : undefined,
    jsonLd,
  });

  if (!meta) {
    return (
      <div className="container-content py-16 text-center">
        <h1 className="font-display font-bold text-2xl text-ink-900 mb-4">Category not found</h1>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container-content py-8">
      <nav className="flex items-center gap-2 text-sm text-ink-400 mb-4">
        <Link to="/" className="hover:text-ink-700">Home</Link>
        <span>/</span>
        <span className="text-ink-600">{meta.label}</span>
      </nav>

      <div className="mb-6">
        <h1 className="font-display font-extrabold text-3xl text-ink-900">{meta.label}</h1>
        <p className="mt-2 text-ink-500 leading-relaxed max-w-2xl">{meta.description}</p>
        <p className="mt-4 text-ink-600 leading-relaxed max-w-3xl">{categoryIntros[cat]}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gamesList.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  );
}
