import { useState, useRef, useCallback, useMemo } from 'react';
import { Binary } from 'lucide-react';
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
const CELL = W / COLS;

const DIFFICULTY_CONFIG: Record<Difficulty, { startTime: number; fallSpeed: number; spawnRate: number }> = {
  basic: { startTime: 60, fallSpeed: 80, spawnRate: 1.8 },
  tough: { startTime: 45, fallSpeed: 120, spawnRate: 1.3 },
  high: { startTime: 30, fallSpeed: 180, spawnRate: 0.9 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '60s, slow blocks',
  tough: '45s, faster blocks',
  high: '30s, fast blocks',
};

interface FallingBlock { id: number; col: number; y: number; binary: string; decimal: number; isTarget: boolean; }

let blockId = 0;

export default function BinaryBlitz({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
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
    collectorCol: 2,
    blocks: [] as FallingBlock[],
    spawnTimer: 0,
    target: null as { binary: string; decimal: number } | null,
    timeLeft: 60,
    lastSecond: 0,
    score: 0,
    streak: 0,
    correct: 0,
    wrong: 0,
    elapsed: 0,
  });

  const targetRef = useRef<{ binary: string; decimal: number } | null>(null);

  const generateTarget = useCallback(() => {
    const bits = 3 + Math.floor(Math.random() * 4);
    const num = Math.floor(Math.random() * (Math.pow(2, bits) - 1)) + 1;
    const target = { binary: num.toString(2), decimal: num };
    stateRef.current.target = target;
    targetRef.current = target;
  }, []);

  const startGame = useCallback(() => {
    stateRef.current = {
      collectorCol: Math.floor(COLS / 2) - 1,
      blocks: [],
      spawnTimer: 0,
      target: null,
      timeLeft: config.startTime,
      lastSecond: 0,
      score: 0,
      streak: 0,
      correct: 0,
      wrong: 0,
      elapsed: 0,
    };
    setScore(0); setStreak(0); setCorrect(0); setWrong(0); setTimeLeft(config.startTime);
    generateTarget();
    setPhase('playing');
  }, [config, generateTarget]);

  const moveLeft = useCallback(() => {
    if (phase !== 'playing') return;
    stateRef.current.collectorCol = Math.max(0, stateRef.current.collectorCol - 1);
  }, [phase]);

  const moveRight = useCallback(() => {
    if (phase !== 'playing') return;
    stateRef.current.collectorCol = Math.min(COLS - 2, stateRef.current.collectorCol + 1);
  }, [phase]);

  const handleCatch = useCallback((block: FallingBlock) => {
    const s = stateRef.current;
    if (block.isTarget) {
      s.score += 10 + s.streak * 2;
      s.streak += 1;
      s.correct += 1;
      s.timeLeft += 3;
      playSound('correct');
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
      generateTarget();
    } else {
      s.streak = 0;
      s.wrong += 1;
      s.timeLeft = Math.max(0, s.timeLeft - 3);
      playSound('wrong');
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
    }
    setScore(s.score); setStreak(s.streak); setCorrect(s.correct); setWrong(s.wrong);
  }, [generateTarget]);

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
        if (s.score >= 150) { setConfettiTrigger((t) => t + 1); }
        if (!hasAchievement(game.slug, 'first-convert')) unlockAchievement(game.slug, { id: 'first-convert', title: 'Bit Flipper', description: 'Caught your first block' });
        if (s.score >= 150 && !hasAchievement(game.slug, 'score-150')) unlockAchievement(game.slug, { id: 'score-150', title: 'Speed Coder', description: 'Scored 150+ points' });
        if (s.score >= 300 && !hasAchievement(game.slug, 'score-300')) unlockAchievement(game.slug, { id: 'score-300', title: 'Machine Language', description: 'Scored 300+ points' });
        if (s.streak >= 7 && !hasAchievement(game.slug, 'streak-7')) unlockAchievement(game.slug, { id: 'streak-7', title: 'Binary Fluent', description: '7-block streak' });
        if (s.streak >= 15 && !hasAchievement(game.slug, 'streak-15')) unlockAchievement(game.slug, { id: 'streak-15', title: 'Binary Master', description: '15-block streak' });
        onAchievement?.();
      }
    }

    // Spawn blocks
    s.spawnTimer += dt;
    if (s.spawnTimer >= config.spawnRate && s.target) {
      s.spawnTimer = 0;
      const col = Math.floor(Math.random() * (COLS - 1));
      const isTarget = Math.random() > 0.5;
      if (isTarget) {
        s.blocks.push({ id: blockId++, col, y: -CELL, binary: s.target.binary, decimal: s.target.decimal, isTarget: true });
      } else {
        let dec: number;
        do { dec = Math.floor(Math.random() * 127) + 1; } while (dec === s.target.decimal);
        s.blocks.push({ id: blockId++, col, y: -CELL, binary: dec.toString(2), decimal: dec, isTarget: false });
      }
    }

    // Move blocks
    s.blocks.forEach((b) => { b.y += config.fallSpeed * dt; });

    // Check catches
    const collectorY = H - 50;
    const collectorLeft = s.collectorCol * CELL;
    const collectorRight = collectorLeft + CELL * 2;
    const caught = s.blocks.filter((b) => b.y >= collectorY && b.y <= collectorY + 40 && b.col * CELL >= collectorLeft && b.col * CELL < collectorRight);
    if (caught.length > 0) {
      caught.forEach((b) => handleCatch(b));
      s.blocks = s.blocks.filter((b) => !caught.includes(b));
    }

    // Remove off-screen
    s.blocks = s.blocks.filter((b) => b.y < H + 50);

    // Draw
    ctx.clearRect(0, 0, W, H);

    // Grid background
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, H);
      ctx.stroke();
    }
    for (let i = 0; i <= Math.floor(H / CELL); i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(W, i * CELL);
      ctx.stroke();
    }

    // Draw blocks
    s.blocks.forEach((b) => {
      const x = b.col * CELL + 4;
      const w = CELL - 8;
      ctx.fillStyle = b.isTarget ? 'rgba(16, 138, 114, 0.85)' : 'rgba(239, 68, 68, 0.75)';
      ctx.beginPath();
      ctx.roundRect(x, b.y, w, 36, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(b.binary, x + w / 2, b.y + 22);
    });

    // Draw collector
    const cx = s.collectorCol * CELL;
    const cy = H - 50;
    const cw = CELL * 2;
    const grad = ctx.createLinearGradient(cx, cy, cx, cy + 40);
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(cx + 4, cy, cw - 8, 40, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CATCH', cx + cw / 2, cy + 25);

    // Draw target prompt
    if (targetRef.current) {
      ctx.fillStyle = 'rgba(30, 58, 95, 0.9)';
      ctx.beginPath();
      ctx.roundRect(W / 2 - 80, 8, 160, 36, 8);
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Find: ${targetRef.current.binary} = ${targetRef.current.decimal}`, W / 2, 30);
    }
  }, [config, game.slug, handleCatch, onAchievement]);

  const { canvasRef, handleTouchStart, handleTouchEnd } = useCanvasGame({
    onTick,
    onKeyLeft: moveLeft,
    onKeyRight: moveRight,
    onSwipeLeft: moveLeft,
    onSwipeRight: moveRight,
    width: W,
    height: H,
    running: phase === 'playing',
  });

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
        <AnimatedBackground category="tech" />
        <DifficultySelector
          title="Binary Blitz"
          description="Catch falling binary blocks that match the target decimal value. Use arrow keys or swipe to move."
          icon={<Binary className="h-14 w-14 text-info-600" />}
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
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Time's Up!</h3>
            <div className="font-display font-extrabold text-5xl text-ink-900 mb-2 animate-pop-in">{score}</div>
            <p className="text-sm text-ink-500 mb-4">
              Caught {correct} correct blocks! {score >= 200 ? 'Binary master!' : score >= 100 ? 'Solid conversion skills!' : 'Keep practicing!'}
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
      <AnimatedBackground category="tech" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={Math.floor(correct / 5) + 1} streak={streak} score={score} timeLeft={timeLeft} />
        <div className="mb-4 h-2 rounded-full bg-ink-100 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-400 animate-pulse' : 'bg-info-500'}`} style={{ width: `${Math.min((timeLeft / maxTime) * 100, 100)}%` }} />
        </div>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="rounded-xl border-2 border-info-200 bg-info-950/95 touch-none max-w-full"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
        <p className="text-xs text-ink-400 mt-3 text-center">
          Use ← → arrow keys or swipe to move. Catch the green block matching the target, avoid red blocks.
        </p>
      </div>
    </div>
  );
}
