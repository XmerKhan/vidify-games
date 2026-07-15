import { useState, useMemo } from 'react';
import { Home, CheckCircle2, XCircle } from 'lucide-react';
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
  situation: string;
  options: { text: string; correct: boolean; feedback: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    situation: "A young professional earning $60K/year in a city where rent is $1,800/mo. Homes cost $400K with a 3.5% mortgage rate. They have $40K saved.",
    options: [
      { text: "Buy — mortgage payments would be similar to rent", correct: false, feedback: "Hidden costs like property tax, insurance, maintenance, and closing costs add 30-40% to the monthly cost." },
      { text: "Continue renting and invest the down payment instead", correct: true, feedback: "Smart! At 7% return, $40K grows to ~$79K in 10 years. Home appreciation may not beat that after costs." },
      { text: "Buy only if planning to stay 7+ years", correct: true, feedback: "Correct! The break-even point for buying vs renting is typically 5-7 years due to transaction costs." },
      { text: "Buy the most expensive home they qualify for", correct: false, feedback: "Maxing out your mortgage approval leaves no room for maintenance, emergencies, or life changes." },
    ],
  },
  {
    situation: "A family found a home for $350K. They have $70K for a down payment (20%). Mortgage rate is 6.5%. Rent for a similar home would be $2,200/mo.",
    options: [
      { text: "Buy — 20% down avoids PMI and builds equity", correct: true, feedback: "Strong choice! 20% down eliminates PMI and the monthly cost may be competitive with rent." },
      { text: "Rent and save more for a bigger down payment", correct: false, feedback: "They already have 20% — waiting means paying rent and potentially facing higher prices or rates." },
      { text: "Buy with 5% down and invest the remaining $52K", correct: false, feedback: "PMI on a 5% down loan adds $200+/mo. The investment return may not offset the PMI cost." },
      { text: "Buy a $500K home instead with 10% down", correct: false, feedback: "Stretching the budget increases risk and adds PMI. Stay within comfortable affordability." },
    ],
  },
  {
    situation: "A retiree wants to downsize. Their paid-off home is worth $500K. Renting a smaller place costs $1,500/mo. Buying a condo costs $300K.",
    options: [
      { text: "Sell and buy the condo — lower maintenance, no mortgage", correct: true, feedback: "Excellent! Downsizing to a paid-off condo eliminates mortgage and reduces maintenance costs." },
      { text: "Sell and rent — more flexibility at their age", correct: true, feedback: "Also reasonable! Renting provides flexibility and $500K invested at 5% generates $2,083/mo to cover rent." },
      { text: "Stay in the large home — it's paid off", correct: false, feedback: "A paid-off home still has property tax, insurance, and maintenance costs that may exceed condo costs." },
      { text: "Take a reverse mortgage on the current home", correct: false, feedback: "Reverse mortgages have high fees and reduce the estate. Selling is often a better financial choice." },
    ],
  },
  {
    situation: "A couple in a high-cost city: rent is $3,500/mo. A comparable condo costs $800K. They have $160K saved (20% down). Mortgage rate is 7%.",
    options: [
      { text: "Buy — building equity beats paying rent", correct: false, feedback: "At 7% rate, total monthly cost (mortgage + tax + HOA + maintenance) likely exceeds $5,000 — much more than rent." },
      { text: "Continue renting — the math favors renting here", correct: true, feedback: "Correct! High rates and high prices make renting cheaper. The $160K invested at 7% grows to $315K in 10 years." },
      { text: "Buy only if rates drop to 5% or less", correct: true, feedback: "Smart! Refinancing when rates drop can make buying attractive later. Don't rush at unfavorable rates." },
      { text: "Buy and rent out a room to cover costs", correct: false, feedback: "Relying on rental income to afford a home adds risk. What if the roommate leaves?" },
    ],
  },
  {
    situation: "Someone is relocating for a 2-year job assignment. Homes in the area are affordable at $250K. Rent would be $1,400/mo.",
    options: [
      { text: "Rent — 2 years is too short to recover closing costs", correct: true, feedback: "Perfect! Closing costs (3-5% to buy + 6-10% to sell) can total $20K+ — that's $833/mo over 2 years, more than rent savings." },
      { text: "Buy and sell when the assignment ends", correct: false, feedback: "Transaction costs on both ends would likely exceed any appreciation in just 2 years." },
      { text: "Buy and keep it as a rental property after", correct: false, feedback: "Being a long-distance landlord is risky and expensive. Only do this if you have local property management." },
      { text: "Buy and try to negotiate a longer assignment", correct: false, feedback: "Don't buy a home based on a maybe. If the assignment isn't extended, you're stuck selling quickly." },
    ],
  },
  {
    situation: "A first-time buyer found a home for $300K. They can put 20% down ($60K) or 10% down ($30K) and keep $30K invested. Rate is 6%.",
    options: [
      { text: "Put 20% down to avoid PMI", correct: true, feedback: "Solid! PMI on a $270K loan adds ~$150/mo. That's $1,800/yr — hard to beat with investments." },
      { text: "Put 10% down and invest the $30K at 7%", correct: false, feedback: "$30K at 7% earns $2,100/yr, but PMI costs $1,800/yr plus you pay more interest on the bigger loan." },
      { text: "Put 5% down and invest $45K", correct: false, feedback: "The PMI and extra interest costs almost certainly exceed investment returns at these amounts." },
      { text: "Put 0% down with a VA loan and invest all $60K", correct: false, feedback: "Even without PMI, a larger loan means much more interest over 30 years. Run the full math." },
    ],
  },
  {
    situation: "Home prices in an area have risen 15% per year for 3 years. A buyer wonders if they should buy now before prices rise further.",
    options: [
      { text: "Wait — 15% annual growth is unsustainable long-term", correct: true, feedback: "Correct! Markets that rise that fast often correct. Don't buy based on fear of missing out." },
      { text: "Buy immediately before it gets more expensive", correct: false, feedback: "FOMO-driven purchases often happen at market peaks. Buy based on your needs and the fundamentals." },
      { text: "Buy if the monthly cost is affordable regardless of appreciation", correct: true, feedback: "Smart approach! If you can afford the payment and plan to stay long-term, appreciation shouldn't drive the decision." },
      { text: "Buy and flip in 2 years for profit", correct: false, feedback: "Speculating on continued 15% growth is extremely risky. What if prices flatline or drop?" },
    ],
  },
  {
    situation: "A homeowner's mortgage has a 3% rate from 2021. Current rates are 7%. They want to move to a bigger home.",
    options: [
      { text: "Stay and renovate instead of moving", correct: true, feedback: "Smart! Giving up a 3% rate for 7% means a much higher payment. Renovating keeps the low rate." },
      { text: "Sell and buy bigger at the new 7% rate", correct: false, feedback: "Going from 3% to 7% on a larger loan amount could double the monthly payment. That's a huge cost." },
      { text: "Rent out the current home and buy a new one", correct: true, feedback: "Creative! Keeping the 3% mortgage as a rental and buying new preserves the low rate while generating income." },
      { text: "Refinance the current home to pull out cash for the new one", correct: false, feedback: "Cash-out refinancing at 7% replaces your 3% rate — a costly mistake." },
    ],
  },
  {
    situation: "A buyer is choosing between a $400K house in the suburbs (30min commute) and a $550K condo downtown (walk to work). Same monthly cost after HOA.",
    options: [
      { text: "Buy the suburban house — more space and appreciation potential", correct: true, feedback: "Good thinking! Houses typically appreciate more than condos and have no HOA fees eating into equity." },
      { text: "Buy the downtown condo — lifestyle and no commute", correct: true, feedback: "Also valid! Time saved commuting has real value, and lifestyle quality matters, not just money." },
      { text: "Buy the condo because it's newer", correct: false, feedback: "Newer doesn't mean better investment. Condos have HOA fees that can rise and may appreciate slower." },
      { text: "Buy whichever has the lower purchase price", correct: false, feedback: "Purchase price alone doesn't determine value. Consider total monthly cost, appreciation, and lifestyle." },
    ],
  },
  {
    situation: "A landlord offers a rent-to-own lease: $2,000/mo rent with $500/mo going toward a future purchase at today's price. Option fee is $5,000.",
    options: [
      { text: "Decline — rent-to-own often favors the landlord", correct: true, feedback: "Smart! Rent-to-own contracts often have strict terms and if you don't buy, you lose the option fee and premium payments." },
      { text: "Accept — it's a path to homeownership with no down payment", correct: false, feedback: "The $500/mo premium and $5K fee total $11K/year. If you don't exercise the option, that money is gone." },
      { text: "Accept only if you're certain you'll buy and the price is locked in", correct: true, feedback: "Reasonable, but get a real estate attorney to review the contract. These deals can have hidden pitfalls." },
      { text: "Negotiate to put the $5K option fee toward the down payment instead", correct: false, feedback: "A traditional purchase with a proper down payment is usually cleaner and less risky than rent-to-own." },
    ],
  },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number; timePerScenario: number }> = {
  basic: { rounds: 5, timePerScenario: 0 },
  tough: { rounds: 7, timePerScenario: 30 },
  high: { rounds: 10, timePerScenario: 18 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '5 scenarios, no timer',
  tough: '7 scenarios, 30s each',
  high: '10 scenarios, 18s each',
};

const ACHIEVEMENTS = [
  { id: 'first-correct', title: 'Housing Analyst', description: 'Made your first correct housing decision', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Market Watcher', description: '5 correct decisions in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'score-15', title: 'Housing Expert', description: 'Scored 15+ points', condition: (s: any) => s.score >= 15 },
  { id: 'perfect', title: 'Real Estate Guru', description: 'All correct in a round', condition: (s: any) => s.correct >= 10 && s.wrong === 0 },
];

export default function RentVsBuy({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
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

  const scenarioList = useMemo(() => [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, totalRounds), [totalRounds]);
  const scenario = scenarioList[round];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const option = scenario.options[idx];
    setFeedback({ text: option.feedback, correct: option.correct });
    if (option.correct) {
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
      if (config.timePerScenario > 0) setTimeLeft(config.timePerScenario);
    }
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    eng.reset();
    setPhase('playing');
    if (DIFFICULTY_CONFIG[diff].timePerScenario > 0) setTimeLeft(DIFFICULTY_CONFIG[diff].timePerScenario);
  };

  const reset = () => {
    setRound(0);
    eng.reset();
    setSelected(null);
    setFeedback(null);
    setPhase('playing');
    if (config.timePerScenario > 0) setTimeLeft(config.timePerScenario);
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
          title="Rent vs Buy"
          description="Compare the true costs of renting versus buying. Pick the smartest housing decision!"
          icon={<Home className="h-14 w-14 text-brand-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 15 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Decision Summary</h3>
            <div className="font-display font-extrabold text-5xl text-brand-600 mb-2 animate-pop-in">{eng.score} / {totalRounds * 3}</div>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 25 ? 'Outstanding housing judgment!' : eng.score >= 18 ? 'Solid analysis skills.' : 'Keep learning the housing math.'}
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
        <div className="mb-1 text-xs text-ink-400">Scenario {round + 1} / {totalRounds}</div>

        <div key={round} className="rounded-xl bg-brand-50 border border-brand-200 p-4 mb-3 animate-slide-in-right">
          <p className="font-display font-semibold text-ink-900 text-sm leading-relaxed">{scenario?.situation}</p>
        </div>

        <div className="space-y-2.5 mb-4">
          {scenario?.options.map((option, idx) => {
            const isSelected = selected === idx;
            const showResult = selected !== null;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={`w-full text-left rounded-lg border p-3.5 text-sm transition-all animate-slide-in-right ${
                  showResult
                    ? option.correct ? 'border-brand-400 bg-brand-50'
                    : isSelected ? 'border-red-300 bg-red-50 animate-shake'
                    : 'border-ink-200 bg-white opacity-60'
                    : 'border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/50 hover:scale-[1.02] cursor-pointer'
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-800">{option.text}</span>
                  {showResult && option.correct && <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 animate-check-bounce" />}
                  {showResult && isSelected && !option.correct && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
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
            {round + 1 >= totalRounds ? 'See Results' : 'Next Scenario'}
          </button>
        )}
      </div>
    </div>
  );
}
