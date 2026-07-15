import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useCanvasGame } from '../lib/useCanvasGame';
import { playSound } from '../lib/sound';
import { unlockAchievement, hasAchievement } from '../lib/storage';

const W = 360;
const H = 480;
const COLS = 6;
const ROWS = 8;
const CELL = W / COLS;

type Op = '+' | '-' | '*' | '/';

interface Problem { text: string; answer: number; options: number[]; }

const DIFFICULTY_CONFIG: Record<Difficulty, { startTime: number; moveSpeed: number; maxNum: number; timeBonus: number; timePenalty: number }> = {
  basic: { startTime: 60, moveSpeed: 3, maxNum: 20, timeBonus: 4, timePenalty: 3 },
  tough: { startTime: 45, moveSpeed: 4, maxNum: 50, timeBonus: 3, timePenalty: 5 },
  high: { startTime: 30, moveSpeed: 5, maxNum: 100, timeBonus: 2, timePenalty: 7 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '60s, numbers up to 20',
  tough: '45s, numbers up to 50',
  high: '30s, numbers up to 100',
};

interface AnswerTile { id: number; col: number; row: number; value: number; isCorrect: boolean; }

let tileId = 0;

function generateProblem(streak: number, maxNum: number): Problem {
  const ops: Op[] = ['+', '-'];
  if (streak >= 3) ops.push('*');
  if (streak >= 8) ops.push('/');
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;
  switch (op) {
    case '+': a = Math.floor(Math.random() * maxNum) + 1; b = Math.floor(Math.random() * maxNum) + 1; answer = a + b; break;
    case '-': a = Math.floor(Math.random() * maxNum) + 1; b = Math.floor(Math.random() * a) + 1; answer = a - b; break;
    case '*': a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; answer = a * b; break;
    case '/': b = Math.floor(Math.random() * 9) + 2; answer = Math.floor(Math.random() * 9) + 1; a = b * answer; break;
  }
  const options = new Set<number>([answer]);
  while (options.size < 3) {
    const delta = Math.floor(Math.random() * 10) + 1;
    const wrong = answer + (Math.random() > 0.5 ? delta : -delta);
    if (wrong >= 0 && wrong !== answer) options.add(wrong);
  }
  return { text: `${a} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${b}`, answer, options: [...options] };
}

export default function MathSprint({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.tough;

  const stateRef = useRef({
    playerCol: Math.floor(COLS / 2),
    playerRow: Math.floor(ROWS / 2),
    dir: { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    tiles: [] as AnswerTile[],
    problem: null as Problem | null,
    moveTimer: 0,
    timeLeft: 60,
    lastSecond: 0,
    score: 0,
    streak: 0,
    correct: 0,
    wrong: 0,
    elapsed: 0,
  });

  const problemRef = useRef<Problem | null>(null);

  const spawnProblem = useCallback((streak: number) => {
    const s = stateRef.current;
    const prob = generateProblem(streak, config.maxNum);
    s.problem = prob;
    problemRef.current = prob;
    const used = new Set<string>();
    const tiles: AnswerTile[] = [];
    prob.options.forEach((val) => {
      let col: number, row: number;
      do {
        col = Math.floor(Math.random() * COLS);
        row = Math.floor(Math.random() * ROWS);
      } while (used.has(`${col},${row}`) || (col === s.playerCol && row === s.playerRow));
      used.add(`${col},${row}`);
      tiles.push({ id: tileId++, col, row, value: val, isCorrect: val === prob.answer });
    });
    s.tiles = tiles;
  }, [config.maxNum]);

  const startGame = useCallback(() => {
    stateRef.current = {
      playerCol: Math.floor(COLS / 2),
      playerRow: Math.floor(ROWS / 2),
      dir: { x: 0, y: 0 },
      nextDir: { x: 0, y: 0 },
      tiles: [],
      problem: null,
      moveTimer: 0,
      timeLeft: config.startTime,
      lastSecond: 0,
      score: 0,
      streak: 0,
      correct: 0,
      wrong: 0,
      elapsed: 0,
    };
    setScore(0); setStreak(0); setCorrect(0); setWrong(0); setTimeLeft(config.startTime);
    spawnProblem(0);
    setPhase('playing');
  }, [config, spawnProblem]);

  const setDir = useCallback((x: number, y: number) => {
    if (phase !== 'playing') return;
    const s = stateRef.current;
    if (s.dir.x === -x && s.dir.y === -y && (x !== 0 || y !== 0)) return;
    s.nextDir = { x, y };
  }, [phase]);

  const handleCollect = useCallback((tile: AnswerTile) => {
    const s = stateRef.current;
    if (tile.isCorrect) {
      s.score += 10 + s.streak * 3;
      s.streak += 1;
      s.correct += 1;
      s.timeLeft += config.timeBonus;
      playSound('correct');
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
      spawnProblem(s.streak);
    } else {
      s.streak = 0;
      s.wrong += 1;
      s.timeLeft = Math.max(0, s.timeLeft - config.timePenalty);
      playSound('wrong');
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
      // Remove the wrong tile, keep playing
      s.tiles = s.tiles.filter((t) => t.id !== tile.id);
    }
    setScore(s.score); setStreak(s.streak); setCorrect(s.correct); setWrong(s.wrong);
  }, [config, spawnProblem]);

  const onTick = useCallback((ctx: CanvasRenderingContext2D, dt: number) => {
    const s = stateRef.current;
    s.elapsed += dt;

    // Timer
    s.lastSecond += dt;
    if (s.lastSecond >= 1) {
      s.timeLeft -= 1;
      s.lastSecond = 0;
      setTimeLeft(s.timeLeft);
      if (s.timeLeft <= 0) {
        setPhase('gameover');
        playSound('game-over');
        if (s.score >= 200) setConfettiTrigger((t) => t + 1);
        if (!hasAchievement(game.slug, 'first-correct')) unlockAchievement(game.slug, { id: 'first-correct', title: 'First Steps', description: 'Solved your first problem' });
        if (s.streak >= 5 && !hasAchievement(game.slug, 'streak-5')) unlockAchievement(game.slug, { id: 'streak-5', title: 'On Fire', description: '5-problem streak' });
        if (s.streak >= 10 && !hasAchievement(game.slug, 'streak-10')) unlockAchievement(game.slug, { id: 'streak-10', title: 'Lightning Brain', description: '10-problem streak' });
        if (s.score >= 200 && !hasAchievement(game.slug, 'score-200')) unlockAchievement(game.slug, { id: 'score-200', title: 'Math Whiz', description: 'Scored 200+ points' });
        if (s.score >= 500 && !hasAchievement(game.slug, 'score-500')) unlockAchievement(game.slug, { id: 'score-500', title: 'Human Calculator', description: 'Scored 500+ points' });
        onAchievement?.();
      }
    }

    // Move player
    s.moveTimer += dt;
    const moveInterval = 1 / config.moveSpeed;
    if (s.moveTimer >= moveInterval && (s.nextDir.x !== 0 || s.nextDir.y !== 0)) {
      s.moveTimer = 0;
      s.dir = s.nextDir;
      s.playerCol = (s.playerCol + s.dir.x + COLS) % COLS;
      s.playerRow = (s.playerRow + s.dir.y + ROWS) % ROWS;
      const hit = s.tiles.find((t) => t.col === s.playerCol && t.row === s.playerRow);
      if (hit) handleCollect(hit);
    }

    // Draw
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
    }

    // Floating math symbols background
    ctx.fillStyle = 'rgba(249, 115, 22, 0.06)';
    ctx.font = '20px sans-serif';
    const symbols = ['+', '−', '×', '÷'];
    for (let i = 0; i < 8; i++) {
      const x = ((i * 47 + Math.floor(s.elapsed * 10)) % W);
      const y = ((i * 53 + Math.floor(s.elapsed * 5)) % H);
      ctx.fillText(symbols[i % 4], x, y);
    }

    // Answer tiles
    s.tiles.forEach((t) => {
      const x = t.col * CELL;
      const y = t.row * CELL;
      ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, CELL - 8, CELL - 8, 8);
      ctx.fill();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(t.value), x + CELL / 2, y + CELL / 2);
    });

    // Player
    const px = s.playerCol * CELL;
    const py = s.playerRow * CELL;
    const grad = ctx.createRadialGradient(px + CELL / 2, py + CELL / 2, 2, px + CELL / 2, py + CELL / 2, CELL / 2);
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px + CELL / 2, py + CELL / 2, CELL / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px + CELL / 2 - 4, py + CELL / 2 - 3, 2, 0, Math.PI * 2);
    ctx.arc(px + CELL / 2 + 4, py + CELL / 2 - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Problem display
    if (problemRef.current) {
      ctx.fillStyle = 'rgba(30, 58, 95, 0.9)';
      ctx.beginPath();
      ctx.roundRect(8, 8, W - 16, 36, 8);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${problemRef.current.text} = ?`, W / 2, 26);
    }
  }, [config, game.slug, handleCollect, onAchievement]);

  const { canvasRef, handleTouchStart, handleTouchEnd } = useCanvasGame({
    onTick,
    onKeyLeft: () => setDir(-1, 0),
    onKeyRight: () => setDir(1, 0),
    onKeyUp: () => setDir(0, -1),
    onSwipeLeft: () => setDir(-1, 0),
    onSwipeRight: () => setDir(1, 0),
    onSwipeUp: () => setDir(0, -1),
    width: W,
    height: H,
    running: phase === 'playing',
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); setDir(0, 1); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setDir]);

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    startGame();
  };

  const reset = () => startGame();
  const changeDifficulty = () => setPhase('difficulty');
  const resetAll = () => { setPhase('cover'); setDifficulty(null); };

  const maxTime = useMemo(() => config.startTime + 15, [config.startTime]);

  if (phase === 'cover') {
    return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;
  }

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="kids" />
        <DifficultySelector
          title="Math Sprint"
          description="Steer the glowing character into the correct answer tile. Avoid wrong answers! Use arrow keys or swipe to move."
          icon={<Calculator className="h-14 w-14 text-accent-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={confettiTrigger} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Sprint Complete!</h3>
            <div className="font-display font-extrabold text-5xl text-ink-900 mb-2 animate-pop-in">{score}</div>
            <p className="text-sm text-ink-500 mb-4">
              Solved {correct} {correct === 1 ? 'problem' : 'problems'}! {score >= 200 ? 'Lightning fast!' : score >= 100 ? 'Great mental math!' : 'Keep practicing!'}
            </p>
            <button onClick={reset} className="btn-secondary w-full">Play Again</button>
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
      <AnimatedBackground category="kids" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={Math.floor(correct / 5) + 1} streak={streak} score={score} timeLeft={timeLeft} />
        <div className="mb-4 h-2 rounded-full bg-ink-100 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-400 animate-pulse' : 'bg-accent-500'}`} style={{ width: `${Math.min((timeLeft / maxTime) * 100, 100)}%` }} />
        </div>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="rounded-xl border-2 border-accent-200 bg-accent-950/95 touch-none max-w-full"
          />
        </div>
        <p className="text-xs text-ink-400 mt-3 text-center">
          Use arrow keys or swipe to steer. Collect the tile with the correct answer, avoid wrong ones.
        </p>
      </div>
    </div>
  );
}
