import { useState, useMemo, useEffect } from 'react';
import { Coins, CheckCircle2, XCircle } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface CurrencyQuestion {
  country: string;
  currency: string;
  options: string[];
}

const QUESTIONS: CurrencyQuestion[] = [
  { country: 'Japan', currency: 'Japanese Yen', options: ['Japanese Yen', 'Chinese Yuan', 'Korean Won', 'Thai Baht'] },
  { country: 'United Kingdom', currency: 'British Pound Sterling', options: ['Euro', 'British Pound Sterling', 'Swiss Franc', 'US Dollar'] },
  { country: 'Switzerland', currency: 'Swiss Franc', options: ['Euro', 'Swiss Franc', 'British Pound', 'US Dollar'] },
  { country: 'India', currency: 'Indian Rupee', options: ['Indian Rupee', 'Pakistani Rupee', 'Indonesian Rupiah', 'Sri Lankan Rupee'] },
  { country: 'Canada', currency: 'Canadian Dollar', options: ['US Dollar', 'Canadian Dollar', 'Australian Dollar', 'Euro'] },
  { country: 'Australia', currency: 'Australian Dollar', options: ['New Zealand Dollar', 'Australian Dollar', 'Canadian Dollar', 'US Dollar'] },
  { country: 'Brazil', currency: 'Brazilian Real', options: ['Argentine Peso', 'Brazilian Real', 'Mexican Peso', 'Colombian Peso'] },
  { country: 'South Korea', currency: 'South Korean Won', options: ['Japanese Yen', 'Chinese Yuan', 'South Korean Won', 'Taiwan Dollar'] },
  { country: 'Mexico', currency: 'Mexican Peso', options: ['US Dollar', 'Brazilian Real', 'Mexican Peso', 'Argentine Peso'] },
  { country: 'Russia', currency: 'Russian Ruble', options: ['Russian Ruble', 'Ukrainian Hryvnia', 'Polish Zloty', 'Turkish Lira'] },
  { country: 'Turkey', currency: 'Turkish Lira', options: ['Greek Drachma', 'Turkish Lira', 'Euro', 'Bulgarian Lev'] },
  { country: 'Sweden', currency: 'Swedish Krona', options: ['Euro', 'Danish Krone', 'Swedish Krona', 'Norwegian Krone'] },
  { country: 'Norway', currency: 'Norwegian Krone', options: ['Swedish Krona', 'Danish Krone', 'Norwegian Krone', 'Euro'] },
  { country: 'China', currency: 'Chinese Yuan', options: ['Japanese Yen', 'Chinese Yuan', 'South Korean Won', 'Hong Kong Dollar'] },
  { country: 'South Africa', currency: 'South African Rand', options: ['South African Rand', 'Botswana Pula', 'Namibian Dollar', 'Euro'] },
  { country: 'Thailand', currency: 'Thai Baht', options: ['Vietnamese Dong', 'Thai Baht', 'Cambodian Riel', 'Malaysian Ringgit'] },
  { country: 'Egypt', currency: 'Egyptian Pound', options: ['Egyptian Pound', 'Moroccan Dirham', 'Tunisian Dinar', 'Euro'] },
  { country: 'Poland', currency: 'Polish Zloty', options: ['Euro', 'Polish Zloty', 'Czech Koruna', 'Hungarian Forint'] },
  { country: 'Singapore', currency: 'Singapore Dollar', options: ['Malaysian Ringgit', 'Singapore Dollar', 'Brunei Dollar', 'US Dollar'] },
  { country: 'New Zealand', currency: 'New Zealand Dollar', options: ['Australian Dollar', 'New Zealand Dollar', 'Canadian Dollar', 'Fijian Dollar'] },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number; timePerQuestion: number }> = {
  basic: { rounds: 8, timePerQuestion: 15 },
  tough: { rounds: 12, timePerQuestion: 10 },
  high: { rounds: 16, timePerQuestion: 7 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '8 currencies, 15s each',
  tough: '12 currencies, 10s each',
  high: '16 currencies, 7s each',
};

const ACHIEVEMENTS = [
  { id: 'first-match', title: 'Currency Rookie', description: 'Matched your first currency', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Forex Trader', description: '5 correct in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'score-25', title: 'Currency Expert', description: 'Scored 25+ points', condition: (s: any) => s.score >= 25 },
  { id: 'perfect', title: 'World Banker', description: 'Perfect round', condition: (s: any) => s.correct >= 16 && s.wrong === 0 },
];

export default function WorldCurrency({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
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

  const questionList = useMemo(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, totalRounds), [totalRounds]);
  const question = questionList[round];

  useEffect(() => {
    if (phase !== 'playing' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { clearInterval(timer); handleTimeout(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = question.options[idx] === question.currency;
    setFeedback({ correct: isCorrect });
    if (isCorrect) { eng.onCorrect(2); setMascotTrigger(t => t + 1); setMascotWrong(false); }
    else { eng.onWrong(); setMascotTrigger(t => t + 1); setMascotWrong(true); }
  };

  const handleTimeout = () => {
    if (selected !== null) return;
    setSelected(-1); setFeedback({ correct: false }); eng.onWrong();
    setMascotTrigger(t => t + 1); setMascotWrong(true);
  };

  const next = () => {
    if (round + 1 >= totalRounds) { setPhase('gameover'); eng.playSound('game-over'); eng.checkAchievements(eng.score); onAchievement?.(); }
    else { setRound(r => r + 1); setSelected(null); setFeedback(null); setTimeLeft(config.timePerQuestion); }
  };

  const startWithDifficulty = (diff: Difficulty) => { setDifficulty(diff); eng.reset(); setPhase('playing'); setTimeLeft(DIFFICULTY_CONFIG[diff].timePerQuestion); };
  const reset = () => { setRound(0); eng.reset(); setSelected(null); setFeedback(null); setTimeLeft(config.timePerQuestion); setPhase('playing'); };
  const changeDifficulty = () => setPhase('difficulty');
  const resetAll = () => { setPhase('cover'); setDifficulty(null); reset(); };

  if (phase === 'cover') return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="educational" />
        <DifficultySelector title="World Currency Match" description="Match countries to their official currencies!" icon={<Coins className="h-14 w-14 text-purple-600" />} difficultyDescriptions={DIFFICULTY_DESCRIPTIONS} onSelect={startWithDifficulty} />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 25 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Results</h3>
            <div className="font-display font-extrabold text-5xl text-purple-600 mb-2 animate-pop-in">{eng.score}</div>
            <p className="text-sm text-ink-500 mb-4">{eng.score >= 25 ? 'Currency expert!' : eng.score >= 16 ? 'Great currency knowledge!' : 'Keep learning world currencies!'}</p>
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
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} timeLeft={timeLeft} />
        <div className="mb-1 text-xs text-ink-400">Question {round + 1} / {totalRounds}</div>
        <div key={round} className="rounded-xl bg-purple-50 border border-purple-200 p-6 mb-3 animate-slide-in-right text-center">
          <p className="text-sm text-ink-500 mb-1">What is the official currency of</p>
          <p className="font-display font-bold text-2xl text-ink-900">{question?.country}?</p>
        </div>
        <div className="space-y-2.5 mb-4">
          {question?.options.map((option, idx) => {
            const isSelected = selected === idx; const showResult = selected !== null;
            const isCorrect = option === question.currency;
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={showResult}
                className={`w-full text-left rounded-lg border p-3.5 text-sm transition-all animate-slide-in-right ${showResult ? isCorrect ? 'border-brand-400 bg-brand-50' : isSelected ? 'border-red-300 bg-red-50 animate-shake' : 'border-ink-200 bg-white opacity-60' : 'border-ink-200 bg-white hover:border-purple-300 hover:bg-purple-50/50 hover:scale-[1.02] cursor-pointer'}`}
                style={{ animationDelay: `${idx * 60}ms` }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-800">{option}</span>
                  {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 animate-check-bounce" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
        {feedback && (
          <div className="animate-fade-in rounded-lg border border-ink-200 bg-ink-50 p-3 mb-4">
            <div className="flex items-center gap-2">
              {feedback.correct ? <CheckCircle2 className="h-5 w-5 text-brand-600 animate-check-bounce" /> : <XCircle className="h-5 w-5 text-red-500" />}
              <p className="text-sm text-ink-700">{feedback.correct ? 'Correct!' : `The currency is ${question.currency}`}</p>
            </div>
          </div>
        )}
        {selected !== null && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">{round + 1 >= totalRounds ? 'See Results' : 'Next Question'}</button>
        )}
      </div>
    </div>
  );
}
