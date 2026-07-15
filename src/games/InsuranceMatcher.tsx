import { useState, useMemo } from 'react';
import { Umbrella, CheckCircle2, XCircle } from 'lucide-react';
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
  options: { type: string; correct: boolean; feedback: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    situation: "A young single person just bought their first car. What insurance do they most need?",
    options: [
      { type: "Auto liability + collision", correct: true, feedback: "Correct! Auto insurance is legally required and protects against the biggest risk: accidents." },
      { type: "Life insurance", correct: false, feedback: "Not urgent. With no dependents, life insurance isn't a priority yet." },
      { type: "Long-term disability", correct: false, feedback: "Important but secondary to auto insurance which is legally required." },
      { type: "Flood insurance", correct: false, feedback: "Only needed if living in a flood zone. Not relevant for a car purchase." },
    ],
  },
  {
    situation: "A family with two kids and one income-earner. The earner works in construction. What's most critical?",
    options: [
      { type: "Disability insurance", correct: true, feedback: "Exactly! A construction worker has high injury risk. Disability protects the family's income." },
      { type: "Pet insurance", correct: false, feedback: "Nice to have, but not the priority for a single-income family." },
      { type: "Travel insurance", correct: false, feedback: "Only relevant for trips. Not a priority for this family." },
      { type: "Dental insurance", correct: false, feedback: "Useful but not the most critical risk to address first." },
    ],
  },
  {
    situation: "A new homeowner in a coastal area. What coverage is essential?",
    options: [
      { type: "Home insurance + flood insurance", correct: true, feedback: "Perfect! Standard home insurance excludes flooding. Coastal areas need separate flood coverage." },
      { type: "Just home insurance", correct: false, feedback: "Standard home insurance excludes flood damage — a costly gap in coastal areas." },
      { type: "Home insurance + earthquake coverage", correct: false, feedback: "Earthquake coverage is good, but flooding is the bigger risk in coastal areas." },
      { type: "Renters insurance", correct: false, feedback: "Renters insurance is for renters, not homeowners." },
    ],
  },
  {
    situation: "A parent of three young children, the family's sole breadwinner, earning $80K/year. What's most important?",
    options: [
      { type: "Term life insurance (10x income)", correct: true, feedback: "Exactly right! 10x income = $800K policy ensures the family is supported if the earner dies." },
      { type: "Whole life insurance", correct: false, feedback: "Whole life is 5-10x more expensive than term. Term is better for income replacement." },
      { type: "No life insurance needed", correct: false, feedback: "With dependents, life insurance is critical to protect them financially." },
      { type: "Accidental death only", correct: false, feedback: "Accidental death policies only pay for accidents, which cause only a fraction of deaths." },
    ],
  },
  {
    situation: "A freelancer who works from home and has no employer health coverage. What do they need?",
    options: [
      { type: "Health insurance + disability", correct: true, feedback: "Both are critical! Without employer coverage, they need individual health and disability policies." },
      { type: "Health insurance only", correct: false, feedback: "Health is essential, but disability is equally important for a freelancer who can't access employer benefits." },
      { type: "Disability only", correct: false, feedback: "Disability is important, but going without health insurance is extremely risky." },
      { type: "Neither — they're healthy", correct: false, feedback: "Being healthy doesn't protect against accidents or sudden illness. Both are essential." },
    ],
  },
  {
    situation: "A couple in their 60s, about to retire. Their home is paid off. What insurance should they review?",
    options: [
      { type: "Reduce life insurance, keep health and long-term care", correct: true, feedback: "Smart! With no dependents and paid-off home, life insurance is less critical. Health and LTC matter most." },
      { type: "Increase life insurance coverage", correct: false, feedback: "At retirement with no dependents, large life policies are usually unnecessary." },
      { type: "Drop all insurance", correct: false, feedback: "Dangerous! Health and long-term care risks increase with age. Keep essential coverage." },
      { type: "Buy annuity insurance only", correct: false, feedback: "Annuities are investment products, not insurance protection. Focus on health and LTC." },
    ],
  },
  {
    situation: "A college student living in a dorm. What insurance should they have?",
    options: [
      { type: "Health insurance (staying on parents' plan)", correct: true, feedback: "Correct! Health coverage is the priority. Parents' home insurance may extend to dorm belongings." },
      { type: "Life insurance", correct: false, feedback: "No dependents means life insurance isn't needed at this stage." },
      { type: "Renters insurance", correct: false, feedback: "Dorms are often covered by parents' home insurance. Check first, but health is the priority." },
      { type: "Disability insurance", correct: false, feedback: "Not a priority for a student with no income to protect yet." },
    ],
  },
  {
    situation: "A small business owner with 5 employees and a commercial storefront. What coverage is essential?",
    options: [
      { type: "General liability + property + workers' comp", correct: true, feedback: "Perfect! These three cover customer injuries, property damage, and employee injuries." },
      { type: "Just general liability", correct: false, feedback: "Not enough! Property damage and employee injuries are major risks for a storefront business." },
      { type: "Business auto only", correct: false, feedback: "Business auto is needed for company vehicles but doesn't cover storefront risks." },
      { type: "Key person life insurance only", correct: false, feedback: "Key person coverage is useful but doesn't address the main liability and property risks." },
    ],
  },
  {
    situation: "Two renters sharing an apartment. What insurance do they each need?",
    options: [
      { type: "Individual renters insurance policies", correct: true, feedback: "Correct! Each person needs their own policy — one roommate's insurance doesn't cover the other." },
      { type: "One shared renters policy", correct: false, feedback: "Renters policies typically cover named insureds only. Each person needs their own." },
      { type: "No insurance needed — landlord covers it", correct: false, feedback: "Landlord insurance covers the building, not your personal belongings or liability." },
      { type: "Home insurance", correct: false, feedback: "Home insurance is for property owners. Renters need renters insurance." },
    ],
  },
  {
    situation: "A high-earning professional ($300K/yr) with a family. What's the best life insurance strategy?",
    options: [
      { type: "Term life (20yr, 10x income = $3M)", correct: true, feedback: "Excellent! A $3M term policy replaces income for the family at an affordable cost." },
      { type: "Whole life ($500K)", correct: false, feedback: "$500K is too little for a $300K earner, and whole life premiums are very expensive." },
      { type: "No life insurance — they have savings", correct: false, feedback: "Even with savings, a $300K earner's death would devastate family finances without insurance." },
      { type: "Group life through employer only", correct: false, feedback: "Group life is often capped at 1-2x salary — far too little. Supplement with individual term." },
    ],
  },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number; timePerScenario: number }> = {
  basic: { rounds: 5, timePerScenario: 0 },
  tough: { rounds: 7, timePerScenario: 25 },
  high: { rounds: 10, timePerScenario: 15 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '5 scenarios, no timer',
  tough: '7 scenarios, 25s each',
  high: '10 scenarios, 15s each',
};

const ACHIEVEMENTS = [
  { id: 'first-match', title: 'Coverage Starter', description: 'Matched your first policy correctly', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Insurance Pro', description: '5 correct matches in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'score-20', title: 'Risk Manager', description: 'Scored 20+ points', condition: (s: any) => s.score >= 20 },
  { id: 'perfect', title: 'Insurance Expert', description: 'All correct matches', condition: (s: any) => s.correct >= 10 && s.wrong === 0 },
];

export default function InsuranceMatcher({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.basic;
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
          title="Insurance Matcher"
          description="Match the right insurance policy to each life situation. Learn what each type protects!"
          icon={<Umbrella className="h-14 w-14 text-brand-600" />}
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
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Coverage Report</h3>
            <div className="font-display font-extrabold text-5xl text-brand-600 mb-2 animate-pop-in">{eng.score} / {totalRounds * 3}</div>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 25 ? 'Insurance expert!' : eng.score >= 18 ? 'Solid coverage knowledge.' : 'Review your insurance basics.'}
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
                  <span className="text-ink-800 font-medium">{option.type}</span>
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
