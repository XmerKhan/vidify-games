import { useState, useMemo } from 'react';
import { Scale, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface Scenario {
  question: string;
  options: { text: string; score: number; feedback: string }[];
}

const SCENARIOS: Scenario[] = [
  { question: "You get a $600 tax refund. What do you do?", options: [
    { text: "Put $400 in savings, spend $200 on something fun", score: 3, feedback: "Balanced — you saved most of it while still treating yourself." },
    { text: "Spend it all on a new gaming console", score: 0, feedback: "Windfalls are best partially saved. This money is gone with nothing to show long-term." },
    { text: "Put it all in your emergency fund", score: 3, feedback: "Excellent — a refund is perfect for boosting your safety net." },
    { text: "Use it to pay down credit card debt", score: 3, feedback: "Smart — paying off high-interest debt is like a guaranteed return on investment." },
  ]},
  { question: "Your phone works fine, but a new model just launched. What do you do?", options: [
    { text: "Keep your current phone — it still works", score: 3, feedback: "Perfect. The 'new phone itch' is a classic want disguised as a need." },
    { text: "Upgrade and finance it over 24 months", score: 0, feedback: "Financing a phone you don't need adds a monthly payment for years." },
    { text: "Wait 6 months and buy it used", score: 3, feedback: "Smart — waiting lets the price drop and the hype fade." },
    { text: "Buy it outright only if your current phone is broken", score: 2, feedback: "Reasonable — buying outright avoids financing, but only if truly needed." },
  ]},
  { question: "A friend invites you to a $80 dinner. You've already spent your fun budget this month.", options: [
    { text: "Go anyway — it's a special occasion", score: 1, feedback: "Occasional exceptions are fine, but this habit erodes your budget over time." },
    { text: "Suggest a home-cooked dinner instead", score: 3, feedback: "Great compromise — you keep the social connection without overspending." },
    { text: "Decline and plan to see them next month", score: 2, feedback: "Respectable — staying within budget shows discipline." },
    { text: "Go and skip groceries next week to compensate", score: 0, feedback: "Robbing essentials to fund discretionary spending is a red flag." },
  ]},
  { question: "You're offered a store credit card for 20% off today's purchase. What do you do?", options: [
    { text: "Open it for the discount, then close it next month", score: 1, feedback: "Opening and closing cards quickly can ding your credit score." },
    { text: "Decline — the discount isn't worth a hard credit pull", score: 3, feedback: "Smart. Store cards often have high interest rates and low limits." },
    { text: "Open it and use it regularly for the rewards", score: 0, feedback: "Store cards usually have worse terms than general rewards cards." },
    { text: "Only open it if you were already planning a large purchase", score: 2, feedback: "Reasonable — the 20% can be worth it for big one-time buys if paid off immediately." },
  ]},
  { question: "Your car needs a $1,200 repair. You have $2,000 in savings. What do you do?", options: [
    { text: "Pay from savings — that's what it's for", score: 3, feedback: "Exactly right. Emergency funds are for exactly this kind of surprise." },
    { text: "Put it on a credit card and pay it off slowly", score: 0, feedback: "Financing a repair at 20%+ interest turns $1,200 into much more." },
    { text: "Get a second quote to see if it's cheaper elsewhere", score: 3, feedback: "Excellent — always comparison shop on major expenses." },
    { text: "Skip the repair and hope it's not serious", score: 0, feedback: "Delaying repairs usually makes them more expensive down the road." },
  ]},
  { question: "You're browsing and see a 70% off sale on shoes you don't need. What do you do?", options: [
    { text: "Buy them — 70% off is too good to pass up", score: 0, feedback: "A discount on something you don't need is still 30% wasted." },
    { text: "Leave them — sales come and go", score: 3, feedback: "Perfect. 'Deal fatigue' is a real thing — marketers use urgency to trigger impulse buys." },
    { text: "Buy them only if you'd pay full price", score: 3, feedback: "Great test — if you wouldn't buy it at full price, you don't really want it." },
    { text: "Buy and return them later if you change your mind", score: 1, feedback: "Returns are a hassle and many purchases never get returned." },
  ]},
  { question: "You get a raise of $300/month. What's the smartest first move?", options: [
    { text: "Increase your lifestyle to match", score: 0, feedback: "Lifestyle creep eats raises before they can build wealth." },
    { text: "Split it: half to savings, half to lifestyle", score: 3, feedback: "Excellent — you enjoy the raise while still building your future." },
    { text: "Put it all in savings/investments", score: 3, feedback: "Aggressive but powerful — your future self will thank you." },
    { text: "Use it to pay off any outstanding debt first", score: 3, feedback: "Very smart — clearing debt first frees up even more cash flow." },
  ]},
  { question: "A subscription you forgot about charges you $15 for the third month. What do you do?", options: [
    { text: "Cancel it immediately and audit other subscriptions", score: 3, feedback: "Perfect — forgotten subscriptions silently drain hundreds per year." },
    { text: "Keep it — you might use it eventually", score: 0, feedback: "'Eventually' rarely comes. Unused subscriptions are pure waste." },
    { text: "Cancel it but don't check others", score: 2, feedback: "Good start, but if you forgot one, you probably forgot others too." },
    { text: "Try to get a refund for the past charges", score: 2, feedback: "Worth trying, but prevention (canceling) matters more than recovery." },
  ]},
  { question: "You need a laptop for work. Which option is smartest?", options: [
    { text: "Buy the most expensive one — it'll last longer", score: 1, feedback: "Not always true. Mid-range laptops often last just as long for typical use." },
    { text: "Buy refurbished from a reputable seller", score: 3, feedback: "Excellent — refurbished electronics offer great value with warranty coverage." },
    { text: "Finance the newest model over 36 months", score: 0, feedback: "Financing a depreciating asset for 3 years means you overpay and it's outdated before it's paid off." },
    { text: "Buy what meets your needs and save the difference", score: 3, feedback: "Perfect — matching the tool to the job is the most cost-effective approach." },
  ]},
  { question: "You're at the grocery store, hungry, with no list. What's likely to happen?", options: [
    { text: "Shop anyway — you'll be fine", score: 0, feedback: "Shopping hungry without a list is the #1 recipe for impulse spending." },
    { text: "Grab a snack first, then shop with a rough list", score: 3, feedback: "Smart — eating first and having a plan cuts grocery spending by 20-40%." },
    { text: "Order delivery instead", score: 1, feedback: "Delivery fees and markups often cost more than a few impulse items." },
    { text: "Buy only essentials and come back tomorrow", score: 3, feedback: "Excellent discipline — a targeted trip prevents overspending." },
  ]},
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number; timePerScenario: number }> = {
  basic: { rounds: 5, timePerScenario: 0 },
  tough: { rounds: 8, timePerScenario: 20 },
  high: { rounds: 10, timePerScenario: 12 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '5 scenarios, no timer',
  tough: '8 scenarios, 20s each',
  high: '10 scenarios, 12s each',
};

const ACHIEVEMENTS = [
  { id: 'first-choice', title: 'Money Manager', description: 'Made your first smart choice', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Smart Spender', description: '5 smart choices in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'perfect-round', title: 'Budget Genius', description: 'Perfect round — all smart choices', condition: (s: any) => s.correct >= 10 && s.wrong === 0 },
  { id: 'score-25', title: 'Financial Wizard', description: 'Scored 25+ points', condition: (s: any) => s.score >= 25 },
  { id: 'score-30', title: 'Money Master', description: 'Perfect score of 30', condition: (s: any) => s.score >= 30 },
];

function BalanceScale({ tip }: { tip: 'left' | 'right' | 'balanced' }) {
  const rotation = tip === 'left' ? -12 : tip === 'right' ? 12 : 0;
  return (
    <div className="flex flex-col items-center my-3">
      <svg width="120" height="80" viewBox="0 0 120 80" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.5s ease-in-out' }}>
        <rect x="58" y="40" width="4" height="35" fill="#6b7280" rx="2" />
        <rect x="35" y="38" width="50" height="4" fill="#6b7280" rx="2" />
        <circle cx="35" cy="42" r="14" fill={tip === 'left' ? '#10a37f' : '#d1d5db'} stroke="#6b7280" strokeWidth="1.5" />
        <circle cx="85" cy="42" r="14" fill={tip === 'right' ? '#ef4444' : '#d1d5db'} stroke="#6b7280" strokeWidth="1.5" />
        <rect x="50" y="72" width="20" height="4" fill="#6b7280" rx="2" />
      </svg>
      <div className="text-xs text-ink-400 mt-1">
        {tip === 'left' ? 'Smart choice!' : tip === 'right' ? 'Risky choice' : 'Balanced'}
      </div>
    </div>
  );
}

export default function SaveOrSpend({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; score: number; correct: boolean } | null>(null);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.tough;
  const totalRounds = config.rounds;

  const scenarioList = useMemo(() => [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, totalRounds), [totalRounds]);
  const scenario = scenarioList[round];
  const scaleTip = selected !== null && scenario ? (scenario.options[selected].score >= 2 ? 'left' : scenario.options[selected].score >= 1 ? 'balanced' : 'right') : 'balanced';

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const option = scenario.options[idx];
    const isCorrect = option.score >= 2;
    setFeedback({ text: option.feedback, score: option.score, correct: isCorrect });
    if (isCorrect) {
      eng.onCorrect(option.score);
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
    } else {
      eng.onWrong();
      eng.setScore((s) => s + option.score);
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
    }
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    eng.reset();
    setPhase('playing');
  };

  const reset = () => {
    setRound(0);
    eng.reset();
    setSelected(null);
    setFeedback(null);
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
        <AnimatedBackground category="finance" />
        <DifficultySelector
          title="Save or Spend"
          description="Test your financial instincts! Choose the smartest option in each scenario."
          icon={<Scale className="h-14 w-14 text-brand-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 25 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Game Complete</h3>
            <div className="font-display font-extrabold text-5xl text-ink-900 mb-2 animate-pop-in">{eng.score} / {totalRounds * 3}</div>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 25 ? 'Outstanding financial judgment!' : eng.score >= 18 ? 'Solid instincts — a few habits to refine.' : 'Room to grow. Play again to sharpen your money skills.'}
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
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} />
        <div className="mb-1 text-xs text-ink-400">Round {round + 1} / {totalRounds}</div>

        <div key={round} className="rounded-xl bg-brand-50 border border-brand-200 p-4 mb-3 animate-slide-in-right">
          <p className="font-display font-semibold text-ink-900">{scenario?.question}</p>
        </div>

        <BalanceScale tip={scaleTip} />

        <div className="space-y-2.5 mb-4">
          {scenario?.options.map((option, idx) => {
            const isSelected = selected === idx;
            const showResult = selected !== null;
            const isBest = option.score >= 2;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={`w-full text-left rounded-lg border p-3.5 text-sm transition-all animate-slide-in-right ${
                  showResult
                    ? isBest ? 'border-brand-400 bg-brand-50'
                    : isSelected ? 'border-red-300 bg-red-50 animate-shake'
                    : 'border-ink-200 bg-white opacity-60'
                    : 'border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/50 hover:scale-[1.02] cursor-pointer'
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-800">{option.text}</span>
                  {showResult && isBest && <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 animate-check-bounce" />}
                  {showResult && isSelected && !isBest && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="animate-fade-in rounded-lg border border-ink-200 bg-ink-50 p-3 mb-4">
            <div className="flex items-start gap-2">
              {feedback.correct ? <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5 animate-check-bounce" />
              : feedback.score === 1 ? <AlertCircle className="h-5 w-5 text-accent-500 shrink-0 mt-0.5" />
              : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm text-ink-700">{feedback.text}</p>
                <p className="text-xs font-semibold text-ink-500 mt-1">+{feedback.score} points</p>
              </div>
            </div>
          </div>
        )}

        {selected !== null && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">
            {round + 1 >= totalRounds ? 'See Results' : 'Next Scenario'}
          </button>
        )}
      </div>
    </div>
  );
}
