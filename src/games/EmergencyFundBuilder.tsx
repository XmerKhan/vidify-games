import { useState, useMemo, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface MonthEvent {
  expense: number;
  description: string;
}

const EVENTS: MonthEvent[] = [
  { expense: 0, description: 'A quiet month — no emergencies.' },
  { expense: 0, description: 'Everything runs smoothly this month.' },
  { expense: 350, description: 'Car needs new brake pads.' },
  { expense: 1200, description: 'Unexpected medical bill after an injury.' },
  { expense: 80, description: 'Phone screen cracked — minor repair.' },
  { expense: 500, description: 'Hot water heater breaks down.' },
  { expense: 250, description: 'Vet visit for your pet.' },
  { expense: 2000, description: 'Job loss! You need 2 months of expenses.' },
  { expense: 0, description: 'A peaceful month with no surprises.' },
  { expense: 400, description: 'Dental emergency requires a root canal.' },
  { expense: 150, description: 'Parking ticket and minor car scratch.' },
  { expense: 900, description: 'Refrigerator dies — need a replacement.' },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { months: number; monthlyIncome: number; target: number }> = {
  basic: { months: 10, monthlyIncome: 4000, target: 6000 },
  tough: { months: 12, monthlyIncome: 4000, target: 12000 },
  high: { months: 15, monthlyIncome: 3500, target: 18000 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '10 months, $4K income, $6K target',
  tough: '12 months, $4K income, $12K target',
  high: '15 months, $3.5K income, $18K target',
};

const ACHIEVEMENTS = [
  { id: 'first-save', title: 'First Saver', description: 'Saved money your first month', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Consistent Saver', description: 'Saved 5 months in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'reach-target', title: 'Goal Crusher', description: 'Reached your emergency fund target', condition: (s: any) => s.score >= 100 },
  { id: 'no-debt', title: 'Debt Free', description: 'Never went into debt', condition: (s: any) => s.score >= 80 && s.wrong === 0 },
];

export default function EmergencyFundBuilder({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [month, setMonth] = useState(0);
  const [savings, setSavings] = useState(0);
  const [debt, setDebt] = useState(0);
  const [saveAmount, setSaveAmount] = useState(500);
  const [event, setEvent] = useState<MonthEvent | null>(null);
  const [showEvent, setShowEvent] = useState(false);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.basic;

  const eventList = useMemo(() => [...EVENTS].sort(() => Math.random() - 0.5), []);

  useEffect(() => {
    if (phase === 'playing' && !showEvent && month < config.months) {
      const evt = eventList[month % eventList.length];
      setEvent(evt);
    }
  }, [phase, showEvent, month, eventList, config.months]);

  const handleSave = () => {
    if (showEvent) return;
    const evt = eventList[month % eventList.length];
    let newSavings = savings + saveAmount;
    let newDebt = debt;

    if (evt.expense > 0) {
      if (newSavings >= evt.expense) {
        newSavings -= evt.expense;
      } else {
        const shortfall = evt.expense - newSavings;
        newSavings = 0;
        newDebt += shortfall;
      }
    }

    const didSave = saveAmount >= 200;
    const stayedOutOfDebt = newDebt === 0;

    if (didSave && stayedOutOfDebt) {
      eng.onCorrect(3);
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
    } else if (!didSave) {
      eng.onWrong();
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
    }

    setSavings(newSavings);
    setDebt(newDebt);
    setShowEvent(true);
  };

  const nextMonth = () => {
    if (month + 1 >= config.months) {
      const finalScore = Math.round(savings - debt * 0.5);
      eng.setScore(Math.max(0, finalScore));
      setPhase('gameover');
      eng.playSound('game-over');
      eng.checkAchievements(finalScore);
      onAchievement?.();
    } else {
      setMonth((m) => m + 1);
      setShowEvent(false);
      setEvent(null);
    }
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    eng.reset();
    setSavings(0);
    setDebt(0);
    setMonth(0);
    setShowEvent(false);
    setPhase('playing');
  };

  const reset = () => {
    eng.reset();
    setSavings(0);
    setDebt(0);
    setMonth(0);
    setShowEvent(false);
    setPhase('playing');
  };

  const changeDifficulty = () => setPhase('difficulty');
  const resetAll = () => {
    setPhase('cover');
    setDifficulty(null);
    reset();
  };

  const progressPct = Math.min(100, (savings / config.target) * 100);

  if (phase === 'cover') {
    return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;
  }

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="finance" />
        <DifficultySelector
          title="Emergency Fund Builder"
          description="Save toward a target emergency fund while life throws surprises. Stay out of debt!"
          icon={<Shield className="h-14 w-14 text-brand-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    const finalScore = Math.round(savings - debt * 0.5);
    return (
      <div className="relative">
        <Confetti trigger={finalScore >= config.target * 0.8 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Final Report</h3>
            <div className="font-display font-extrabold text-5xl text-brand-600 mb-2 animate-pop-in">${Math.max(0, finalScore)}</div>
            <p className="text-sm text-ink-500 mb-2">Savings: ${savings} | Debt: ${debt}</p>
            <p className="text-sm text-ink-500 mb-4">
              {finalScore >= config.target ? 'Emergency fund fully built!' : finalScore >= config.target * 0.6 ? 'Great progress!' : 'Keep saving — you\'ll get there.'}
            </p>
            <button onClick={reset} className="btn-secondary w-full">Play Again</button>
            <button onClick={changeDifficulty} className="btn-ghost mt-2 w-full text-sm">Change Difficulty</button>
          </div>
          <div>
            <Leaderboard slug={game.slug} score={Math.max(0, finalScore)} onPlayAgain={resetAll} />
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
        <GameHUD level={eng.level} streak={eng.streak} score={Math.max(0, Math.round(savings - debt * 0.5))} />
        <div className="mb-1 text-xs text-ink-400">Month {month + 1} of {config.months}</div>

        <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-ink-700">Emergency Fund</span>
            <span className="text-sm font-bold text-brand-600">${savings} / ${config.target}</span>
          </div>
          <div className="h-4 bg-brand-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          {debt > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Debt: ${debt} (paying interest each month)</span>
            </div>
          )}
        </div>

        {!showEvent ? (
          <div className="animate-fade-in">
            <p className="text-sm text-ink-600 mb-3">How much do you want to save this month?</p>
            <div className="flex gap-2 mb-3">
              {[0, 200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSaveAmount(amt)}
                  className={`flex-1 rounded-lg border p-2.5 text-sm font-semibold transition-all ${
                    saveAmount === amt
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300'
                  }`}
                >
                  {amt === 0 ? 'Nothing' : `$${amt}`}
                </button>
              ))}
            </div>
            <button onClick={handleSave} className="btn-primary w-full animate-glow-pulse">
              Save & Continue
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className={`rounded-lg border p-3 mb-3 ${event && event.expense > 0 ? 'border-accent-300 bg-accent-50' : 'border-brand-300 bg-brand-50'}`}>
              <div className="flex items-start gap-2">
                {event && event.expense > 0 ? <AlertTriangle className="h-5 w-5 text-accent-600 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-sm font-semibold text-ink-800">{event?.description}</p>
                  {event && event.expense > 0 && (
                    <p className="text-sm text-ink-600 mt-1">
                      Cost: ${event.expense}
                      {savings >= event.expense ? ' — covered by savings!' : ' — you went into debt!'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button onClick={nextMonth} className="btn-primary w-full animate-glow-pulse">
              {month + 1 >= config.months ? 'See Final Report' : 'Next Month'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
