import { useState, useMemo, useCallback } from 'react';
import { Globe, CheckCircle2, XCircle } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface Country { name: string; flag: string; difficulty: 1 | 2 | 3; }

const COUNTRIES: Country[] = [
  { name: 'Japan', flag: '🇯🇵', difficulty: 1 }, { name: 'Brazil', flag: '🇧🇷', difficulty: 1 },
  { name: 'Canada', flag: '🇨🇦', difficulty: 1 }, { name: 'France', flag: '🇫🇷', difficulty: 1 },
  { name: 'Germany', flag: '🇩🇪', difficulty: 1 }, { name: 'Italy', flag: '🇮🇹', difficulty: 1 },
  { name: 'Spain', flag: '🇪🇸', difficulty: 1 }, { name: 'Mexico', flag: '🇲🇽', difficulty: 1 },
  { name: 'Australia', flag: '🇦🇺', difficulty: 1 }, { name: 'India', flag: '🇮🇳', difficulty: 1 },
  { name: 'South Korea', flag: '🇰🇷', difficulty: 2 }, { name: 'Netherlands', flag: '🇳🇱', difficulty: 2 },
  { name: 'Sweden', flag: '🇸🇪', difficulty: 2 }, { name: 'Argentina', flag: '🇦🇷', difficulty: 2 },
  { name: 'South Africa', flag: '🇿🇦', difficulty: 2 }, { name: 'Egypt', flag: '🇪🇬', difficulty: 2 },
  { name: 'Thailand', flag: '🇹🇭', difficulty: 2 }, { name: 'Greece', flag: '🇬🇷', difficulty: 2 },
  { name: 'Norway', flag: '🇳🇴', difficulty: 2 }, { name: 'Poland', flag: '🇵🇱', difficulty: 2 },
  { name: 'Bhutan', flag: '🇧🇹', difficulty: 3 }, { name: 'Mongolia', flag: '🇲🇳', difficulty: 3 },
  { name: 'Nepal', flag: '🇳🇵', difficulty: 3 }, { name: 'Madagascar', flag: '🇲🇬', difficulty: 3 },
  { name: 'Kazakhstan', flag: '🇰🇿', difficulty: 3 }, { name: 'Sri Lanka', flag: '🇱🇰', difficulty: 3 },
  { name: 'Uruguay', flag: '🇺🇾', difficulty: 3 }, { name: 'Iceland', flag: '🇮🇸', difficulty: 3 },
  { name: 'Croatia', flag: '🇭🇷', difficulty: 3 }, { name: 'Oman', flag: '🇴🇲', difficulty: 3 },
];

const DIFFICULTY_MAP: Record<Difficulty, 1 | 2 | 3> = { basic: 1, tough: 2, high: 3 };
const QUESTIONS_PER_QUIZ = 10;

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: 'Well-known countries only',
  tough: 'Includes moderately known countries',
  high: 'Includes obscure countries',
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function generateQuestion(country: Country, allCountries: Country[]) {
  const wrongOptions = shuffle(allCountries.filter((c) => c.name !== country.name)).slice(0, 3);
  return { country, options: shuffle([country, ...wrongOptions]) };
}

const ACHIEVEMENTS = [
  { id: 'first-country', title: 'Explorer', description: 'Identified your first country', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Globetrotter', description: '5 correct in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'streak-10', title: 'Cartographer', description: 'Perfect quiz — all 10 correct', condition: (s: any) => s.correct >= 10 && s.wrong === 0 },
  { id: 'score-1000', title: 'Geography Expert', description: 'Scored 1000+ points', condition: (s: any) => s.score >= 1000 },
  { id: 'score-2000', title: 'World Scholar', description: 'Scored 2000+ points', condition: (s: any) => s.score >= 2000 },
];

