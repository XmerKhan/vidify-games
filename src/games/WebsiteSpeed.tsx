import { useState, useMemo } from 'react';
import { Gauge, CheckCircle2, XCircle, Zap, Image, Database, Server, Globe } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface Optimization {
  name: string;
  icon: typeof Zap;
  timeSaved: number;
  description: string;
}

const OPTIMIZATIONS: Optimization[] = [
  { name: 'Compress Images', icon: Image, timeSaved: 2.5, description: 'Resize and compress images to reduce file size by 70%.' },
  { name: 'Enable Caching', icon: Database, timeSaved: 1.8, description: 'Browser caching stores assets locally for returning visitors.' },
  { name: 'Minify CSS/JS', icon: Zap, timeSaved: 0.8, description: 'Remove whitespace and comments from code files.' },
  { name: 'Use a CDN', icon: Globe, timeSaved: 1.2, description: 'Distribute assets globally so users load from nearby servers.' },
  { name: 'Reduce Server Response', icon: Server, timeSaved: 1.5, description: 'Optimize database queries and server-side processing.' },
  { name: 'Lazy Load Images', icon: Image, timeSaved: 0.6, description: 'Load images only when they enter the viewport.' },
  { name: 'Defer JavaScript', icon: Zap, timeSaved: 0.9, description: 'Load non-critical JS after the page renders.' },
  { name: 'Enable Gzip Compression', icon: Server, timeSaved: 1.0, description: 'Compress HTML, CSS, and JS files during transfer.' },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { targetTime: number; rounds: number }> = {
  basic: { targetTime: 2.0, rounds: 3 },
  tough: { targetTime: 1.5, rounds: 4 },
  high: { targetTime: 1.0, rounds: 5 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: 'Get under 2.0s',
  tough: 'Get under 1.5s',
  high: 'Get under 1.0s',
};

const ACHIEVEMENTS = [
  { id: 'first-opt', title: 'Optimizer', description: 'Applied your first optimization', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-3', title: 'Speed Demon', description: '3 targets met in a row', condition: (s: any) => s.streak >= 3 },
  { id: 'score-15', title: 'Performance Pro', description: 'Scored 15+ points', condition: (s: any) => s.score >= 15 },
  { id: 'perfect', title: 'Speed Master', description: 'Met all targets', condition: (s: any) => s.correct >= 5 && s.wrong === 0 },
];

export default function WebsiteSpeed({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(0);
  const [selectedOpts, setSelectedOpts] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<{ met: boolean; finalTime: number } | null>(null);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.basic;
  const totalRounds = config.rounds;
  const startTime = 6.0;

  const optList = useMemo(() => [...OPTIMIZATIONS].sort(() => Math.random() - 0.5).slice(0, 6), [round]);
  const currentTime = startTime - Array.from(selectedOpts).reduce((sum, idx) => {
    const opt = optList[idx];
    return sum + (opt ? opt.timeSaved : 0);
  }, 0);

  const toggleOpt = (idx: number) => {
    if (feedback) return;
    const next = new Set(selectedOpts);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedOpts(next);
  };

  const submit = () => {
    const met = currentTime <= config.targetTime;
    setFeedback({ met, finalTime: currentTime });
    if (met) {
      eng.onCorrect(3);
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
    } else {
      eng.onWrong();
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
    }
  };

  const nextRound = () => {
    if (round + 1 >= totalRounds) {
      setPhase('gameover');
      eng.playSound('game-over');
      eng.checkAchievements(eng.score);
      onAchievement?.();
    } else {
      setRound((r) => r + 1);
      setSelectedOpts(new Set());
      setFeedback(null);
    }
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    eng.reset();
    setSelectedOpts(new Set());
    setFeedback(null);
    setPhase('playing');
  };

  const reset = () => {
    setRound(0);
    eng.reset();
    setSelectedOpts(new Set());
    setFeedback(null);
    setPhase('playing');
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
          title="Website Speed Optimizer"
          description="Pick the right optimizations to get the page load time under the target!"
          icon={<Gauge className="h-14 w-14 text-info-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 12 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Optimization Complete</h3>
            <div className="font-display font-extrabold text-5xl text-info-600 mb-2 animate-pop-in">{eng.score} / {totalRounds * 3}</div>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 12 ? 'Performance expert!' : eng.score >= 8 ? 'Good optimization skills!' : 'Learn which optimizations matter most!'}
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
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} />
        <div className="mb-1 text-xs text-ink-400">Round {round + 1} / {totalRounds}</div>

        <div className="rounded-xl bg-info-50 border border-info-200 p-4 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-ink-700">Current Load Time</span>
            <span className={`font-display font-bold text-2xl ${currentTime <= config.targetTime ? 'text-brand-600' : 'text-accent-600'}`}>
              {currentTime.toFixed(1)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-ink-400 mb-2">
            <span>Target: {config.targetTime.toFixed(1)}s</span>
            <span>Started at: {startTime.toFixed(1)}s</span>
          </div>
          <div className="h-3 bg-info-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${currentTime <= config.targetTime ? 'bg-brand-500' : 'bg-accent-500'}`}
              style={{ width: `${Math.min(100, (currentTime / startTime) * 100)}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-ink-500 mb-2">Select optimizations to apply:</p>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {optList.map((opt, idx) => {
            const isSelected = selectedOpts.has(idx);
            const Icon = opt.icon;
            return (
              <button
                key={idx}
                onClick={() => toggleOpt(idx)}
                disabled={!!feedback}
                className={`rounded-lg border p-3 text-left text-sm transition-all ${
                  isSelected ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-white hover:border-info-300'
                } ${feedback ? 'opacity-70' : 'hover:scale-[1.02] cursor-pointer'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-info-600" />
                  <span className="font-semibold text-ink-800">{opt.name}</span>
                </div>
                <p className="text-xs text-ink-500 leading-relaxed">{opt.description}</p>
                <p className="text-xs font-bold text-brand-600 mt-1">-{opt.timeSaved.toFixed(1)}s</p>
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="animate-fade-in rounded-lg border border-ink-200 bg-ink-50 p-3 mb-4">
            <div className="flex items-center gap-2">
              {feedback.met ? <CheckCircle2 className="h-5 w-5 text-brand-600 animate-check-bounce" />
              : <XCircle className="h-5 w-5 text-red-500" />}
              <p className="text-sm text-ink-700">
                {feedback.met ? `Target met! Load time: ${feedback.finalTime.toFixed(1)}s` : `Not quite. Load time: ${feedback.finalTime.toFixed(1)}s — target was ${config.targetTime.toFixed(1)}s`}
              </p>
            </div>
          </div>
        )}

        {!feedback && (
          <button onClick={submit} className="btn-primary w-full animate-glow-pulse">
            Apply Optimizations
          </button>
        )}

        {feedback && (
          <button onClick={nextRound} className="btn-primary w-full animate-glow-pulse">
            {round + 1 >= totalRounds ? 'See Results' : 'Next Round'}
          </button>
        )}
      </div>
    </div>
  );
}
