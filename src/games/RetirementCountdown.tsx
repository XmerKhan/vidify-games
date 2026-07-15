import { useState, useMemo } from 'react';
import { PiggyBank, CheckCircle2, XCircle } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface YearChoice {
  age: number;
  event: string;
  options: { text: string; saveRate: number; risk: 'conservative' | 'balanced' | 'aggressive'; feedback: string }[];
}

const YEARS: YearChoice[] = [
  {
    age: 25,
    event: "First job! Salary: $50,000. How much do you save?",
    options: [
      { text: "5% — I need the cash now", saveRate: 5, risk: 'conservative', feedback: "Starting small is better than nothing, but 5% won't build enough over 35 years." },
      { text: "10% — solid start", saveRate: 10, risk: 'balanced', feedback: "Great start! 10% with a 401k match is a strong foundation for long-term growth." },
      { text: "15% — aggressive saver", saveRate: 15, risk: 'aggressive', feedback: "Excellent! 15% from age 25 almost guarantees a comfortable retirement." },
      { text: "0% — I'll start later", saveRate: 0, risk: 'conservative', feedback: "Dangerous! Every year you wait costs you compounding. Starting at 25 vs 35 can double your nest egg." },
    ],
  },
  {
    age: 28,
    event: "You got a raise to $65,000. What do you do with the extra income?",
    options: [
      { text: "Keep saving the same dollar amount", saveRate: 5, risk: 'conservative', feedback: "Lifestyle creep! Your savings rate dropped as a percentage. Save more to keep up." },
      { text: "Increase savings to 12% of new salary", saveRate: 12, risk: 'balanced', feedback: "Smart! Increasing savings with raises prevents lifestyle creep and accelerates growth." },
      { text: "Save the entire raise — 20%+", saveRate: 20, risk: 'aggressive', feedback: "Incredible discipline! Your future self will be very grateful." },
      { text: "Spend it — I earned it", saveRate: 0, risk: 'conservative', feedback: "Lifestyle creep is the #1 retirement killer. Enjoy some, but save most raises." },
    ],
  },
  {
    age: 32,
    event: "Market crash! Your portfolio dropped 30%. What do you do?",
    options: [
      { text: "Sell everything to cash", saveRate: 0, risk: 'conservative', feedback: "Worst move! Selling at the bottom locks in losses. You miss the recovery." },
      { text: "Stay the course, keep contributing", saveRate: 12, risk: 'balanced', feedback: "Perfect! Market dips are buying opportunities. Your contributions buy more shares at lower prices." },
      { text: "Increase contributions — stocks are on sale", saveRate: 18, risk: 'aggressive', feedback: "Excellent! Buying more during downturns maximizes long-term returns." },
      { text: "Move to bonds only", saveRate: 8, risk: 'conservative', feedback: "Too cautious at 32. You have 30+ years to recover. Bonds won't grow enough." },
    ],
  },
  {
    age: 35,
    event: "You have $80K saved. How do you invest?",
    options: [
      { text: "100% in savings accounts", saveRate: 10, risk: 'conservative', feedback: "Too conservative! Savings accounts earn 1-2%, barely beating inflation. You need growth." },
      { text: "70% stocks, 30% bonds (target-date fund)", saveRate: 12, risk: 'balanced', feedback: "Perfect! A diversified portfolio with growth potential and some stability." },
      { text: "90% stocks, 10% bonds", saveRate: 15, risk: 'aggressive', feedback: "Aggressive but reasonable at 35. Higher risk for higher long-term returns." },
      { text: "100% in one stock a friend recommended", saveRate: 10, risk: 'aggressive', feedback: "Dangerous! Single stocks can go to zero. Diversify with index funds instead." },
    ],
  },
  {
    age: 40,
    event: "You're considering tapping your 401k for a home down payment. What do you do?",
    options: [
      { text: "Take a 401k loan for the down payment", saveRate: 10, risk: 'balanced', feedback: "Risky! If you lose your job, the loan becomes due immediately. Save separately instead." },
      { text: "Withdraw $30K (first-time buyer exception)", saveRate: 8, risk: 'conservative', feedback: "Even with the exception, you lose compounding on that $30K forever. Save separately." },
      { text: "Keep retirement money invested, save separately", saveRate: 14, risk: 'balanced', feedback: "Smart! Separate your retirement and home savings. Don't rob your future." },
      { text: "Delay the home purchase and keep contributing", saveRate: 15, risk: 'aggressive', feedback: "Patient approach! Your retirement nest egg keeps growing undisturbed." },
    ],
  },
  {
    age: 45,
    event: "You have $200K saved. Salary is $90K. How much do you save?",
    options: [
      { text: "10% — I'm on track", saveRate: 10, risk: 'balanced', feedback: "Good! At $200K by 45, you're ahead of most people. Keep the steady course." },
      { text: "15% — catch-up mode", saveRate: 15, risk: 'aggressive', feedback: "Excellent! Maximizing contributions now ensures a comfortable retirement." },
      { text: "5% — kids are expensive", saveRate: 5, risk: 'conservative', feedback: "Understandable, but cutting retirement savings risks your future. Try to find balance." },
      { text: "20% — max out everything", saveRate: 20, risk: 'aggressive', feedback: "Outstanding! Maxing out tax-advantaged accounts is the fastest path to retirement." },
    ],
  },
  {
    age: 50,
    event: "You're 50 and can make catch-up contributions. What do you do?",
    options: [
      { text: "Add the catch-up — $7,500 extra/year", saveRate: 20, risk: 'aggressive', feedback: "Perfect! Catch-up contributions at 50+ are the best way to boost your nest egg." },
      { text: "Skip it — I'm saving enough", saveRate: 12, risk: 'balanced', feedback: "You may be okay, but catch-up contributions are tax-advantaged. Use them if you can." },
      { text: "Use the money for a vacation instead", saveRate: 8, risk: 'conservative', feedback: "At 50, retirement is close. Prioritize savings over discretionary spending." },
      { text: "Move everything to cash — too risky", saveRate: 10, risk: 'conservative', feedback: "Still too conservative at 50. You have 15+ years of growth ahead. Stay invested." },
    ],
  },
  {
    age: 55,
    event: "Your portfolio is $450K. You want to retire at 65. How do you invest?",
    options: [
      { text: "Shift to 100% bonds for safety", saveRate: 12, risk: 'conservative', feedback: "Too conservative! At 55, you still need growth. Keep 60-70% in stocks." },
      { text: "Keep 70% stocks, 30% bonds", saveRate: 15, risk: 'balanced', feedback: "Perfect balance! Growth potential with some protection as retirement approaches." },
      { text: "Go 90% stocks — I need to catch up", saveRate: 20, risk: 'aggressive', feedback: "Aggressive, but if you're behind, growth is necessary. Just be ready for volatility." },
      { text: "Buy an annuity with everything", saveRate: 10, risk: 'conservative', feedback: "Annuities have high fees and lock up your money. Keep your portfolio diversified." },
    ],
  },
  {
    age: 60,
    event: "Portfolio: $650K. You're thinking about retirement timing. What's your plan?",
    options: [
      { text: "Retire now — I have enough", saveRate: 10, risk: 'conservative', feedback: "$650K may not last 25+ years. Consider working a few more years for bigger savings." },
      { text: "Work to 65 and maximize savings", saveRate: 20, risk: 'balanced', feedback: "Smart! 5 more years of contributions + growth + delayed Social Security = much more income." },
      { text: "Work part-time and ease into retirement", saveRate: 15, risk: 'balanced', feedback: "Nice strategy! Phased retirement lets your portfolio keep growing while you earn some income." },
      { text: "Take Social Security at 62", saveRate: 10, risk: 'conservative', feedback: "Taking Social Security early reduces your benefit by 25-30% for life. Wait if you can." },
    ],
  },
  {
    age: 65,
    event: "Retirement day! Portfolio: $850K. Social Security: $2,500/mo. How much do you withdraw annually?",
    options: [
      { text: "4% — $34,000/yr (safe withdrawal rate)", saveRate: 0, risk: 'balanced', feedback: "Perfect! The 4% rule is designed to make savings last 30 years. With Social Security, you're set." },
      { text: "6% — $51,000/yr", saveRate: 0, risk: 'aggressive', feedback: "6% has a high risk of running out in 20 years. Stick closer to 4% for safety." },
      { text: "2% — $17,000/yr", saveRate: 0, risk: 'conservative', feedback: "Very safe but may be unnecessarily frugal. You can enjoy more of your savings." },
      { text: "8% — $68,000/yr", saveRate: 0, risk: 'aggressive', feedback: "8% almost certainly depletes your portfolio within 15 years. Too risky." },
    ],
  },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number; timePerYear: number }> = {
  basic: { rounds: 6, timePerYear: 0 },
  tough: { rounds: 8, timePerYear: 30 },
  high: { rounds: 10, timePerYear: 20 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '6 life decisions, no timer',
  tough: '8 life decisions, 30s each',
  high: '10 life decisions, 20s each',
};

const ACHIEVEMENTS = [
  { id: 'first-save', title: 'Saver', description: 'Made your first savings decision', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Compound Champion', description: '5 smart decisions in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'score-20', title: 'Retirement Ready', description: 'Scored 20+ points', condition: (s: any) => s.score >= 20 },
  { id: 'perfect', title: 'Financial Legend', description: 'All correct decisions', condition: (s: any) => s.correct >= 10 && s.wrong === 0 },
];

export default function RetirementCountdown({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.tough;
  const totalRounds = config.rounds;

  const yearList = useMemo(() => [...YEARS].sort(() => Math.random() - 0.5).slice(0, totalRounds), [totalRounds]);
  const yearData = yearList[round];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const option = yearData.options[idx];
    const isCorrect = option.saveRate >= 10;
    setFeedback({ text: option.feedback, correct: isCorrect });
    if (isCorrect) {
      eng.onCorrect(3);
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
    } else {
      eng.onWrong();
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
    }
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
      if (config.timePerYear > 0) setTimeLeft(config.timePerYear);
    }
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    eng.reset();
    setPhase('playing');
    if (DIFFICULTY_CONFIG[diff].timePerYear > 0) setTimeLeft(DIFFICULTY_CONFIG[diff].timePerYear);
  };

  const reset = () => {
    setRound(0);
    eng.reset();
    setSelected(null);
    setFeedback(null);
    setPhase('playing');
    if (config.timePerYear > 0) setTimeLeft(config.timePerYear);
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
        <AnimatedBackground category="finance" />
        <DifficultySelector
          title="Retirement Countdown"
          description="Grow a retirement nest egg from age 25 to 65. Make smart savings and investment decisions!"
          icon={<PiggyBank className="h-14 w-14 text-brand-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 20 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Career Complete</h3>
            <div className="font-display font-extrabold text-5xl text-brand-600 mb-2 animate-pop-in">{eng.score} / {totalRounds * 3}</div>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 25 ? "You're retirement-ready!" : eng.score >= 18 ? 'On track for a solid retirement.' : 'Time to reconsider your strategy.'}
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
      <AnimatedBackground category="finance" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} timeLeft={timeLeft > 0 ? timeLeft : undefined} />
        <div className="mb-1 text-xs text-ink-400">Age {yearData?.age} — Year {round + 1} of {totalRounds}</div>

        <div key={round} className="rounded-xl bg-brand-50 border border-brand-200 p-4 mb-3 animate-slide-in-right">
          <p className="font-display font-semibold text-ink-900">{yearData?.event}</p>
        </div>

        <div className="space-y-2.5 mb-4">
          {yearData?.options.map((option, idx) => {
            const isSelected = selected === idx;
            const showResult = selected !== null;
            const isCorrect = option.saveRate >= 10;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={`w-full text-left rounded-lg border p-3.5 text-sm transition-all animate-slide-in-right ${
                  showResult
                    ? isCorrect ? 'border-brand-400 bg-brand-50'
                    : isSelected ? 'border-red-300 bg-red-50 animate-shake'
                    : 'border-ink-200 bg-white opacity-60'
                    : 'border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/50 hover:scale-[1.02] cursor-pointer'
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-800">{option.text}</span>
                  {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 animate-check-bounce" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="animate-fade-in rounded-lg border border-ink-200 bg-ink-50 p-3 mb-4">
            <div className="flex items-start gap-2">
              {feedback.correct ? <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5 animate-check-bounce" />
              : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
              <p className="text-sm text-ink-700">{feedback.text}</p>
            </div>
          </div>
        )}

        {selected !== null && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">
            {round + 1 >= totalRounds ? 'See Results' : 'Next Year'}
          </button>
        )}
      </div>
    </div>
  );
}