export default function GeoQuiz({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<ReturnType<typeof generateQuestion>[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [flagFlipKey, setFlagFlipKey] = useState(0);
  const [globeSpin, setGlobeSpin] = useState(0);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });
  const pool = useMemo(() => COUNTRIES, []);

  const startQuiz = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    const maxDiff = DIFFICULTY_MAP[diff];
    const available = pool.filter((c) => c.difficulty <= maxDiff);
    const selectedCountries = shuffle(available).slice(0, QUESTIONS_PER_QUIZ);
    setQuestions(selectedCountries.map((c) => generateQuestion(c, pool)));
    setCurrent(0);
    eng.reset();
    setSelected(null);
    setFeedback(null);
    setPhase('playing');
    setFlagFlipKey((k) => k + 1);
  }, [pool, eng]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const q = questions[current];
    const correct = q.options[idx].name === q.country.name;
    setFeedback({ correct, correctAnswer: q.country.name });
    if (correct) {
      eng.onCorrect(100 + eng.streak * 20);
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
    } else {
      eng.onWrong();
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
    }
  };

  const next = () => {
    if (current + 1 >= QUESTIONS_PER_QUIZ) {
      setPhase('gameover');
      eng.playSound('game-over');
      eng.checkAchievements(eng.score);
      onAchievement?.();
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setFeedback(null);
      setFlagFlipKey((k) => k + 1);
      setGlobeSpin((g) => g + 1);
    }
  };

  const reset = () => {
    setPhase('cover');
    setDifficulty(null);
    setQuestions([]);
    eng.reset();
    setSelected(null);
    setFeedback(null);
  };

  const changeDifficulty = () => setPhase('difficulty');

  if (phase === 'cover') {
    return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;
  }

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="educational" />
        <DifficultySelector
          title="Geo Quiz"
          description="Identify countries from their flags. Higher difficulty includes more obscure nations."
          icon={<Globe className="h-14 w-14 text-purple-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startQuiz}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 1000 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Quiz Complete!</h3>
            <div className="font-display font-extrabold text-5xl text-ink-900 mb-2 animate-pop-in">{eng.score}</div>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 1000 ? 'Geography expert!' : eng.score >= 500 ? 'Well traveled!' : 'Keep exploring the world!'}
            </p>
            <button onClick={reset} className="btn-secondary w-full">Play Again</button>
            <button onClick={changeDifficulty} className="btn-ghost mt-2 w-full text-sm">Change Difficulty</button>
          </div>
          <div>
            <Leaderboard slug={game.slug} score={eng.score} onPlayAgain={reset} />
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="relative">
      <AnimatedBackground category="educational" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} />
        <div className="mb-1 text-xs text-ink-400">Question {current + 1} / {QUESTIONS_PER_QUIZ}</div>

        <div className="rounded-xl bg-purple-50 border-2 border-purple-200 p-8 mb-5 text-center relative overflow-hidden">
          <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Which country is this?</div>
          <div key={flagFlipKey} className="text-7xl sm:text-8xl animate-flag-flip inline-block">{q.country.flag}</div>
          {globeSpin > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Globe className="h-32 w-32 text-purple-300 opacity-20 animate-globe-spin" />
            </div>
          )}
          {feedback?.correct && (
            <div className="absolute inset-0 rounded-xl animate-glow-ring pointer-events-none" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {q.options.map((option, idx) => {
            const isSelected = selected === idx;
            const showResult = selected !== null;
            const isCorrect = option.name === q.country.name;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={`rounded-lg border-2 p-3 text-sm font-semibold transition-all animate-slide-in-right ${
                  showResult
                    ? isCorrect ? 'border-brand-400 bg-brand-50 text-brand-800 animate-glow-ring'
                    : isSelected ? 'border-red-400 bg-red-50 text-red-700 animate-shake'
                    : 'border-ink-200 bg-white text-ink-400 opacity-60'
                    : 'border-ink-200 bg-white text-ink-800 hover:border-purple-300 hover:bg-purple-50/50 hover:scale-[1.02] cursor-pointer'
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center justify-center gap-2">
                  {showResult && isCorrect && <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0 animate-check-bounce" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                  {option.name}
                </div>
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="mb-4 animate-fade-in">
            <div className={`rounded-lg p-3 ${feedback.correct ? 'bg-brand-50 border border-brand-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {feedback.correct ? <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 animate-check-bounce" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                <p className="text-sm text-ink-700">
                  {feedback.correct ? `Correct! That's ${feedback.correctAnswer}.` : `The answer was ${feedback.correctAnswer}.`}
                </p>
              </div>
            </div>
            <button onClick={next} className="btn-primary w-full mt-3 animate-glow-pulse">
              {current + 1 >= QUESTIONS_PER_QUIZ ? 'See Results' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
