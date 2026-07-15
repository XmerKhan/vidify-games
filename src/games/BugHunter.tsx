import { useState, useEffect, useCallback } from 'react';
import { Bug, CheckCircle2, XCircle } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface Snippet { code: string[]; bugLine: number; explanation: string; }

const SNIPPETS: Snippet[] = [
  { code: ['function sum(a, b) {', '  return a - b;', '}'], bugLine: 1, explanation: 'Subtraction instead of addition. Should be `return a + b;`' },
  { code: ['for (let i = 0; i <= arr.length; i++) {', '  console.log(arr[i]);', '}'], bugLine: 0, explanation: 'Off-by-one: `<=` should be `<`. Using `<=` accesses arr[arr.length], which is undefined.' },
  { code: ['function isEven(n) {', '  return n % 2 === 1;', '}'], bugLine: 1, explanation: 'Checks for odd, not even. Should be `n % 2 === 0`.' },
  { code: ['const arr = [1, 2, 3];', 'arr.forEach(x => {', '  arr.push(x * 2);', '});'], bugLine: 2, explanation: 'Modifying the array while iterating causes an infinite loop.' },
  { code: ['function getMax(a, b) {', '  if (a > b)', '    return b;', '  return a;', '}'], bugLine: 2, explanation: 'Returns the wrong value. When a > b, it should return a, not b.' },
  { code: ['let count = 0;', 'while (count < 10) {', '  console.log(count);', '}'], bugLine: 3, explanation: 'count is never incremented, causing an infinite loop. Need `count++` inside the loop.' },
  { code: ['function greet(name) {', '  console.log("Hello, " + Name);', '}'], bugLine: 1, explanation: '`Name` is not defined — JavaScript is case-sensitive. Should be `name`.' },
  { code: ['const nums = [1, 2, 3];', 'const doubled = nums.map(function() {', '  return n * 2;', '});'], bugLine: 1, explanation: 'The map callback doesn\'t declare `n` as a parameter. Should be `function(n) {`.' },
  { code: ['function factorial(n) {', '  if (n = 0) return 1;', '  return n * factorial(n - 1);', '}'], bugLine: 1, explanation: 'Assignment `=` instead of comparison `===`. `n = 0` always evaluates to 0 (falsy).' },
  { code: ['const obj = { name: "Alice" };', 'console.log(obj.name);', 'console.log(obj.age.length);'], bugLine: 2, explanation: '`obj.age` is undefined, so `.length` throws a TypeError.' },
  { code: ['function divide(a, b) {', '  return a / 0;', '}'], bugLine: 1, explanation: 'Divides by zero instead of by b. Should be `return a / b;`' },
  { code: ['let total = 0;', 'for (const num of numbers) {', '  total =+ num;', '}'], bugLine: 2, explanation: '`=+` is assignment, not addition. Should be `total += num`.' },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { timePerSnippet: number; totalSnippets: number; hintDelay: number }> = {
  basic: { timePerSnippet: 25, totalSnippets: 6, hintDelay: 10000 },
  tough: { timePerSnippet: 15, totalSnippets: 8, hintDelay: 7000 },
  high: { timePerSnippet: 10, totalSnippets: 10, hintDelay: 5000 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '25s per bug, 6 snippets, late hints',
  tough: '15s per bug, 8 snippets, medium hints',
  high: '10s per bug, 10 snippets, early hints',
};

const ACHIEVEMENTS = [
  { id: 'first-bug', title: 'Bug Spotter', description: 'Found your first bug', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Sharp Eye', description: '5 bugs found in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'streak-8', title: 'Code Detective', description: 'Perfect round — all correct', condition: (s: any) => s.correct >= 8 && s.wrong === 0 },
  { id: 'score-500', title: 'Bug Hunter', description: 'Scored 500+ points', condition: (s: any) => s.score >= 500 },
  { id: 'score-800', title: 'Senior Developer', description: 'Scored 800+ points', condition: (s: any) => s.score >= 800 },
];

export default function BugHunter({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [snippetList, setSnippetList] = useState<Snippet[]>([]);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [typedLines, setTypedLines] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.tough;
  const timePerSnippet = config.timePerSnippet;
  const totalSnippets = config.totalSnippets;
  const currentSnippet = snippetList[round];

  useEffect(() => {
    if (difficulty) {
      setSnippetList([...SNIPPETS].sort(() => Math.random() - 0.5).slice(0, totalSnippets));
      setTimeLeft(timePerSnippet);
    }
  }, [difficulty, totalSnippets, timePerSnippet]);

  useEffect(() => {
    if (!currentSnippet || selectedLine !== null) return;
    if (typedLines < currentSnippet.code.length) {
      const t = setTimeout(() => setTypedLines((n) => n + 1), 120);
      return () => clearTimeout(t);
    }
  }, [typedLines, currentSnippet, selectedLine]);

  useEffect(() => {
    if (typedLines >= (currentSnippet?.code.length || 0) && !showHint && selectedLine === null) {
      const t = setTimeout(() => setShowHint(true), config.hintDelay);
      return () => clearTimeout(t);
    }
  }, [typedLines, currentSnippet, showHint, selectedLine, config.hintDelay]);

  useEffect(() => {
    if (selectedLine !== null || phase !== 'playing' || !currentSnippet || typedLines < currentSnippet.code.length) return;
    if (timeLeft <= 0) { handleResult(null); return; }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, selectedLine, phase, currentSnippet, typedLines]);

  const handleResult = useCallback((line: number | null) => {
    if (!currentSnippet) return;
    const correct = line === currentSnippet.bugLine;
    setSelectedLine(line ?? -1);
    setFeedback({ correct, explanation: currentSnippet.explanation });
    if (correct) {
      const timeBonus = Math.max(0, timeLeft);
      eng.onCorrect(100 + timeBonus * 5);
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
    } else {
      eng.onWrong();
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
    }
  }, [currentSnippet, timeLeft, eng]);

  const handleLineClick = (lineIdx: number) => {
    if (selectedLine !== null) return;
    handleResult(lineIdx);
  };

  const next = () => {
    if (round + 1 >= totalSnippets) {
      setPhase('gameover');
      eng.playSound('game-over');
      eng.checkAchievements(eng.score);
      onAchievement?.();
    } else {
      setRound((r) => r + 1);
      setSelectedLine(null);
      setFeedback(null);
      setTimeLeft(timePerSnippet);
      setTypedLines(0);
      setShowHint(false);
    }
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    eng.reset();
    setPhase('playing');
  };

  const reset = () => {
    setSnippetList([...SNIPPETS].sort(() => Math.random() - 0.5).slice(0, totalSnippets));
    setRound(0);
    eng.reset();
    setTimeLeft(timePerSnippet);
    setSelectedLine(null);
    setFeedback(null);
    setTypedLines(0);
    setShowHint(false);
    setPhase('playing');
  };

  const changeDifficulty = () => setPhase('difficulty');

  const resetAll = () => {
    setPhase('cover');
    setDifficulty(null);
    setSnippetList([]);
    setRound(0);
    eng.reset();
    setSelectedLine(null);
    setFeedback(null);
    setTypedLines(0);
    setShowHint(false);
  };

  if (phase === 'cover') {
    return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;
  }

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="tech" />
        <DifficultySelector
          title="Bug Hunter"
          description="Spot the bug in each code snippet before time runs out."
          icon={<Bug className="h-14 w-14 text-info-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 500 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Bug Hunt Complete</h3>
            <div className="font-display font-extrabold text-5xl text-ink-900 mb-2 animate-pop-in">{eng.score}</div>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 600 ? 'Sharp eye! You spotted bugs like a pro.' : eng.score >= 300 ? 'Decent — keep practicing your debugging reflexes.' : 'Keep at it — spotting bugs takes practice.'}
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

  if (!currentSnippet) return null;

  return (
    <div className="relative">
      <AnimatedBackground category="tech" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} timeLeft={timeLeft} />
        <div className="mb-4 h-2 rounded-full bg-ink-100 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-400 animate-pulse' : 'bg-info-500'}`} style={{ width: `${(timeLeft / timePerSnippet) * 100}%` }} />
        </div>
        <p className="text-sm text-ink-500 mb-3">Bug #{round + 1} / {totalSnippets} — Click the line with the bug:</p>

        <div className={`rounded-xl bg-ink-950 overflow-hidden mb-4 font-mono text-sm ${feedback?.correct === false ? 'animate-shake' : ''}`}>
          {currentSnippet.code.map((line, i) => {
            const isTyped = i < typedLines;
            const isSelected = selectedLine === i;
            const isBug = i === currentSnippet.bugLine;
            const showResult = selectedLine !== null;
            const isHint = showHint && isBug && selectedLine === null;
            return (
              <button
                key={i}
                onClick={() => handleLineClick(i)}
                disabled={showResult || !isTyped}
                className={`w-full text-left flex items-start gap-3 px-4 py-1.5 transition-colors ${
                  !isTyped ? 'opacity-0' : 'opacity-100'
                } ${
                  showResult && isBug ? 'bg-brand-600/30'
                  : showResult && isSelected && !isBug ? 'bg-red-600/30'
                  : isHint ? 'animate-hint-pulse'
                  : 'hover:bg-ink-800'
                }`}
                style={{ transition: 'opacity 0.05s' }}
              >
                <span className="text-ink-500 select-none w-6 text-right">{i + 1}</span>
                <span className="text-ink-100 whitespace-pre">{isTyped ? line : ''}<span className="animate-typewriter border-r-2 border-info-400 ml-0.5">&nbsp;</span></span>
                {showResult && isBug && <CheckCircle2 className="h-4 w-4 text-brand-400 ml-auto shrink-0 mt-0.5 animate-check-bounce" />}
                {showResult && isSelected && !isBug && <XCircle className="h-4 w-4 text-red-400 ml-auto shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="mb-4 animate-fade-in">
            <div className={`rounded-lg p-3 ${feedback.correct ? 'bg-brand-50 border border-brand-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-2">
                {feedback.correct ? <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5 animate-check-bounce" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {feedback.correct ? 'Correct!' : selectedLine === -1 ? 'Time\'s up!' : 'Not quite!'}
                  </p>
                  <p className="text-xs text-ink-600 mt-1">{feedback.explanation}</p>
                </div>
              </div>
            </div>
            <button onClick={next} className="btn-primary w-full mt-3 animate-glow-pulse">
              {round + 1 >= totalSnippets ? 'See Results' : 'Next Bug'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
