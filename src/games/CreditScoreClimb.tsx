import { useState, useMemo } from 'react';
import { CreditCard, CheckCircle2, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface Decision {
  question: string;
  options: { text: string; impact: number; feedback: string }[];
}

const DECISIONS: Decision[] = [
  {
    question: "Your credit card bill arrives. You can pay the full balance or the minimum. What do you do?",
    options: [
      { text: "Pay the full balance on time", impact: 15, feedback: "Excellent! Paying in full and on time is the #1 thing you can do for your score." },
      { text: "Pay the minimum on time", impact: 5, feedback: "On-time payment helps, but carrying a balance increases your utilization." },
      { text: "Pay a few days late", impact: -20, feedback: "Late payments can drop your score by 50-100 points and stay on your report for 7 years." },
      { text: "Skip this month's payment", impact: -30, feedback: "Missing a payment is devastating to your credit score and triggers late fees." },
    ],
  },
  {
    question: "Your credit limit is $10,000 and your balance is $4,500. What should you do?",
    options: [
      { text: "Pay it down to under $3,000 (under 30% utilization)", impact: 15, feedback: "Perfect! Keeping utilization under 30% is a major positive factor." },
      { text: "Keep the balance where it is", impact: -5, feedback: "45% utilization is above the recommended threshold and hurts your score." },
      { text: "Request a credit limit increase instead", impact: 8, feedback: "A higher limit lowers utilization, but only if you don't spend more." },
      { text: "Max out the card to get rewards points", impact: -25, feedback: "Maxing out cards signals financial distress and tanks your utilization ratio." },
    ],
  },
  {
    question: "You want to buy a car and the dealer offers financing through 3 different lenders. What do you do?",
    options: [
      { text: "Rate-shop all 3 within 14 days", impact: 12, feedback: "Smart! Multiple auto loan inquiries within 14 days count as a single inquiry." },
      { text: "Apply to one lender only", impact: 5, feedback: "Safe, but you miss the rate-shopping protection for multiple inquiries." },
      { text: "Apply to 5 lenders spread over 2 months", impact: -10, feedback: "Spreading inquiries over months means each one counts separately against you." },
      { text: "Apply to 10 lenders to find the best rate", impact: -15, feedback: "Too many hard inquiries signal desperation for credit, even within the window." },
    ],
  },
  {
    question: "You've had your oldest credit card for 10 years. A new card with better rewards looks tempting. What do you do?",
    options: [
      { text: "Keep the old card open and get the new one", impact: 12, feedback: "Great! Keeping old accounts open preserves your credit age history." },
      { text: "Close the old card and switch to the new one", impact: -15, feedback: "Closing your oldest account shortens your credit history and lowers your score." },
      { text: "Keep the old card but never use it", impact: 3, feedback: "The account stays open, but inactivity may lead the issuer to close it eventually." },
      { text: "Open 3 new cards to maximize rewards", impact: -10, feedback: "Multiple new accounts lower your average credit age and signal risk." },
    ],
  },
  {
    question: "You check your credit report and find an error — a collection account that isn't yours. What do you do?",
    options: [
      { text: "Dispute it immediately with the credit bureau", impact: 15, feedback: "Exactly right! Disputing errors can remove negative items and raise your score." },
      { text: "Ignore it — it's not your debt so it doesn't matter", impact: -15, feedback: "Even false collections damage your score until you dispute them." },
      { text: "Pay it just to make it go away", impact: -5, feedback: "Paying a collection you don't owe validates it and doesn't remove it from your report." },
      { text: "Wait a year to see if it falls off", impact: -10, feedback: "Collections can stay on your report for 7 years. Don't wait — dispute it." },
    ],
  },
  {
    question: "You have only one credit card. A friend says having more types of credit helps your score. What do you do?",
    options: [
      { text: "Add a small installment loan to diversify your credit mix", impact: 10, feedback: "Good! A mix of revolving and installment credit can boost your score." },
      { text: "Open 3 more credit cards", impact: -8, feedback: "Too many new revolving accounts at once signals risk and lowers your average age." },
      { text: "Keep just the one card — credit mix is a small factor", impact: 3, feedback: "Reasonable. Credit mix is only 10% of your score, so it's not urgent." },
      { text: "Close the card and use only debit", impact: -25, feedback: "No credit history means no credit score, which hurts you when you need to borrow." },
    ],
  },
  {
    question: "You're offered a store credit card with 25% off today's purchase. The card has a 29% APR. What do you do?",
    options: [
      { text: "Decline — the APR and low limit make it a poor choice", impact: 12, feedback: "Smart! Store cards often have high APRs and low limits that hurt utilization." },
      { text: "Open it for the discount, pay it off, then close it", impact: -5, feedback: "Opening and closing accounts quickly can ding your score with a hard inquiry." },
      { text: "Open it and use it regularly for the rewards", impact: -10, feedback: "Store cards typically have worse terms than general-purpose rewards cards." },
      { text: "Open it and carry a balance to build credit", impact: -20, feedback: "Carrying a balance at 29% APR is extremely expensive and doesn't build credit faster." },
    ],
  },
  {
    question: "You're planning to buy a house in 6 months. What's the best credit strategy?",
    options: [
      { text: "Pay down balances, avoid new applications, check your report", impact: 15, feedback: "Perfect preparation! This maximizes your score before a major loan application." },
      { text: "Open a new card to increase your total credit limit", impact: -8, feedback: "A new hard inquiry and lower average age could hurt right before a mortgage." },
      { text: "Pay off and close all your credit cards", impact: -25, feedback: "Closing all cards eliminates your credit history and can drop your score significantly." },
      { text: "Don't change anything — your score is fine", impact: 2, feedback: "If your score is already excellent, this is okay, but proactive improvement is better." },
    ],
  },
  {
    question: "You lost your job and can't make your credit card payment this month. What's the best move?",
    options: [
      { text: "Call the lender and ask for a hardship program", impact: 10, feedback: "Excellent! Many lenders offer hardship programs that can pause or reduce payments." },
      { text: "Skip the payment and hope to catch up next month", impact: -25, feedback: "Missing payments without communicating triggers late fees and credit damage." },
      { text: "Take a cash advance from another card to pay this one", impact: -20, feedback: "Robbing Peter to pay Paul adds fees and interest without solving the problem." },
      { text: "Pay the minimum using your emergency fund", impact: 5, feedback: "Paying the minimum keeps your payment history clean, though it's not ideal long-term." },
    ],
  },
  {
    question: "Your credit score went from 680 to 720 in 3 months. What likely caused this?",
    options: [
      { text: "You paid down your credit card balances significantly", impact: 15, feedback: "Correct! Lowering utilization is one of the fastest ways to boost your score." },
      { text: "You opened 5 new credit cards", impact: -5, feedback: "New accounts typically lower your score in the short term, not raise it." },
      { text: "You closed your oldest credit card", impact: -10, feedback: "Closing old accounts typically lowers your score, not raises it." },
      { text: "It happened randomly — scores fluctuate for no reason", impact: -5, feedback: "Scores change based on specific factors, not randomly. Understanding them helps." },
    ],
  },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number; timePerDecision: number }> = {
  basic: { rounds: 5, timePerDecision: 0 },
  tough: { rounds: 7, timePerDecision: 25 },
  high: { rounds: 10, timePerDecision: 15 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '5 decisions, no timer',
  tough: '7 decisions, 25s each',
  high: '10 decisions, 15s each',
};

const ACHIEVEMENTS = [
  { id: 'first-good', title: 'Credit Beginner', description: 'Made your first smart credit decision', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Credit Pro', description: '5 smart decisions in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'score-100', title: 'Score Climber', description: 'Reached a credit score of 100+', condition: (s: any) => s.score >= 100 },
  { id: 'score-150', title: 'Excellent Credit', description: 'Reached a credit score of 150+', condition: (s: any) => s.score >= 150 },
  { id: 'perfect', title: 'Credit Expert', description: 'All correct decisions in a round', condition: (s: any) => s.correct >= 10 && s.wrong === 0 },
];

export default function CreditScoreClimb({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; impact: number; correct: boolean } | null>(null);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.tough;
  const totalRounds = config.rounds;

  const decisionList = useMemo(() => [...DECISIONS].sort(() => Math.random() - 0.5).slice(0, totalRounds), [totalRounds]);
  const decision = decisionList[round];

  useState(() => {
    if (phase === 'playing' && config.timePerDecision > 0) {
      setTimeLeft(config.timePerDecision);
    }
  });

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const option = decision.options[idx];
    const isCorrect = option.impact > 0;
    setFeedback({ text: option.feedback, impact: option.impact, correct: isCorrect });
    if (isCorrect) {
      eng.onCorrect(Math.max(1, Math.round(option.impact / 3)));
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
      if (config.timePerDecision > 0) setTimeLeft(config.timePerDecision);
    }
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    eng.reset();
    setPhase('playing');
    if (DIFFICULTY_CONFIG[diff].timePerDecision > 0) setTimeLeft(DIFFICULTY_CONFIG[diff].timePerDecision);
  };

  const reset = () => {
    setRound(0);
    eng.reset();
    setSelected(null);
    setFeedback(null);
    setPhase('playing');
    if (config.timePerDecision > 0) setTimeLeft(config.timePerDecision);
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
          title="Credit Score Climb"
          description="Make smart financial decisions to raise your credit score from poor to excellent!"
          icon={<CreditCard className="h-14 w-14 text-brand-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 100 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Credit Report</h3>
            <div className="font-display font-extrabold text-5xl text-brand-600 mb-2 animate-pop-in">{eng.score}</div>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 120 ? 'Excellent credit decisions!' : eng.score >= 80 ? 'Good credit management skills.' : 'Room to improve your credit knowledge.'}
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
        <div className="mb-1 text-xs text-ink-400">Decision {round + 1} / {totalRounds}</div>

        <div key={round} className="rounded-xl bg-brand-50 border border-brand-200 p-4 mb-3 animate-slide-in-right">
          <p className="font-display font-semibold text-ink-900">{decision?.question}</p>
        </div>

        <div className="space-y-2.5 mb-4">
          {decision?.options.map((option, idx) => {
            const isSelected = selected === idx;
            const showResult = selected !== null;
            const isBest = option.impact > 0;
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
              {feedback.correct ? <TrendingUp className="h-5 w-5 text-brand-600 shrink-0 mt-0.5 animate-check-bounce" />
              : <TrendingDown className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm text-ink-700">{feedback.text}</p>
                <p className={`text-xs font-semibold mt-1 ${feedback.impact > 0 ? 'text-brand-600' : 'text-red-500'}`}>
                  {feedback.impact > 0 ? `+${feedback.impact} to score` : `${feedback.impact} to score`}
                </p>
              </div>
            </div>
          </div>
        )}

        {selected !== null && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">
            {round + 1 >= totalRounds ? 'See Results' : 'Next Decision'}
          </button>
        )}
      </div>
    </div>
  );
}
