import { useState, useEffect, useRef, useMemo } from 'react';
import { Keyboard } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

const SENTENCES = [
  'The quick brown fox jumps over the lazy dog near the riverbank.',
  'Programming requires patience and a willingness to learn from mistakes.',
  'A journey of a thousand miles begins with a single careful step forward.',
  'Technology changes rapidly but fundamental principles remain the same.',
  'Reading expands the mind and opens doors to new ideas and perspectives.',
  'Practice makes permanent so focus on accuracy before building speed.',
  'Good design is invisible because users never notice when things work.',
  'Curiosity drives innovation and asking questions leads to new discoveries.',
  'Every expert was once a beginner who refused to give up on their dreams.',
  'Simple solutions often work better than complex and elaborate alternatives.',
];

const DIFFICULTY_CONFIG: Record<Difficulty, { timeLimit: number; sentenceCount: number }> = {
  basic: { timeLimit: 60, sentenceCount: 3 },
  tough: { timeLimit: 45, sentenceCount: 4 },
  high: { timeLimit: 30, sentenceCount: 5 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '60 seconds, shorter texts',
  tough: '45 seconds, medium texts',
  high: '30 seconds, longer texts',
};

const ACHIEVEMENTS = [
  { id: 'first-type', title: 'First Words', description: 'Completed your first typing test', condition: (s: any) => s.correct >= 1 },
  { id: 'wpm-40', title: 'Fast Fingers', description: 'Reached 40 WPM', condition: (s: any) => s.score >= 40 },
  { id: 'wpm-60', title: 'Speed Typer', description: 'Reached 60 WPM', condition: (s: any) => s.score >= 60 },
  { id: 'wpm-80', title: 'Keyboard Master', description: 'Reached 80 WPM', condition: (s: any) => s.score >= 80 },
  { id: 'perfect-acc', title: 'Precision', description: '100% accuracy on a test', condition: (s: any) => s.score >= 50 && s.wrong === 0 },
];

export default function TypingSpeed({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.basic;

  const sentences = useMemo(() => [...SENTENCES].sort(() => Math.random() - 0.5).slice(0, config.sentenceCount), [config.sentenceCount]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentSentence = sentences[currentIdx] || '';

  useEffect(() => {
    if (phase === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleEnd();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeLeft <= 0) return;
    if (!startTime) setStartTime(Date.now());

    const newValue = e.target.value;
    const target = currentSentence;

    let err = 0;
    for (let i = 0; i < newValue.length; i++) {
      if (i >= target.length || newValue[i] !== target[i]) {
        err++;
      }
    }
    setErrors(err);

    if (newValue === target) {
      setCompleted((c) => c + 1);
      setInput('');
      if (currentIdx + 1 < sentences.length) {
        setCurrentIdx((i) => i + 1);
        setMascotTrigger((t) => t + 1);
        setMascotWrong(false);
      } else {
        handleEnd();
      }
    } else {
      setInput(newValue);
    }
  };

  const handleEnd = () => {
    const elapsed = startTime ? (Date.now() - startTime) / 1000 : config.timeLimit;
    const wordsTyped = (completed * currentSentence.split(' ').length) + (input.split(' ').length - 1);
    const wpm = Math.max(0, Math.round((wordsTyped / elapsed) * 60));
    const accuracy = errors === 0 ? 100 : Math.max(0, Math.round((1 - errors / (completed * currentSentence.length + input.length)) * 100));
    const finalScore = Math.round(wpm * (accuracy / 100));
    eng.setScore(finalScore);
    setPhase('gameover');
    eng.playSound('game-over');
    eng.checkAchievements(finalScore);
    onAchievement?.();
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    eng.reset();
    setInput('');
    setCompleted(0);
    setErrors(0);
    setCurrentIdx(0);
    setStartTime(null);
    setTimeLeft(DIFFICULTY_CONFIG[diff].timeLimit);
    setPhase('playing');
  };

  const reset = () => {
    eng.reset();
    setInput('');
    setCompleted(0);
    setErrors(0);
    setCurrentIdx(0);
    setStartTime(null);
    setTimeLeft(config.timeLimit);
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
          title="Typing Speed Test"
          description="Type the displayed sentences as fast and accurately as you can!"
          icon={<Keyboard className="h-14 w-14 text-info-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 40 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Typing Results</h3>
            <div className="font-display font-extrabold text-5xl text-info-600 mb-2 animate-pop-in">{eng.score} WPM</div>
            <p className="text-sm text-ink-500 mb-2">Completed {completed} sentences</p>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 60 ? 'Lightning fast!' : eng.score >= 40 ? 'Great speed!' : eng.score >= 20 ? 'Good pace — keep practicing.' : 'Keep practicing to build speed.'}
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

  const displaySentence = currentSentence;
  const typed = input;

  return (
    <div className="relative">
      <AnimatedBackground category="tech" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} timeLeft={timeLeft} />
        <div className="mb-1 text-xs text-ink-400">Sentence {currentIdx + 1} of {sentences.length} | Completed: {completed}</div>

        <div className="rounded-xl bg-info-50 border border-info-200 p-4 mb-3">
          <p className="font-mono text-lg leading-relaxed">
            {displaySentence.split('').map((char, idx) => {
              let color = 'text-ink-400';
              if (idx < typed.length) {
                color = typed[idx] === char ? 'text-info-600' : 'text-red-500 bg-red-100 rounded';
              }
              return <span key={idx} className={color}>{char}</span>;
            })}
          </p>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          disabled={timeLeft <= 0}
          placeholder="Start typing..."
          className="input-field text-lg font-mono mb-4"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {errors > 0 && (
          <p className="text-sm text-red-500 mb-2">{errors} character errors</p>
        )}
      </div>
    </div>
  );
}
