import { useState, useMemo } from 'react';
import { Shapes, CheckCircle2 } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

type ShapeType = 'circle' | 'square' | 'triangle' | 'star';

interface ShapeRound {
  shape: ShapeType;
  color: string;
  options: ShapeType[];
}

const SHAPES: ShapeRound[] = [
  { shape: 'circle', color: '#14b8a6', options: ['circle', 'square', 'triangle', 'star'] },
  { shape: 'square', color: '#fbbf24', options: ['star', 'square', 'circle', 'triangle'] },
  { shape: 'triangle', color: '#f97316', options: ['triangle', 'star', 'square', 'circle'] },
  { shape: 'star', color: '#a855f7', options: ['circle', 'triangle', 'star', 'square'] },
  { shape: 'circle', color: '#3b82f6', options: ['square', 'star', 'circle', 'triangle'] },
  { shape: 'square', color: '#ef4444', options: ['triangle', 'circle', 'star', 'square'] },
  { shape: 'triangle', color: '#14b8a6', options: ['star', 'circle', 'triangle', 'square'] },
  { shape: 'star', color: '#fbbf24', options: ['square', 'triangle', 'circle', 'star'] },
  { shape: 'circle', color: '#a855f7', options: ['triangle', 'circle', 'star', 'square'] },
  { shape: 'square', color: '#3b82f6', options: ['circle', 'star', 'square', 'triangle'] },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number }> = {
  basic: { rounds: 5 },
  tough: { rounds: 8 },
  high: { rounds: 10 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '5 shapes',
  tough: '8 shapes',
  high: '10 shapes',
};

const ACHIEVEMENTS = [
  { id: 'first-shape', title: 'Shape Star', description: 'Sorted your first shape', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Shape Sorter', description: '5 correct in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'score-15', title: 'Shape Master', description: 'Scored 15+ points', condition: (s: any) => s.score >= 15 },
  { id: 'perfect', title: 'Geometry Genius', description: 'All correct!', condition: (s: any) => s.correct >= 10 && s.wrong === 0 },
];

function ShapeIcon({ shape, color, size = 60 }: { shape: ShapeType; color: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 60 60' };
  switch (shape) {
    case 'circle':
      return <svg {...common}><circle cx="30" cy="30" r="25" fill={color} /></svg>;
    case 'square':
      return <svg {...common}><rect x="5" y="5" width="50" height="50" rx="6" fill={color} /></svg>;
    case 'triangle':
      return <svg {...common}><path d="M30 5 L55 50 L5 50 Z" fill={color} /></svg>;
    case 'star':
      return <svg {...common}><path d="M30 5 L37 22 L55 22 L41 33 L46 52 L30 42 L14 52 L19 33 L5 22 L23 22 Z" fill={color} /></svg>;
  }
}

export default function ShapeSorter({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.basic;
  const totalRounds = config.rounds;

  const shapeList = useMemo(() => [...SHAPES].sort(() => Math.random() - 0.5).slice(0, totalRounds), [totalRounds]);
  const currentShape = shapeList[round];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = currentShape.options[idx] === currentShape.shape;
    setFeedback({ correct: isCorrect });
    if (isCorrect) { eng.onCorrect(2); setMascotTrigger(t => t + 1); setMascotWrong(false); }
    else { eng.onWrong(); setMascotTrigger(t => t + 1); setMascotWrong(true); }
  };

  const next = () => {
    if (round + 1 >= totalRounds) { setPhase('gameover'); eng.playSound('game-over'); eng.checkAchievements(eng.score); onAchievement?.(); }
    else { setRound(r => r + 1); setSelected(null); setFeedback(null); }
  };

  const startWithDifficulty = (diff: Difficulty) => { setDifficulty(diff); eng.reset(); setPhase('playing'); };
  const reset = () => { setRound(0); eng.reset(); setSelected(null); setFeedback(null); setPhase('playing'); };
  const changeDifficulty = () => setPhase('difficulty');
  const resetAll = () => { setPhase('cover'); setDifficulty(null); reset(); };

  if (phase === 'cover') return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="kids" />
        <DifficultySelector title="Shape Sorter" description="Sort the shapes into the right baskets! No timer, just fun!" icon={<Shapes className="h-14 w-14 text-teal-600" />} difficultyDescriptions={DIFFICULTY_DESCRIPTIONS} onSelect={startWithDifficulty} />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 15 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Great Job!</h3>
            <div className="font-display font-extrabold text-5xl text-teal-600 mb-2 animate-pop-in">{eng.score}</div>
            <p className="text-sm text-ink-500 mb-4">{eng.score >= 18 ? 'You know all your shapes!' : eng.score >= 10 ? 'Great shape sorting!' : 'Keep practicing your shapes!'}</p>
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
      <AnimatedBackground category="kids" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} />
        <div className="mb-1 text-xs text-ink-400">Shape {round + 1} of {totalRounds}</div>

        <div key={round} className="rounded-xl bg-teal-50 border border-teal-200 p-6 mb-3 animate-slide-in-right text-center">
          <p className="text-lg font-display font-semibold text-ink-900 mb-3">Which basket does this shape go in?</p>
          <div className="flex justify-center">
            {currentShape && <div className="animate-mascot-bounce"><ShapeIcon shape={currentShape.shape} color={currentShape.color} size={80} /></div>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {currentShape?.options.map((option, idx) => {
            const isSelected = selected === idx; const showResult = selected !== null;
            const isCorrect = option === currentShape.shape;
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={showResult}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all animate-pop-in ${showResult ? isCorrect ? 'border-brand-400 bg-brand-50' : isSelected ? 'border-red-300 bg-red-50 animate-shake' : 'border-ink-200 bg-white opacity-60' : 'border-ink-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 hover:scale-[1.02] cursor-pointer'}`}
                style={{ animationDelay: `${idx * 80}ms` }}>
                <ShapeIcon shape={option} color="#6b7280" size={50} />
                <span className="text-sm font-semibold text-ink-700 capitalize">{option}</span>
                {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-brand-600 animate-check-bounce" />}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="animate-fade-in rounded-lg border border-ink-200 bg-ink-50 p-3 mb-4 text-center">
            <p className="text-sm font-semibold text-ink-700">
              {feedback.correct ? 'That\'s right! Great job!' : 'Try again next time — you can do it!'}
            </p>
          </div>
        )}

        {selected !== null && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">
            {round + 1 >= totalRounds ? 'See Results' : 'Next Shape'}
          </button>
        )}
      </div>
    </div>
  );
}
