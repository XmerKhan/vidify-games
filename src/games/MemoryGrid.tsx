import { useState, useEffect, useCallback } from 'react';
import { Grid3x3, RotateCcw } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { playSound } from '../lib/sound';
import { unlockAchievement, hasAchievement } from '../lib/storage';

interface FlagCard { id: number; flag: string; country: string; flipped: boolean; matched: boolean; }

const FLAGS: { flag: string; country: string }[] = [
  { flag: '🇯🇵', country: 'Japan' }, { flag: '🇧🇷', country: 'Brazil' }, { flag: '🇨🇦', country: 'Canada' },
  { flag: '🇫🇷', country: 'France' }, { flag: '🇩🇪', country: 'Germany' }, { flag: '🇮🇹', country: 'Italy' },
  { flag: '🇪🇸', country: 'Spain' }, { flag: '🇰🇷', country: 'South Korea' }, { flag: '🇲🇽', country: 'Mexico' },
  { flag: '🇮🇳', country: 'India' }, { flag: '🇦🇺', country: 'Australia' }, { flag: '🇳🇱', country: 'Netherlands' },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { pairs: number }> = {
  basic: { pairs: 6 },
  tough: { pairs: 8 },
  high: { pairs: 10 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '6 flag pairs',
  tough: '8 flag pairs',
  high: '10 flag pairs',
};

function createBoard(pairs: number): FlagCard[] {
  const selected = [...FLAGS].sort(() => Math.random() - 0.5).slice(0, pairs);
  const cards: FlagCard[] = [];
  selected.forEach((f, i) => {
    cards.push({ id: i * 2, flag: f.flag, country: f.country, flipped: false, matched: false });
    cards.push({ id: i * 2 + 1, flag: f.flag, country: f.country, flipped: false, matched: false });
  });
  return cards.sort(() => Math.random() - 0.5);
}

export default function MemoryGrid({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [, setDifficulty] = useState<Difficulty | null>(null);
  const [pairs, setPairs] = useState(8);
  const [cards, setCards] = useState<FlagCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);
  const [burstIdx, setBurstIdx] = useState<number | null>(null);

  const handleCardClick = useCallback((idx: number) => {
    if (lockBoard) return;
    const card = cards[idx];
    if (card.flipped || card.matched) return;
    playSound('click');
    const newCards = [...cards];
    newCards[idx] = { ...card, flipped: true };
    setCards(newCards);
    setFlipped((prev) => [...prev, idx]);
  }, [cards, lockBoard]);

  useEffect(() => {
    if (flipped.length === 2) {
      setLockBoard(true);
      setMoves((m) => m + 1);
      const [a, b] = flipped;
      const cardA = cards[a];
      const cardB = cards[b];

      if (cardA.flag === cardB.flag) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.id === cardA.id || c.id === cardB.id ? { ...c, matched: true } : c));
          setMatched((m) => m + 1);
          setFlipped([]);
          setLockBoard(false);
          playSound('correct');
          setMascotTrigger((t) => t + 1);
          setMascotWrong(false);
          setBurstIdx(a);
          setTimeout(() => setBurstIdx(null), 600);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c, idx) => idx === a || idx === b ? { ...c, flipped: false } : c));
          setFlipped([]);
          setLockBoard(false);
          playSound('wrong');
          setMascotTrigger((t) => t + 1);
          setMascotWrong(true);
        }, 900);
      }
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (matched === pairs && pairs > 0) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeout(() => {
        setPhase('gameover');
        setConfettiTrigger((t) => t + 1);
        playSound('level-up');
        if (!hasAchievement(game.slug, 'first-match')) { unlockAchievement(game.slug, { id: 'first-match', title: 'Match Maker', description: 'Found your first pair' }); }
        if (!hasAchievement(game.slug, 'memory-master')) { unlockAchievement(game.slug, { id: 'memory-master', title: 'Memory Master', description: 'Cleared the board' }); }
        if (moves <= pairs * 2 && !hasAchievement(game.slug, 'perfect-memory')) { unlockAchievement(game.slug, { id: 'perfect-memory', title: 'Perfect Memory', description: `Cleared in ${moves} moves` }); }
        if (elapsed < 60 && !hasAchievement(game.slug, 'speed-demon')) { unlockAchievement(game.slug, { id: 'speed-demon', title: 'Speed Demon', description: `Cleared in ${elapsed}s` }); }
        onAchievement?.();
      }, 500);
    }
  }, [matched, moves, startTime, game.slug, onAchievement, pairs]);

  const score = Math.max(0, 1000 - moves * 20 + matched * 50);

  const startWithDifficulty = (diff: Difficulty) => {
    const cfg = DIFFICULTY_CONFIG[diff];
    setDifficulty(diff);
    setPairs(cfg.pairs);
    setCards(createBoard(cfg.pairs));
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setLockBoard(false);
    setStartTime(Date.now());
    setPhase('playing');
  };

  const reset = () => {
    setCards(createBoard(pairs));
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setLockBoard(false);
    setStartTime(Date.now());
    setPhase('playing');
  };

  const changeDifficulty = () => setPhase('difficulty');

  const resetAll = () => {
    setPhase('cover');
    setDifficulty(null);
    setCards([]);
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setLockBoard(false);
  };

  if (phase === 'cover') {
    return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;
  }

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="educational" />
        <DifficultySelector
          title="Memory Grid"
          description="Flip cards to find matching flag pairs. Higher difficulty means more pairs to match."
          icon={<Grid3x3 className="h-14 w-14 text-purple-600" />}
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
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">You Win!</h3>
            <div className="font-display font-extrabold text-5xl text-ink-900 mb-2 animate-pop-in">{score}</div>
            <p className="text-sm text-ink-500 mb-4">
              Cleared in {moves} moves! {moves <= pairs * 2 ? 'Perfect memory!' : moves <= pairs * 3 ? 'Great recall!' : 'Nice work — play again to improve!'}
            </p>
            <button onClick={reset} className="btn-secondary w-full">
              <RotateCcw className="h-4 w-4" /> Play Again
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
      <AnimatedBackground category="educational" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="badge-purple">Moves: {moves}</span>
          <span className="text-sm text-ink-500">Matched: {matched} / {pairs}</span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
          {cards.map((card, idx) => {
            const isFlipped = card.flipped || card.matched;
            const isBursting = burstIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => handleCardClick(idx)}
                className="relative aspect-square preserve-3d"
                style={{ transition: 'transform 0.5s', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                disabled={card.flipped || card.matched || lockBoard}
              >
                <div className="absolute inset-0 rounded-xl bg-purple-500 border-2 border-purple-500 flex items-center justify-center backface-hidden">
                  <span className="text-white text-2xl font-bold">?</span>
                </div>
                <div className={`absolute inset-0 rounded-xl bg-white border-2 ${card.matched ? 'border-brand-400' : 'border-purple-300'} shadow-soft flex items-center justify-center backface-hidden rotate-y-180 ${card.matched ? 'opacity-60' : ''} ${isBursting ? 'animate-scale-burst' : ''}`}>
                  <span className="text-4xl sm:text-5xl animate-card-flip-in">{card.flag}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-ink-400 mt-4 text-center">
          Flip cards to find matching flag pairs. Fewer moves = higher score!
        </div>
      </div>
    </div>
  );
}
