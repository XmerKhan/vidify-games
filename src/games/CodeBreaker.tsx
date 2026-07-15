import { useState, useCallback } from 'react';
import { Code2, RotateCcw } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';
import { playSound } from '../lib/sound';

const COLORS = [
  { name: 'Red', class: 'bg-red-500', ring: 'ring-red-400', shadow: 'shadow-red-500/50' },
  { name: 'Blue', class: 'bg-info-500', ring: 'ring-info-400', shadow: 'shadow-info-500/50' },
  { name: 'Green', class: 'bg-brand-500', ring: 'ring-brand-400', shadow: 'shadow-brand-500/50' },
  { name: 'Yellow', class: 'bg-accent-400', ring: 'ring-accent-400', shadow: 'shadow-accent-500/50' },
  { name: 'Purple', class: 'bg-purple-500', ring: 'ring-purple-400', shadow: 'shadow-purple-500/50' },
  { name: 'Orange', class: 'bg-orange-500', ring: 'ring-orange-400', shadow: 'shadow-orange-500/50' },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { codeLength: number; maxGuesses: number; numColors: number }> = {
  basic: { codeLength: 4, maxGuesses: 12, numColors: 4 },
  tough: { codeLength: 4, maxGuesses: 10, numColors: 6 },
  high: { codeLength: 5, maxGuesses: 8, numColors: 6 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '4 colors, 12 guesses',
  tough: '6 colors, 10 guesses',
  high: '5-peg code, 8 guesses',
};

interface Guess { colors: number[]; black: number; white: number; }

function generateCode(length: number, numColors: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * numColors));
}

function checkGuess(guess: number[], code: number[]): { black: number; white: number } {
  let black = 0, white = 0;
  const guessCopy = [...guess], codeCopy = [...code];
  for (let i = 0; i < code.length; i++) {
    if (guessCopy[i] === codeCopy[i]) { black++; guessCopy[i] = -1; codeCopy[i] = -1; }
  }
  for (let i = 0; i < code.length; i++) {
    if (guessCopy[i] === -1) continue;
    const idx = codeCopy.indexOf(guessCopy[i]);
    if (idx !== -1) { white++; codeCopy[idx] = -1; }
  }
  return { black, white };
}

const ACHIEVEMENTS = [
  { id: 'first-guess', title: 'Code Apprentice', description: 'Made your first guess', condition: (s: any) => s.correct >= 1 },
  { id: 'solve-3-guesses', title: 'Code Cracker', description: 'Solved in 3 guesses or fewer', condition: (s: any) => s.score >= 800 },
  { id: 'solve-fast', title: 'Speed Coder', description: 'Solved in 2 guesses or fewer', condition: (s: any) => s.score >= 900 },
  { id: 'solve-any', title: 'Logic Master', description: 'Cracked the code', condition: (s: any) => s.correct >= 1 && s.score >= 100 },
  { id: 'solve-first-try', title: 'Mind Reader', description: 'Solved on the first try', condition: (s: any) => s.score >= 1000 },
];

