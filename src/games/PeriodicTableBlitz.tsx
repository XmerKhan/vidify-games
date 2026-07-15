import { useState, useMemo, useEffect } from 'react';
import { Atom, CheckCircle2, XCircle } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface ElementQuestion {
  symbol: string;
  name: string;
  options: string[];
}

const QUESTIONS: ElementQuestion[] = [
  { symbol: 'H', name: 'Hydrogen', options: ['Helium', 'Hydrogen', 'Hafnium', 'Mercury'] },
  { symbol: 'He', name: 'Helium', options: ['Helium', 'Hafnium', 'Holmium', 'Hydrogen'] },
  { symbol: 'Li', name: 'Lithium', options: ['Lead', 'Lithium', 'Lutetium', 'Lawrencium'] },
  { symbol: 'Be', name: 'Beryllium', options: ['Boron', 'Bismuth', 'Beryllium', 'Barium'] },
  { symbol: 'B', name: 'Boron', options: ['Boron', 'Beryllium', 'Bromine', 'Barium'] },
  { symbol: 'C', name: 'Carbon', options: ['Calcium', 'Carbon', 'Cobalt', 'Cadmium'] },
  { symbol: 'N', name: 'Nitrogen', options: ['Neon', 'Nickel', 'Niobium', 'Nitrogen'] },
  { symbol: 'O', name: 'Oxygen', options: ['Osmium', 'Oxygen', 'Oganesson', 'Iron'] },
  { symbol: 'F', name: 'Fluorine', options: ['Fluorine', 'Francium', 'Fermium', 'Iron'] },
  { symbol: 'Ne', name: 'Neon', options: ['Neodymium', 'Neon', 'Neptunium', 'Nickel'] },
  { symbol: 'Na', name: 'Sodium', options: ['Sodium', 'Niobium', 'Nitrogen', 'Neodymium'] },
  { symbol: 'Mg', name: 'Magnesium', options: ['Manganese', 'Magnesium', 'Molybdenum', 'Meitnerium'] },
  { symbol: 'Al', name: 'Aluminum', options: ['Argon', 'Aluminum', 'Americium', 'Actinium'] },
  { symbol: 'Si', name: 'Silicon', options: ['Silicon', 'Silver', 'Sulfur', 'Samarium'] },
  { symbol: 'P', name: 'Phosphorus', options: ['Phosphorus', 'Platinum', 'Plutonium', 'Potassium'] },
  { symbol: 'S', name: 'Sulfur', options: ['Sulfur', 'Silicon', 'Sodium', 'Scandium'] },
  { symbol: 'Cl', name: 'Chlorine', options: ['Chlorine', 'Calcium', 'Chromium', 'Cobalt'] },
  { symbol: 'Ar', name: 'Argon', options: ['Argon', 'Arsenic', 'Astatine', 'Aluminum'] },
  { symbol: 'K', name: 'Potassium', options: ['Krypton', 'Potassium', 'Protactinium', 'Phosphorus'] },
  { symbol: 'Ca', name: 'Calcium', options: ['Cadmium', 'Calcium', 'Carbon', 'Californium'] },
  { symbol: 'Fe', name: 'Iron', options: ['Iridium', 'Iron', 'Indium', 'Iodine'] },
  { symbol: 'Cu', name: 'Copper', options: ['Cobalt', 'Curium', 'Copper', 'Cadmium'] },
  { symbol: 'Zn', name: 'Zinc', options: ['Zirconium', 'Zinc', 'Zirconium', 'Yttrium'] },
  { symbol: 'Ag', name: 'Silver', options: ['Silver', 'Sodium', 'Silicon', 'Sulfur'] },
  { symbol: 'Au', name: 'Gold', options: ['Gold', 'Aluminum', 'Argon', 'Arsenic'] },
  { symbol: 'Hg', name: 'Mercury', options: ['Magnesium', 'Mercury', 'Manganese', 'Molybdenum'] },
  { symbol: 'Pb', name: 'Lead', options: ['Lead', 'Lithium', 'Lutetium', 'Lanthanum'] },
  { symbol: 'U', name: 'Uranium', options: ['Uranium', 'Ununpentium', 'Vanadium', 'Uranium'] },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number; timePerQuestion: number }> = {
  basic: { rounds: 8, timePerQuestion: 12 },
  tough: { rounds: 12, timePerQuestion: 8 },
  high: { rounds: 16, timePerQuestion: 5 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '8 elements, 12s each',
  tough: '12 elements, 8s each',
  high: '16 elements, 5s each',
};

const ACHIEVEMENTS = [
  { id: 'first-element', title: 'Elemental', description: 'Identified your first element', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Chemist', description: '5 correct in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'score-25', title: 'Chemistry Whiz', description: 'Scored 25+ points', condition: (s: any) => s.score >= 25 },
  { id: 'perfect', title: 'Periodic Master', description: 'Perfect round', condition: (s: any) => s.correct >= 16 && s.wrong === 0 },
];

export default function PeriodicTableBlitz({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
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
    const isCorrect = question.options[idx] === question.name;
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
        <DifficultySelector title="Periodic Table Blitz" description="Identify elements by their chemical symbols!" icon={<Atom className="h-14 w-14 text-purple-600" />} difficultyDescriptions={DIFFICULTY_DESCRIPTIONS} onSelect={startWithDifficulty} />
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
            <p className="text-sm text-ink-500 mb-4">{eng.score >= 25 ? 'Chemistry master!' : eng.score >= 16 ? 'Great chemistry knowledge!' : 'Study those elements!'}</p>
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
        <div className="mb-1 text-xs text-ink-400">Element {round + 1} / {totalRounds}</div>
        <div key={round} className="rounded-xl bg-purple-50 border border-purple-200 p-6 mb-3 animate-slide-in-right text-center">
          <p className="text-sm text-ink-500 mb-1">What element has the symbol</p>
          <p className="font-display font-extrabold text-5xl text-purple-600 font-mono">{question?.symbol}</p>
        </div>
        <div className="space-y-2.5 mb-4">
          {question?.options.map((option, idx) => {
            const isSelected = selected === idx; const showResult = selected !== null;
            const isCorrect = option === question.name;
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
              <p className="text-sm text-ink-700">{feedback.correct ? 'Correct!' : `The answer was ${question.name}`}</p>
            </div>
          </div>
        )}
        {selected !== null && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">{round + 1 >= totalRounds ? 'See Results' : 'Next Element'}</button>
        )}
      </div>
    </div>
  );
}
