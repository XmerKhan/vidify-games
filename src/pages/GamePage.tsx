import { lazy } from 'react';
import { useParams } from 'react-router-dom';
import { getGame, type GameComponent } from '../data/games';
import GameShell from '../components/GameShell';
import NotFoundPage from './NotFoundPage';

const gameComponents: Record<string, GameComponent> = {
  'budget-master': lazy(() => import('../games/BudgetMaster')),
  'stock-market-simulator': lazy(() => import('../games/StockMarketSimulator')),
  'save-or-spend': lazy(() => import('../games/SaveOrSpend')),
  'code-breaker': lazy(() => import('../games/CodeBreaker')),
  'bug-hunter': lazy(() => import('../games/BugHunter')),
  'binary-blitz': lazy(() => import('../games/BinaryBlitz')),
  'word-chain-challenge': lazy(() => import('../games/WordChainChallenge')),
  'memory-grid': lazy(() => import('../games/MemoryGrid')),
  'math-sprint': lazy(() => import('../games/MathSprint')),
  'geo-quiz': lazy(() => import('../games/GeoQuiz')),
  'credit-score-climb': lazy(() => import('../games/CreditScoreClimb')),
  'rent-vs-buy': lazy(() => import('../games/RentVsBuy')),
  'retirement-countdown': lazy(() => import('../games/RetirementCountdown')),
  'emergency-fund-builder': lazy(() => import('../games/EmergencyFundBuilder')),
  'insurance-matcher': lazy(() => import('../games/InsuranceMatcher')),
  'typing-speed': lazy(() => import('../games/TypingSpeed')),
  'shortcut-master': lazy(() => import('../games/ShortcutMaster')),
  'logic-gate-sim': lazy(() => import('../games/LogicGateSim')),
  'website-speed': lazy(() => import('../games/WebsiteSpeed')),
  'tech-acronym-decoder': lazy(() => import('../games/TechAcronymDecoder')),
  'capital-city': lazy(() => import('../games/CapitalCity')),
  'science-fact-sprint': lazy(() => import('../games/ScienceFactSprint')),
  'periodic-table-blitz': lazy(() => import('../games/PeriodicTableBlitz')),
  'history-timeline': lazy(() => import('../games/HistoryTimeline')),
  'world-currency': lazy(() => import('../games/WorldCurrency')),
  'shape-sorter': lazy(() => import('../games/ShapeSorter')),
  'animal-habitat': lazy(() => import('../games/AnimalHabitat')),
  'counting-critters': lazy(() => import('../games/CountingCritters')),
  'color-mixing': lazy(() => import('../games/ColorMixing')),
  'pattern-builder': lazy(() => import('../games/PatternBuilder')),
};

export default function GamePage() {
  const { slug } = useParams<{ slug: string }>();
  const game = slug ? getGame(slug) : undefined;

  if (!game) return <NotFoundPage />;

  const Component = gameComponents[game.slug];
  if (!Component) return <NotFoundPage />;

  return <GameShell game={game} component={Component} />;
}
