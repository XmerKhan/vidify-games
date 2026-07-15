import { useState, useMemo } from 'react';
import { Palette, CheckCircle2 } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface ColorRound {
  color1: string;
  color2: string;
  result: string;
  resultName: string;
  options: string[];
}

const ROUNDS: ColorRound[] = [
  { color1: '#ef4444', color2: '#3b82f6', result: '#a855f7', resultName: 'Purple', options: ['Green', 'Purple', 'Orange', 'Brown'] },
  { color1: '#ef4444', color2: '#fbbf24', result: '#f97316', resultName: 'Orange', options: ['Orange', 'Green', 'Purple', 'Pink'] },
  { color1: '#3b82f6', color2: '#fbbf24', result: '#22c55e', resultName: 'Green', options: ['Purple', 'Orange', 'Green', 'Brown'] },
  { color1: '#ef4444', color2: '#ffffff', result: '#fca5a5', resultName: 'Pink', options: ['Pink', 'Orange', 'Purple', 'Green'] },
  { color1: '#3b82f6', color2: '#ffffff', result: '#93c5fd', resultName: 'Light Blue', options: ['Light Blue', 'Purple', 'Green', 'Pink'] },
  { color1: '#000000', color2: '#ffffff', result: '#6b7280', resultName: 'Gray', options: ['Gray', 'Brown', 'Green', 'Pink'] },
  { color1: '#ef4444', color2: '#22c55e', result: '#78350f', resultName: 'Brown', options: ['Purple', 'Brown', 'Orange', 'Gray'] },
  { color1: '#ef4444', color2: '#a855f7', result: '#7c3aed', resultName: 'Dark Purple', options: ['Dark Purple', 'Orange', 'Brown', 'Green'] },
  { color1: '#fbbf24', color2: '#22c55e', result: '#84cc16', resultName: 'Yellow-Green', options: ['Yellow-Green', 'Orange', 'Blue', 'Brown'] },
  { color1: '#3b82f6', color2: '#ef4444', result: '#a855f7', resultName: 'Purple', options: ['Green', 'Purple', 'Orange', 'Brown'] },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number }> = {
  basic: { rounds: 5 },
  tough: { rounds: 7 },
  high: { rounds: 10 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '5 color mixes',
  tough: '7 color mixes',
  high: '10 color mixes',
};

const ACHIEVEMENTS = [
  { id: 'first-mix', title: 'Color Mixer', description: 'Mixed your first colors', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Color Wizard', description: '5 correct in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'score-15', title: 'Color Expert', description: 'Scored 15+ points', condition: (s: any) => s.score >= 15 },
  { id: 'perfect', title: 'Color Master', description: 'All correct!', condition: (s: any) => s.correct >= 10 && s.wrong === 0 },
];

export default function ColorMixing({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
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

  const roundList = useMemo(() => [...ROUNDS].sort(() => Math.random() - 0.5).slice(0, totalRounds), [totalRounds]);
  const currentRound = roundList[round];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = currentRound.options[idx] === currentRound.resultName;
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
        <DifficultySelector title="Color Mixing Magic" description="Mix two colors and pick what they make! No timer, just fun!" icon={<Palette className="h-14 w-14 text-teal-600" />} difficultyDescriptions={DIFFICULTY_DESCRIPTIONS} onSelect={startWithDifficulty} />
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
            <p className="text-sm text-ink-500 mb-4">{eng.score >= 18 ? 'You\'re a color expert!' : eng.score >= 10 ? 'Great color mixing!' : 'Keep mixing those colors!'}</p>
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
        <div className="mb-1 text-xs text-ink-400">Color {round + 1} of {totalRounds}</div>

        <div key={round} className="rounded-xl bg-teal-50 border border-teal-200 p-6 mb-3 animate-slide-in-right text-center">
          <p className="text-lg font-display font-semibold text-ink-900 mb-4">What color do these make?</p>
          <div className="flex items-center justify-center gap-3">
            <div className="h-16 w-16 rounded-full shadow-md animate-pop-in" style={{ backgroundColor: currentRound?.color1 }} />
            <span className="text-3xl font-bold text-ink-400">+</span>
            <div className="h-16 w-16 rounded-full shadow-md animate-pop-in" style={{ backgroundColor: currentRound?.color2, animationDelay: '100ms' }} />
            <span className="text-3xl font-bold text-ink-400">=</span>
            <div className="h-16 w-16 rounded-full shadow-md animate-pop-in flex items-center justify-center" style={{ backgroundColor: selected !== null ? currentRound?.result : '#e5e7eb', animationDelay: '200ms' }}>
              {selected === null && <span className="text-2xl text-ink-400">?</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {currentRound?.options.map((option, idx) => {
            const isSelected = selected === idx; const showResult = selected !== null;
            const isCorrect = option === currentRound.resultName;
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={showResult}
                className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-display font-semibold transition-all animate-pop-in ${showResult ? isCorrect ? 'border-brand-400 bg-brand-50 text-brand-700' : isSelected ? 'border-red-300 bg-red-50 text-red-600 animate-shake' : 'border-ink-200 bg-white opacity-60' : 'border-ink-200 bg-white text-ink-700 hover:border-teal-300 hover:bg-teal-50/50 hover:scale-[1.02] cursor-pointer'}`}
                style={{ animationDelay: `${idx * 80}ms` }}>
                {option}
                {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-brand-600 animate-check-bounce" />}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="animate-fade-in rounded-lg border border-ink-200 bg-ink-50 p-3 mb-4 text-center">
            <p className="text-sm font-semibold text-ink-700">
              {feedback.correct ? 'That\'s right! You know your colors!' : `The answer was ${currentRound.resultName}!`}
            </p>
          </div>
        )}

        {selected !== null && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">
            {round + 1 >= totalRounds ? 'See Results' : 'Next Color'}
          </button>
        )}
      </div>
    </div>
  );
}
