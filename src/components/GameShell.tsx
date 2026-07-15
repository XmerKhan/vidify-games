import { Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import type { GameMeta, GameComponent } from '../data/games';
import { categories } from '../data/games';
import { articles } from '../data/articles';
import { useSEO, SITE_ORIGIN, SITE_NAME } from '../lib/seo';
import RelatedGames from './RelatedGames';
import FeedbackOverlay from './FeedbackOverlay';
import { AchievementToast, AchievementList } from './AchievementDisplay';

interface GameShellProps {
  game: GameMeta;
  component: GameComponent;
}

export default function GameShell({ game, component }: GameShellProps) {
  const Icon = game.icon;
  const cat = categories[game.category];
  const GameComponent = component;
  const [achievementTrigger, setAchievementTrigger] = useState(0);

  const canonicalPath = `/games/${game.slug}`;
  const gameUrl = `${SITE_ORIGIN}${canonicalPath}`;
  const categoryUrl = `${SITE_ORIGIN}/category/${game.category}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Game',
      name: game.title,
      description: game.metaDescription,
      applicationCategory: 'Game',
      gamePlatform: 'Web Browser',
      operatingSystem: 'Any',
      url: gameUrl,
      genre: cat.label,
      author: { '@type': 'Organization', name: SITE_NAME },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: cat.label, item: categoryUrl },
        { '@type': 'ListItem', position: 3, name: game.title, item: gameUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `How do I play ${game.title}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${game.description} Choose a difficulty level, then follow the on-screen instructions to start playing.`,
          },
        },
        {
          '@type': 'Question',
          name: `Is ${game.title} free to play?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Yes, ${game.title} is completely free to play. No signup, no download, and no payment required. Just open the page and start playing.`,
          },
        },
        {
          '@type': 'Question',
          name: `Does ${game.title} save my scores?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, your scores are saved locally in your browser using local storage. You can compete against yourself on the local leaderboard. Clearing your browser data will reset your scores.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to Play ${game.title}`,
      description: game.metaDescription,
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Select difficulty', text: 'Choose from Easy, Medium, or Hard difficulty level based on your experience.' },
        { '@type': 'HowToStep', position: 2, name: 'Read the instructions', text: game.tagline },
        { '@type': 'HowToStep', position: 3, name: 'Start playing', text: 'Follow the on-screen prompts and interact with the game to score points.' },
        { '@type': 'HowToStep', position: 4, name: 'Check your score', text: 'View your results on the local leaderboard and try to beat your high score.' },
      ],
    },
  ];

  useSEO({
    title: game.metaTitle,
    description: game.metaDescription,
    keywords: game.keywords,
    canonicalPath,
    jsonLd,
  });

  return (
    <div className="container-content py-6 lg:py-8">
      <FeedbackOverlay />
      <AchievementToast slug={game.slug} trigger={achievementTrigger} />
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-ink-400 mb-4">
          <Link to="/" className="hover:text-ink-700">Home</Link>
          <span>/</span>
          <Link to={`/category/${game.category}`} className="hover:text-ink-700">{cat.label}</Link>
          <span>/</span>
          <span className="text-ink-600">{game.shortTitle}</span>
        </nav>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${cat.color}-100 text-${cat.color}-700`}>
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-ink-900">{game.title}</h1>
            <p className="text-sm text-ink-500">{game.tagline}</p>
          </div>
        </div>

        {/* Game */}
        <div className="card p-4 sm:p-6 mb-6 relative overflow-hidden">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center text-ink-400 text-sm">
                Loading game...
              </div>
            }
          >
            <GameComponent game={game} onAchievement={() => setAchievementTrigger((t) => t + 1)} />
          </Suspense>
        </div>

        {/* Leaderboard + Achievements */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-accent-500" />
              <h3 className="font-semibold text-sm text-ink-900">Leaderboard</h3>
            </div>
            <p className="text-xs text-ink-400">
              Scores are saved locally in your browser. Play again to climb the board!
            </p>
          </div>
          <AchievementList slug={game.slug} />
        </div>

        {/* Article */}
        <article className="prose-edu max-w-none">
          <div dangerouslySetInnerHTML={{ __html: articles[game.article.body] }} />
        </article>

        {/* Related games */}
        <RelatedGames slug={game.slug} />

        {/* Back link */}
        <div className="mt-8">
          <Link
            to={`/category/${game.category}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            More {cat.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