export default function CodeBreaker({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [code, setCode] = useState<number[]>([]);
  const [current, setCurrent] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [won, setWon] = useState(false);
  const [wrongShake, setWrongShake] = useState(0);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.tough;
  const codeLength = config.codeLength;
  const maxGuesses = config.maxGuesses;
  const numColors = config.numColors;
  const availableColors = COLORS.slice(0, numColors);
  const gameOver = phase === 'gameover';

  const handleColorClick = useCallback((colorIdx: number) => {
    if (gameOver) return;
    playSound('click');
    setCurrent((prev) => prev.length >= codeLength ? prev : [...prev, colorIdx]);
  }, [gameOver, codeLength]);

  const handleRemove = () => {
    playSound('click');
    setCurrent((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (current.length !== codeLength) return;
    const result = checkGuess(current, code);
    const newGuess: Guess = { colors: [...current], black: result.black, white: result.white };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    setCurrent([]);

    if (result.black === codeLength) {
      setWon(true);
      setPhase('gameover');
      const finalScore = (maxGuesses - guesses.length) * 100 + 100;
      eng.onCorrect(0);
      eng.setScore(finalScore);
      eng.checkAchievements(finalScore);
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
      onAchievement?.();
    } else if (result.black === 0 && result.white === 0) {
      eng.onWrong();
      setWrongShake((s) => s + 1);
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
    } else {
      playSound('click');
    }

    if (newGuesses.length >= maxGuesses && result.black !== codeLength) {
      setPhase('gameover');
      eng.playSound('game-over');
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
      onAchievement?.();
    }
  };

  const score = won ? (maxGuesses - guesses.length) * 100 + 100 : 0;

  const startWithDifficulty = (diff: Difficulty) => {
    const cfg = DIFFICULTY_CONFIG[diff];
    setDifficulty(diff);
    setCode(generateCode(cfg.codeLength, cfg.numColors));
    eng.reset();
    setPhase('playing');
  };

  const reset = () => {
    setCode(generateCode(codeLength, numColors));
    setCurrent([]);
    setGuesses([]);
    setWon(false);
    eng.reset();
    setPhase('playing');
  };

  const changeDifficulty = () => setPhase('difficulty');

  const resetAll = () => {
    setPhase('cover');
    setDifficulty(null);
    setCode([]);
    setCurrent([]);
    setGuesses([]);
    setWon(false);
    eng.reset();
  };

  if (phase === 'cover') {
    return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;
  }

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="tech" />
        <DifficultySelector
          title="Code Breaker"
          description="Crack the secret color code using logic and deduction."
          icon={<Code2 className="h-14 w-14 text-info-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="relative">
        <Confetti trigger={won ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">
              {won ? 'Code Cracked!' : 'Out of Guesses'}
            </h3>
            {won && <p className="text-sm text-ink-500 mb-3">Solved in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!</p>}
            {!won && (
              <div className="mb-4">
                <p className="text-sm text-ink-500 mb-2">The code was:</p>
                <div className="flex justify-center gap-2">
                  {code.map((c, i) => <div key={i} className={`h-8 w-8 rounded-full ${COLORS[c].class} animate-drop-in`} style={{ animationDelay: `${i * 80}ms` }} />)}
                </div>
              </div>
            )}
            <div className="font-display font-extrabold text-4xl text-ink-900 mb-4 animate-pop-in">{score}</div>
            <button onClick={reset} className="btn-secondary w-full">
              <RotateCcw className="h-4 w-4" /> New Game
            </button>
            <button onClick={changeDifficulty} className="btn-ghost mt-2 w-full text-sm">Change Difficulty</button>
          </div>
          <div>
            <Leaderboard slug={game.slug} score={score} onPlayAgain={resetAll} />
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
        <GameHUD streak={eng.streak} />
        <div className="flex items-center justify-between mb-4">
          <span className="badge-info">Guesses: {guesses.length} / {maxGuesses}</span>
          <span className="text-sm text-ink-500">Crack the {codeLength}-color code</span>
        </div>

        <div className="space-y-2 mb-5 min-h-[100px]">
          {guesses.length === 0 && <p className="text-sm text-ink-400 text-center py-8 animate-fade-in">Click colors below to build your guess, then submit.</p>}
          {guesses.map((guess, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-ink-50 p-2.5 animate-slide-in-right" style={{ animationDelay: `${i * 40}ms` }}>
              <span className="text-xs font-bold text-ink-400 w-6">#{i + 1}</span>
              <div className="flex gap-1.5">
                {guess.colors.map((c, j) => <div key={j} className={`h-7 w-7 rounded-full ${COLORS[c].class} shadow-sm animate-peg-bounce`} style={{ animationDelay: `${j * 60}ms` }} />)}
              </div>
              <div className="flex gap-2 ml-auto">
                <span className="flex items-center gap-1 text-xs font-bold text-ink-900">
                  <span className="h-3 w-3 rounded-full bg-ink-900 inline-block animate-flip-digit" style={{ animationDelay: `${i * 100}ms` }} />{guess.black}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-ink-500">
                  <span className="h-3 w-3 rounded-full border-2 border-ink-400 inline-block animate-flip-digit" style={{ animationDelay: `${i * 100 + 50}ms` }} />{guess.white}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div key={wrongShake} className={`rounded-xl border-2 border-info-200 bg-info-50 p-4 mb-4 ${wrongShake > 0 ? 'animate-shake' : ''}`}>
          <div className="text-xs font-semibold text-ink-500 mb-2">Your guess:</div>
          <div className="flex items-center gap-2">
            <div className="flex gap-2 flex-1">
              {Array.from({ length: codeLength }).map((_, i) => (
                <div key={i} className={`h-10 w-10 rounded-full border-2 border-dashed border-ink-300 transition-all ${current[i] !== undefined ? `${COLORS[current[i]].class} border-solid animate-peg-bounce` : ''}`} style={{ animationDelay: `${i * 50}ms` }} />
              ))}
            </div>
            {current.length > 0 && <button onClick={handleRemove} className="btn-ghost text-xs px-2 py-1">Undo</button>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {availableColors.map((color, idx) => (
            <button
              key={idx}
              onClick={() => handleColorClick(idx)}
              className={`h-10 w-10 rounded-full ${color.class} hover:scale-110 transition-transform ring-offset-2 hover:ring-2 ${color.ring} shadow-md ${color.shadow}`}
              aria-label={color.name}
            />
          ))}
        </div>

        <button onClick={handleSubmit} disabled={current.length !== codeLength} className="btn-primary w-full animate-glow-pulse">Submit Guess</button>

        <div className="mt-4 flex items-center gap-4 text-xs text-ink-400 justify-center">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-ink-900 inline-block" /> = right color, right position</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full border-2 border-ink-400 inline-block" /> = right color, wrong position</span>
        </div>
      </div>
    </div>
  );
}
