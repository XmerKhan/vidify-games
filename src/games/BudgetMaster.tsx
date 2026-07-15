import { useState, useCallback } from 'react';
import { Wallet, CheckCircle2, AlertTriangle, XCircle, Zap } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { playSound } from '../lib/sound';
import { unlockAchievement, hasAchievement } from '../lib/storage';

interface Category {
  key: string; label: string; icon: string; min: number; max: number; ideal: [number, number]; weight: number;
}

const CATEGORIES: Category[] = [
  { key: 'rent', label: 'Rent / Housing', icon: '🏠', min: 10, max: 50, ideal: [25, 35], weight: 25 },
  { key: 'food', label: 'Food & Groceries', icon: '🍽️', min: 5, max: 30, ideal: [10, 20], weight: 20 },
  { key: 'transport', label: 'Transportation', icon: '🚗', min: 0, max: 25, ideal: [5, 15], weight: 15 },
  { key: 'savings', label: 'Savings', icon: '🏦', min: 0, max: 40, ideal: [15, 25], weight: 25 },
  { key: 'fun', label: 'Entertainment', icon: '🎮', min: 0, max: 30, ideal: [5, 15], weight: 15 },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { salary: number; tolerance: number }> = {
  basic: { salary: 4000, tolerance: 15 },
  tough: { salary: 3000, tolerance: 8 },
  high: { salary: 2000, tolerance: 4 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '$4,000 salary, generous scoring',
  tough: '$3,000 salary, stricter scoring',
  high: '$2,000 salary, tight budget challenge',
};

export default function BudgetMaster({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'result'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [allocations, setAllocations] = useState<Record<string, number>>({ rent: 30, food: 15, transport: 10, savings: 10, fun: 10 });
  const [result, setResult] = useState<{ score: number; breakdown: { cat: Category; pct: number; status: 'good' | 'warn' | 'bad'; feedback: string }[] } | null>(null);
  const [streak, setStreak] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);
  const [coinAnims, setCoinAnims] = useState<Record<string, number>>({});

  const total = Object.values(allocations).reduce((a, b) => a + b, 0);

  const handleSlider = useCallback((key: string, value: number) => {
    setAllocations((prev) => ({ ...prev, [key]: value }));
    setCoinAnims((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  }, []);

  const evaluate = () => {
    const breakdown = CATEGORIES.map((cat) => {
      const pct = allocations[cat.key];
      const [lo, hi] = cat.ideal;
      let status: 'good' | 'warn' | 'bad';
      let feedback: string;
      if (pct >= lo && pct <= hi) {
        status = 'good';
        feedback = `Great — ${pct}% is in the recommended range of ${lo}–${hi}%.`;
      } else if (pct < lo) {
        if (cat.key === 'savings') { status = 'bad'; feedback = `Under-saving at ${pct}%. Try to reach at least ${lo}%.`; }
        else { status = 'warn'; feedback = `${pct}% is below the ${lo}–${hi}% range. Fine if your costs are low, but check it.`; }
      } else {
        status = pct > hi + 10 ? 'bad' : 'warn';
        feedback = `${pct}% exceeds the recommended ${lo}–${hi}%. This could strain your budget.`;
      }
      return { cat, pct, status, feedback };
    });

    let score = 0;
    let goodCount = 0;
    breakdown.forEach(({ cat, status }) => {
      if (status === 'good') { score += cat.weight; goodCount++; }
      else if (status === 'warn') score += cat.weight * 0.5;
    });

    if (total > 100) score -= 20;
    if (total < 90) score -= 10;
    if (total === 100) score += 5;
    score = Math.max(0, Math.min(100, Math.round(score)));

    setResult({ score, breakdown });
    setStreak(goodCount);
    if (score >= 75) {
      playSound('level-up');
      setConfettiTrigger((t) => t + 1);
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
    } else if (score >= 50) {
      playSound('correct');
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
    } else {
      playSound('wrong');
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
    }

    if (!hasAchievement(game.slug, 'first-budget')) unlockAchievement(game.slug, { id: 'first-budget', title: 'First Budget', description: 'Evaluated your first budget' });
    if (score >= 90 && !hasAchievement(game.slug, 'budget-genius')) unlockAchievement(game.slug, { id: 'budget-genius', title: 'Budget Genius', description: 'Scored 90+ on your budget' });
    if (score >= 100 && !hasAchievement(game.slug, 'perfect-budget')) unlockAchievement(game.slug, { id: 'perfect-budget', title: 'Perfect Budget', description: 'Achieved a perfect score of 100' });
    if (goodCount === 5 && !hasAchievement(game.slug, 'all-good')) unlockAchievement(game.slug, { id: 'all-good', title: 'Balanced Life', description: 'All categories in the recommended range' });
    if (allocations.savings >= 20 && !hasAchievement(game.slug, 'super-saver')) unlockAchievement(game.slug, { id: 'super-saver', title: 'Super Saver', description: 'Allocated 20%+ to savings' });
    onAchievement?.();
    setPhase('result');
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    setAllocations({ rent: 30, food: 15, transport: 10, savings: 10, fun: 10 });
    setPhase('playing');
  };

  const reset = () => {
    setResult(null);
    setAllocations({ rent: 30, food: 15, transport: 10, savings: 10, fun: 10 });
    setStreak(0);
    setPhase('playing');
  };

  const changeDifficulty = () => {
    setResult(null);
    setPhase('difficulty');
  };

  const resetAll = () => {
    setPhase('cover');
    setDifficulty(null);
    setResult(null);
    setAllocations({ rent: 30, food: 15, transport: 10, savings: 10, fun: 10 });
    setStreak(0);
  };

  if (phase === 'cover') {
    return (
      <PlayCover
        title={game.title}
        tagline={game.tagline}
        category={game.category}
        slug={game.slug}
        onPlay={() => setPhase('difficulty')}
      />
    );
  }

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="finance" />
        <DifficultySelector
          title="Budget Master"
          description="Allocate your monthly salary across categories. Higher difficulty means a tighter salary and less room for error."
          icon={<Wallet className="h-14 w-14 text-brand-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'result' && result) {
    return (
      <div className="relative">
        <Confetti trigger={confettiTrigger} />
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-5 w-5 text-brand-600" />
                <span className="text-sm font-semibold text-ink-500">Financial Health Score</span>
                {streak >= 4 && <span className="flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-bold text-accent-700"><Zap className="h-3 w-3" />{streak} good</span>}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-5xl text-ink-900 animate-pop-in">{result.score}</span>
                <span className="text-lg text-ink-400">/ 100</span>
              </div>
              <div className="mt-2 h-4 rounded-full bg-ink-100 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${result.score >= 75 ? 'bg-gradient-to-r from-brand-400 to-brand-600' : result.score >= 50 ? 'bg-gradient-to-r from-accent-400 to-accent-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`} style={{ width: `${result.score}%` }} />
              </div>
            </div>
            <div className="space-y-3">
              {result.breakdown.map(({ cat, pct, status, feedback }) => (
                <div key={cat.key} className="flex items-start gap-3 rounded-lg border border-ink-200 p-3 animate-slide-in-right">
                  {status === 'good' ? <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5 animate-check-bounce" />
                  : status === 'warn' ? <AlertTriangle className="h-5 w-5 text-accent-500 shrink-0 mt-0.5" />
                  : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink-900">{cat.icon} {cat.label}</span>
                      <span className="text-sm font-bold text-ink-700">{pct}%</span>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">{feedback}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={reset} className="btn-secondary mt-4 w-full">Try Again</button>
            <button onClick={changeDifficulty} className="btn-ghost mt-2 w-full text-sm">Change Difficulty</button>
          </div>
          <div>
            <Leaderboard slug={game.slug} score={result.score} onPlayAgain={resetAll} />
          </div>
        </div>
      </div>
    );
  }

  const config = DIFFICULTY_CONFIG[difficulty || 'basic'];

  return (
    <div className="relative">
      <AnimatedBackground category="finance" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD streak={streak} />
        <div className="mb-4 flex items-center justify-between animate-fade-in">
          <div>
            <span className="text-sm text-ink-500">Monthly Salary</span>
            <div className="font-display font-bold text-2xl text-ink-900">${config.salary.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <span className="text-sm text-ink-500">Allocated</span>
            <div className={`font-display font-bold text-2xl ${total === 100 ? 'text-brand-600' : total > 100 ? 'text-red-500' : 'text-ink-900'}`}>{total}%</div>
          </div>
        </div>

        <div className="mb-4 h-4 rounded-full bg-ink-100 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${total > 100 ? 'bg-red-400' : 'bg-gradient-to-r from-brand-400 to-brand-600'}`} style={{ width: `${Math.min(total, 100)}%` }} />
        </div>
        {total !== 100 && <p className="text-xs text-ink-400 mb-4">{total > 100 ? `${total - 100}% over budget — reduce some categories.` : `${100 - total}% left to allocate.`}</p>}

        <div className="space-y-5">
          {CATEGORIES.map((cat, i) => (
            <div key={cat.key} className="animate-slide-in-right" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-ink-800">{cat.icon} {cat.label}</label>
                <span className="text-sm font-bold text-ink-700">{allocations[cat.key]}% (${Math.round((allocations[cat.key] / 100) * config.salary).toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-3">
                <input type="range" min={cat.min} max={cat.max} value={allocations[cat.key]} onChange={(e) => handleSlider(cat.key, Number(e.target.value))} className="w-full accent-brand-600 cursor-pointer" />
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                  <span key={coinAnims[cat.key] || 0} className="text-lg animate-coin-drop" style={{ animationDuration: '0.5s' }}>🪙</span>
                </div>
              </div>
              <p className="text-xs text-ink-400 mt-0.5">Recommended: {cat.ideal[0]}–{cat.ideal[1]}%</p>
            </div>
          ))}
        </div>

        <button onClick={evaluate} disabled={total === 0} className="btn-primary mt-6 w-full text-base animate-glow-pulse">Evaluate My Budget</button>
      </div>
    </div>
  );
}
