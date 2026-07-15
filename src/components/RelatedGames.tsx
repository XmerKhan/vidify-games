import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { GameMeta } from '../data/games';
import { getRelatedGames } from '../data/games';

export default function RelatedGames({ slug }: { slug: string }) {
  const related = getRelatedGames(slug, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display font-bold text-xl text-ink-900 mb-4">Related Games</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((game) => (
          <RelatedCard key={game.slug} game={game} />
        ))}
      </div>
    </section>
  );
}

function RelatedCard({ game }: { game: GameMeta }) {
  const Icon = game.icon;
  return (
    <Link
      to={`/games/${game.slug}`}
      className="card-hover group flex items-center gap-3 p-4"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-700">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-sm text-ink-900 group-hover:text-brand-700 transition-colors">
          {game.title}
        </h3>
        <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{game.tagline}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-ink-300 group-hover:text-brand-600 transition-colors shrink-0" />
    </Link>
  );
}
