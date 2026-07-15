import { useState, useMemo } from 'react';
import { Clock, CheckCircle2, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface TimelineEvent {
  description: string;
  year: number;
}

const EVENT_SETS: TimelineEvent[][] = [
  [
    { description: 'Magna Carta signed by King John of England', year: 1215 },
    { description: 'Gutenberg invents the printing press', year: 1440 },
    { description: 'Columbus reaches the Americas', year: 1492 },
    { description: 'French Revolution begins', year: 1789 },
  ],
  [
    { description: 'Fall of the Western Roman Empire', year: 476 },
    { description: 'Prophet Muhammad migrates to Medina', year: 622 },
    { description: 'Battle of Hastings — Norman conquest of England', year: 1066 },
    { description: 'Black Death sweeps across Europe', year: 1347 },
  ],
  [
    { description: 'Wright brothers achieve first powered flight', year: 1903 },
    { description: 'World War I begins', year: 1914 },
    { description: 'First human walks on the moon', year: 1969 },
    { description: 'Berlin Wall falls, ending the Cold War', year: 1989 },
  ],
  [
    { description: 'Industrial Revolution begins in England', year: 1760 },
    { description: 'American Declaration of Independence', year: 1776 },
    { description: 'Abraham Lincoln issues the Emancipation Proclamation', year: 1863 },
    { description: 'World War II ends', year: 1945 },
  ],
  [
    { description: 'The Renaissance begins in Florence, Italy', year: 1400 },
    { description: 'Martin Luther posts his 95 Theses', year: 1517 },
    { description: 'Galileo publishes his telescope observations', year: 1610 },
    { description: 'Isaac Newton publishes Principia Mathematica', year: 1687 },
  ],
  [
    { description: 'Construction of the Great Pyramid of Giza', year: -2560 },
    { description: 'Founding of the Roman Republic', year: -509 },
    { description: 'Julius Caesar is assassinated', year: -44 },
    { description: 'Emperor Constantine legalizes Christianity', year: 313 },
  ],
  [
    { description: 'The Black Death kills a third of Europe', year: 1347 },
    { description: 'The Renaissance begins in Italy', year: 1400 },
    { description: 'The Protestant Reformation starts', year: 1517 },
    { description: 'The Scientific Revolution begins', year: 1543 },
  ],
  [
    { description: 'The first modern Olympic Games are held', year: 1896 },
    { description: 'The Titanic sinks on its maiden voyage', year: 1912 },
    { description: 'Women win the right to vote in the United States', year: 1920 },
    { description: 'The first computer is built', year: 1946 },
  ],
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number }> = {
  basic: { rounds: 4 },
  tough: { rounds: 6 },
  high: { rounds: 8 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '4 rounds',
  tough: '6 rounds',
  high: '8 rounds',
};

const ACHIEVEMENTS = [
  { id: 'first-order', title: 'Timekeeper', description: 'Ordered your first timeline', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-3', title: 'Historian', description: '3 correct in a row', condition: (s: any) => s.streak >= 3 },
  { id: 'score-15', title: 'History Buff', description: 'Scored 15+ points', condition: (s: any) => s.score >= 15 },
  { id: 'perfect', title: 'Time Lord', description: 'Perfect round', condition: (s: any) => s.correct >= 8 && s.wrong === 0 },
];

export default function HistoryTimeline({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.basic;
  const totalRounds = config.rounds;

  const eventSetList = useMemo(() => [...EVENT_SETS].sort(() => Math.random() - 0.5).slice(0, totalRounds), [totalRounds]);
  const events = eventSetList[round] || [];
  const correctOrder = [...events].sort((a, b) => a.year - b.year);

  useState(() => { setOrder(events.map((_, i) => i)); });

  const moveUp = (idx: number) => {
    if (submitted || idx === 0) return;
    const newOrder = [...order];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    setOrder(newOrder);
  };

  const moveDown = (idx: number) => {
    if (submitted || idx === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    setOrder(newOrder);
  };

  const submit = () => {
    const isCorrect = order.every((origIdx, pos) => events[origIdx].year === correctOrder[pos].year);
    setSubmitted(true);
    setFeedback({ correct: isCorrect });
    if (isCorrect) { eng.onCorrect(3); setMascotTrigger(t => t + 1); setMascotWrong(false); }
    else { eng.onWrong(); setMascotTrigger(t => t + 1); setMascotWrong(true); }
  };

  const next = () => {
    if (round + 1 >= totalRounds) { setPhase('gameover'); eng.playSound('game-over'); eng.checkAchievements(eng.score); onAchievement?.(); }
    else { setRound(r => r + 1); setSubmitted(false); setFeedback(null); setOrder(eventSetList[round + 1]?.map((_, i) => i) || []); }
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff); eng.reset();
    setRound(0); setSubmitted(false); setFeedback(null);
    setOrder(eventSetList[0]?.map((_, i) => i) || []);
    setPhase('playing');
  };
  const reset = () => {
    setRound(0); eng.reset(); setSubmitted(false); setFeedback(null);
    setOrder(eventSetList[0]?.map((_, i) => i) || []);
    setPhase('playing');
  };
  const changeDifficulty = () => setPhase('difficulty');
  const resetAll = () => { setPhase('cover'); setDifficulty(null); reset(); };

  if (phase === 'cover') return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="educational" />
        <DifficultySelector title="History Timeline" description="Arrange historical events in chronological order from earliest to latest!" icon={<Clock className="h-14 w-14 text-purple-600" />} difficultyDescriptions={DIFFICULTY_DESCRIPTIONS} onSelect={startWithDifficulty} />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 15 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Results</h3>
            <div className="font-display font-extrabold text-5xl text-purple-600 mb-2 animate-pop-in">{eng.score} / {totalRounds * 3}</div>
            <p className="text-sm text-ink-500 mb-4">{eng.score >= 18 ? 'History expert!' : eng.score >= 12 ? 'Good historical sense!' : 'Keep studying history!'}</p>
            <button onClick={reset} className="btn-secondary w-full">Play Again</button>
            <button onClick={changeDifficulty} className="btn-ghost mt-2 w-full text-sm">Change Difficulty</button>
          </div>
          <div><Leaderboard slug={game.slug} score={eng.score} onPlayAgain={resetAll} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatedBackground category="educational" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} />
        <div className="mb-1 text-xs text-ink-400">Round {round + 1} / {totalRounds}</div>

        <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 mb-3">
          <p className="font-display font-semibold text-ink-900 text-sm mb-2">Arrange these events from earliest to latest:</p>
        </div>

        <div className="space-y-2.5 mb-4">
          {order.map((origIdx, pos) => {
            const event = events[origIdx];
            const correctPos = correctOrder.findIndex(e => e.year === event.year);
            const isCorrectPos = submitted && pos === correctPos;
            const isWrongPos = submitted && pos !== correctPos;
            return (
              <div key={origIdx}
                className={`rounded-lg border p-3.5 text-sm transition-all animate-slide-in-right ${
                  isCorrectPos ? 'border-brand-400 bg-brand-50' : isWrongPos ? 'border-red-300 bg-red-50' : 'border-ink-200 bg-white'
                }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs shrink-0">{pos + 1}</span>
                    <span className="text-ink-800">{event.description}</span>
                  </div>
                  {!submitted && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => moveUp(pos)} disabled={pos === 0} className="rounded p-1 text-ink-400 hover:text-purple-600 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => moveDown(pos)} disabled={pos === order.length - 1} className="rounded p-1 text-ink-400 hover:text-purple-600 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    </div>
                  )}
                  {submitted && isCorrectPos && <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0" />}
                  {submitted && isWrongPos && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                  {submitted && <span className="text-xs text-ink-400 ml-2">{event.year < 0 ? `${Math.abs(event.year)} BCE` : `${event.year} CE`}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {feedback && (
          <div className="animate-fade-in rounded-lg border border-ink-200 bg-ink-50 p-3 mb-4">
            <div className="flex items-center gap-2">
              {feedback.correct ? <CheckCircle2 className="h-5 w-5 text-brand-600 animate-check-bounce" /> : <XCircle className="h-5 w-5 text-red-500" />}
              <p className="text-sm text-ink-700">{feedback.correct ? 'Perfect chronological order!' : 'Not quite — check the years shown.'}</p>
            </div>
          </div>
        )}

        {!submitted && (
          <button onClick={submit} className="btn-primary w-full animate-glow-pulse">Submit Order</button>
        )}
        {submitted && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">{round + 1 >= totalRounds ? 'See Results' : 'Next Round'}</button>
        )}
      </div>
    </div>
  );
}
