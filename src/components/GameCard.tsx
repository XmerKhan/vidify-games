import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Trophy } from 'lucide-react';
import type { GameMeta } from '../data/games';
import { categories } from '../data/games';
import { getGameStats } from '../lib/storage';
import GameThumbnail from './GameThumbnail';

const difficultyStyles: Record<string, string> = {
  Easy: 'bg-brand-100 text-brand-700',
  Medium: 'bg-accent-100 text-accent-700',
  Hard: 'bg-red-100 text-red-700',
};

export default function GameCard({ game, variant = 'default' }: { game: GameMeta; variant?: 'default' | 'compact' | 'trending' }) {
  const cat = categories[game.category];
  const stats = getGameStats(game.slug);

  if (variant === 'compact') {
    return (
      <Link
        to={`/games/${game.slug}`}
        className="card-hover group flex items-center gap-3 p-3"
      >
        <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden">
          <GameThumbnail game={game} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm text-ink-900 group-hover:text-brand-700 transition-colors truncate">
            {game.title}
          </h3>
          <p className="text-xs text-ink-500 truncate">{game.tagline}</p>
          {stats.timesPlayed > 0 && (
            <p className="text-xs text-ink-400 mt-0.5">
              {stats.timesPlayed} {stats.timesPlayed === 1 ? 'play' : 'plays'}
              {stats.bestScore > 0 && ` · Best: ${stats.bestScore}`}
            </p>
          )}
        </div>
        <ArrowRight className="h-4 w-4 text-ink-300 group-hover:text-brand-600 transition-colors shrink-0" />
      </Link>
    );
  }

  return (
    <Link
      to={`/games/${game.slug}`}
      className="card-hover group flex flex-col overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative h-32 overflow-hidden">
        <GameThumbnail game={game} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        {/* Category badge */}
        <span className={`absolute top-3 left-3 badge-${cat.color} backdrop-blur-sm`}>
          {cat.label.replace(' Games', '')}
        </span>
        {/* Difficulty badge */}
        <span className={`absolute top-3 right-3 ${difficultyStyles[game.difficulty]} badge backdrop-blur-sm`}>
          {game.difficulty}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display font-bold text-base text-ink-900 group-hover:text-brand-700 transition-colors">
          {game.title}
        </h3>
        <p className="mt-1 text-sm text-ink-500 leading-relaxed flex-1">{game.tagline}</p>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-3 text-xs text-ink-400">
          {stats.bestScore > 0 && (
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-accent-500" />
              Best: {stats.bestScore}
            </span>
          )}
          {stats.timesPlayed > 0 && (
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-accent-500" />
              {stats.timesPlayed}x
            </span>
          )}
          {stats.timesPlayed === 0 && (
            <span className="text-ink-400">Not played yet</span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand-700">
          Play now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
