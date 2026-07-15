import { useState, useMemo, useEffect } from 'react';
import { Zap, CheckCircle2, XCircle } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface Shortcut {
  action: string;
  shortcut: string;
  options: string[];
}

const SHORTCUTS: Shortcut[] = [
  { action: 'Copy', shortcut: 'Ctrl+C', options: ['Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Ctrl+Z'] },
  { action: 'Paste', shortcut: 'Ctrl+V', options: ['Ctrl+P', 'Ctrl+V', 'Ctrl+C', 'Ctrl+S'] },
  { action: 'Undo', shortcut: 'Ctrl+Z', options: ['Ctrl+Y', 'Ctrl+U', 'Ctrl+Z', 'Ctrl+A'] },
  { action: 'Redo', shortcut: 'Ctrl+Y', options: ['Ctrl+R', 'Ctrl+Y', 'Ctrl+Z', 'Ctrl+N'] },
  { action: 'Select All', shortcut: 'Ctrl+A', options: ['Ctrl+S', 'Ctrl+A', 'Ctrl+F', 'Ctrl+D'] },
  { action: 'Find', shortcut: 'Ctrl+F', options: ['Ctrl+F', 'Ctrl+H', 'Ctrl+G', 'Ctrl+S'] },
  { action: 'Save', shortcut: 'Ctrl+S', options: ['Ctrl+S', 'Ctrl+F', 'Ctrl+A', 'Ctrl+P'] },
  { action: 'Cut', shortcut: 'Ctrl+X', options: ['Ctrl+C', 'Ctrl+X', 'Ctrl+V', 'Ctrl+W'] },
  { action: 'New Tab', shortcut: 'Ctrl+T', options: ['Ctrl+N', 'Ctrl+T', 'Ctrl+W', 'Ctrl+L'] },
  { action: 'Close Tab', shortcut: 'Ctrl+W', options: ['Ctrl+Q', 'Ctrl+W', 'Ctrl+E', 'Ctrl+D'] },
  { action: 'Switch Apps', shortcut: 'Alt+Tab', options: ['Ctrl+Tab', 'Alt+Tab', 'Win+Tab', 'Shift+Tab'] },
  { action: 'Print', shortcut: 'Ctrl+P', options: ['Ctrl+P', 'Ctrl+F', 'Ctrl+N', 'Ctrl+O'] },
  { action: 'Open File', shortcut: 'Ctrl+O', options: ['Ctrl+F', 'Ctrl+O', 'Ctrl+N', 'Ctrl+P'] },
  { action: 'New Window', shortcut: 'Ctrl+N', options: ['Ctrl+N', 'Ctrl+T', 'Ctrl+W', 'Ctrl+O'] },
  { action: 'Refresh Page', shortcut: 'F5', options: ['F5', 'F11', 'F12', 'F1'] },
  { action: 'Lock Screen', shortcut: 'Win+L', options: ['Ctrl+L', 'Win+L', 'Alt+L', 'Shift+L'] },
  { action: 'Screenshot', shortcut: 'Win+Shift+S', options: ['PrtScn', 'Win+Shift+S', 'Ctrl+S', 'Alt+S'] },
  { action: 'Task Manager', shortcut: 'Ctrl+Shift+Esc', options: ['Ctrl+Alt+Del', 'Ctrl+Shift+Esc', 'Alt+F4', 'Win+Esc'] },
  { action: 'Address Bar', shortcut: 'Ctrl+L', options: ['Ctrl+A', 'Ctrl+L', 'Ctrl+D', 'Ctrl+G'] },
  { action: 'Bookmark Page', shortcut: 'Ctrl+D', options: ['Ctrl+B', 'Ctrl+D', 'Ctrl+F', 'Ctrl+M'] },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number; timePerQuestion: number }> = {
  basic: { rounds: 8, timePerQuestion: 15 },
  tough: { rounds: 12, timePerQuestion: 10 },
  high: { rounds: 16, timePerQuestion: 7 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '8 shortcuts, 15s each',
  tough: '12 shortcuts, 10s each',
  high: '16 shortcuts, 7s each',
};

const ACHIEVEMENTS = [
  { id: 'first-match', title: 'Shortcut Rookie', description: 'Matched your first shortcut', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Power User', description: '5 correct in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'streak-10', title: 'Shortcut Master', description: '10 correct in a row', condition: (s: any) => s.streak >= 10 },
  { id: 'score-30', title: 'Keyboard Ninja', description: 'Scored 30+ points', condition: (s: any) => s.score >= 30 },
  { id: 'perfect', title: 'Shortcut Legend', description: 'Perfect round', condition: (s: any) => s.correct >= 16 && s.wrong === 0 },
];

export default function ShortcutMaster({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.basic;
  const totalRounds = config.rounds;

  const shortcutList = useMemo(() => [...SHORTCUTS].sort(() => Math.random() - 0.5).slice(0, totalRounds), [totalRounds]);
  const shortcut = shortcutList[round];

  useEffect(() => {
    if (phase !== 'playing' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = shortcut.options[idx] === shortcut.shortcut;
    setFeedback({ correct: isCorrect });
    if (isCorrect) {
      eng.onCorrect(2);
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
    } else {
      eng.onWrong();
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
    }
  };

  const handleTimeout = () => {
    if (selected !== null) return;
    setSelected(-1);
    setFeedback({ correct: false });
    eng.onWrong();
    setMascotTrigger((t) => t + 1);
    setMascotWrong(true);
  };

  const next = () => {
    if (round + 1 >= totalRounds) {
      setPhase('gameover');
      eng.playSound('game-over');
      eng.checkAchievements(eng.score);
      onAchievement?.();
    } else {
      setRound((r) => r + 1);
      setSelected(null);
      setFeedback(null);
      setTimeLeft(config.timePerQuestion);
    }
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    eng.reset();
    setPhase('playing');
    setTimeLeft(DIFFICULTY_CONFIG[diff].timePerQuestion);
  };

  const reset = () => {
    setRound(0);
    eng.reset();
    setSelected(null);
    setFeedback(null);
    setTimeLeft(config.timePerQuestion);
    setPhase('playing');
  };

  const changeDifficulty = () => setPhase('difficulty');
  const resetAll = () => {
    setPhase('cover');
    setDifficulty(null);
    reset();
  };

  if (phase === 'cover') {
    return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;
  }

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="tech" />
        <DifficultySelector
          title="Shortcut Master"
          description="Match keyboard shortcuts to their actions as fast as you can!"
          icon={<Zap className="h-14 w-14 text-info-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 30 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Results</h3>
            <div className="font-display font-extrabold text-5xl text-info-600 mb-2 animate-pop-in">{eng.score}</div>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 30 ? 'Keyboard ninja!' : eng.score >= 20 ? 'Solid shortcut knowledge!' : 'Keep practicing those shortcuts!'}
            </p>
            <button onClick={reset} className="btn-secondary w-full">Play Again</button>
            <button onClick={changeDifficulty} className="btn-ghost mt-2 w-full text-sm">Change Difficulty</button>
          </div>
          <div>
            <Leaderboard slug={game.slug} score={eng.score} onPlayAgain={resetAll} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatedBackground category="tech" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} timeLeft={timeLeft} />
        <div className="mb-1 text-xs text-ink-400">Shortcut {round + 1} / {totalRounds}</div>

        <div key={round} className="rounded-xl bg-info-50 border border-info-200 p-6 mb-3 animate-slide-in-right text-center">
          <p className="text-sm text-ink-500 mb-1">What is the shortcut for</p>
          <p className="font-display font-bold text-2xl text-ink-900">{shortcut?.action}?</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {shortcut?.options.map((option, idx) => {
            const isSelected = selected === idx;
            const showResult = selected !== null;
            const isCorrect = option === shortcut.shortcut;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={`rounded-lg border p-4 text-center font-mono font-semibold text-sm transition-all animate-slide-in-right ${
                  showResult
                    ? isCorrect ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : isSelected ? 'border-red-300 bg-red-50 text-red-600 animate-shake'
                    : 'border-ink-200 bg-white opacity-50'
                    : 'border-ink-200 bg-white text-ink-700 hover:border-info-300 hover:bg-info-50/50 hover:scale-[1.02] cursor-pointer'
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center justify-center gap-2">
                  {option}
                  {showResult && isCorrect && <CheckCircle2 className="h-4 w-4 text-brand-600" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="animate-fade-in rounded-lg border border-ink-200 bg-ink-50 p-3 mb-4">
            <div className="flex items-center gap-2">
              {feedback.correct ? <CheckCircle2 className="h-5 w-5 text-brand-600 animate-check-bounce" />
              : <XCircle className="h-5 w-5 text-red-500" />}
              <p className="text-sm text-ink-700">
                {feedback.correct ? 'Correct!' : `The answer was ${shortcut.shortcut}`}
              </p>
            </div>
          </div>
        )}

        {selected !== null && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">
            {round + 1 >= totalRounds ? 'See Results' : 'Next Shortcut'}
          </button>
        )}
      </div>
    </div>
  );
}
