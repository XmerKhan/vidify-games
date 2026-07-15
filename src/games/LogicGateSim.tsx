import { useState, useMemo } from 'react';
import { Cpu, CheckCircle2, XCircle } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface GatePuzzle {
  description: string;
  truthTable: { inputs: number[]; output: number }[];
  options: string[];
  answer: string;
}

const PUZZLES: GatePuzzle[] = [
  {
    description: 'Output is 1 only when BOTH inputs are 1',
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 },
    ],
    options: ['AND', 'OR', 'XOR', 'NAND'],
    answer: 'AND',
  },
  {
    description: 'Output is 1 when EITHER input is 1',
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 1 },
    ],
    options: ['AND', 'OR', 'XOR', 'NOR'],
    answer: 'OR',
  },
  {
    description: 'Output is 1 when inputs are DIFFERENT',
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 0 },
    ],
    options: ['XOR', 'AND', 'NAND', 'NOR'],
    answer: 'XOR',
  },
  {
    description: 'Output is 0 only when BOTH inputs are 1',
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 0 },
    ],
    options: ['NAND', 'AND', 'NOR', 'XNOR'],
    answer: 'NAND',
  },
  {
    description: 'Output is 1 only when BOTH inputs are 0',
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 0 },
    ],
    options: ['NOR', 'OR', 'AND', 'XOR'],
    answer: 'NOR',
  },
  {
    description: 'Output is 1 when inputs are the SAME',
    truthTable: [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 },
    ],
    options: ['XNOR', 'XOR', 'NAND', 'NOR'],
    answer: 'XNOR',
  },
  {
    description: 'Output is the opposite of the input',
    truthTable: [
      { inputs: [0], output: 1 },
      { inputs: [1], output: 0 },
    ],
    options: ['NOT', 'AND', 'OR', 'XOR'],
    answer: 'NOT',
  },
  {
    description: 'Output is 1 when at least 2 of 3 inputs are 1',
    truthTable: [
      { inputs: [0, 0, 0], output: 0 },
      { inputs: [0, 0, 1], output: 0 },
      { inputs: [0, 1, 1], output: 1 },
      { inputs: [1, 1, 1], output: 1 },
    ],
    options: ['Majority', 'AND', 'OR', 'XOR'],
    answer: 'Majority',
  },
  {
    description: '3-input AND: output is 1 only when ALL inputs are 1',
    truthTable: [
      { inputs: [0, 0, 0], output: 0 },
      { inputs: [0, 1, 1], output: 0 },
      { inputs: [1, 1, 0], output: 0 },
      { inputs: [1, 1, 1], output: 1 },
    ],
    options: ['3-AND', '3-OR', '3-XOR', '3-NAND'],
    answer: '3-AND',
  },
  {
    description: '3-input OR: output is 1 when ANY input is 1',
    truthTable: [
      { inputs: [0, 0, 0], output: 0 },
      { inputs: [0, 0, 1], output: 1 },
      { inputs: [0, 1, 0], output: 1 },
      { inputs: [1, 1, 1], output: 1 },
    ],
    options: ['3-OR', '3-AND', '3-NOR', '3-NAND'],
    answer: '3-OR',
  },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number; timePerPuzzle: number }> = {
  basic: { rounds: 5, timePerPuzzle: 0 },
  tough: { rounds: 7, timePerPuzzle: 30 },
  high: { rounds: 10, timePerPuzzle: 20 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '5 puzzles, no timer',
  tough: '7 puzzles, 30s each',
  high: '10 puzzles, 20s each',
};

const ACHIEVEMENTS = [
  { id: 'first-gate', title: 'Gate Opener', description: 'Solved your first logic puzzle', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Logic Thinker', description: '5 correct in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'score-20', title: 'Circuit Master', description: 'Scored 20+ points', condition: (s: any) => s.score >= 20 },
  { id: 'perfect', title: 'Digital Genius', description: 'Perfect round', condition: (s: any) => s.correct >= 10 && s.wrong === 0 },
];

export default function LogicGateSim({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
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

  const puzzleList = useMemo(() => [...PUZZLES].sort(() => Math.random() - 0.5).slice(0, totalRounds), [totalRounds]);
  const puzzle = puzzleList[round];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = puzzle.options[idx] === puzzle.answer;
    setFeedback({ correct: isCorrect });
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
      if (config.timePerPuzzle > 0) setTimeLeft(config.timePerPuzzle);
    }
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    eng.reset();
    setPhase('playing');
    if (DIFFICULTY_CONFIG[diff].timePerPuzzle > 0) setTimeLeft(DIFFICULTY_CONFIG[diff].timePerPuzzle);
  };

  const reset = () => {
    setRound(0);
    eng.reset();
    setSelected(null);
    setFeedback(null);
    setPhase('playing');
    if (config.timePerPuzzle > 0) setTimeLeft(config.timePerPuzzle);
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
        <AnimatedBackground category="tech" />
        <DifficultySelector
          title="Logic Gate Simulator"
          description="Read the truth table and identify the correct logic gate!"
          icon={<Cpu className="h-14 w-14 text-info-600" />}
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
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Circuit Complete</h3>
            <div className="font-display font-extrabold text-5xl text-info-600 mb-2 animate-pop-in">{eng.score} / {totalRounds * 3}</div>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 25 ? 'Digital logic genius!' : eng.score >= 18 ? 'Solid logic skills!' : 'Review your truth tables!'}
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
      <AnimatedBackground category="tech" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} timeLeft={timeLeft > 0 ? timeLeft : undefined} />
        <div className="mb-1 text-xs text-ink-400">Puzzle {round + 1} / {totalRounds}</div>

        <div key={round} className="rounded-xl bg-info-50 border border-info-200 p-4 mb-3 animate-slide-in-right">
          <p className="font-display font-semibold text-ink-900 mb-3">{puzzle?.description}</p>
          <div className="overflow-hidden rounded-lg border border-info-200">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="bg-info-100">
                  {puzzle?.truthTable[0].inputs.map((_, i) => (
                    <th key={i} className="px-3 py-2 text-info-700">Input {String.fromCharCode(65 + i)}</th>
                  ))}
                  <th className="px-3 py-2 text-info-700">Output</th>
                </tr>
              </thead>
              <tbody>
                {puzzle?.truthTable.map((row, i) => (
                  <tr key={i} className="border-t border-info-100 bg-white">
                    {row.inputs.map((val, j) => (
                      <td key={j} className="px-3 py-2 text-center text-ink-700">{val}</td>
                    ))}
                    <td className="px-3 py-2 text-center font-bold text-info-600">{row.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-ink-500 mb-2">Which gate produces this truth table?</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {puzzle?.options.map((option, idx) => {
            const isSelected = selected === idx;
            const showResult = selected !== null;
            const isCorrect = option === puzzle.answer;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={`rounded-lg border p-4 text-center font-mono font-bold text-sm transition-all animate-slide-in-right ${
                  showResult
                    ? isCorrect ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : isSelected ? 'border-red-300 bg-red-50 text-red-600 animate-shake'
                    : 'border-ink-200 bg-white opacity-50'
                    : 'border-ink-200 bg-white text-ink-700 hover:border-info-300 hover:bg-info-50/50 hover:scale-[1.02] cursor-pointer'
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center justify-center gap-2">
                  {option}
                  {showResult && isCorrect && <CheckCircle2 className="h-4 w-4 text-brand-600" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="animate-fade-in rounded-lg border border-ink-200 bg-ink-50 p-3 mb-4">
            <div className="flex items-center gap-2">
              {feedback.correct ? <CheckCircle2 className="h-5 w-5 text-brand-600 animate-check-bounce" />
              : <XCircle className="h-5 w-5 text-red-500" />}
              <p className="text-sm text-ink-700">
                {feedback.correct ? 'Correct!' : `The answer was ${puzzle.answer}`}
              </p>
            </div>
          </div>
        )}

        {selected !== null && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">
            {round + 1 >= totalRounds ? 'See Results' : 'Next Puzzle'}
          </button>
        )}
      </div>
    </div>
  );
}
