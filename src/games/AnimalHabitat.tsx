import { useState, useMemo } from 'react';
import { PawPrint, CheckCircle2 } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

type Habitat = 'forest' | 'ocean' | 'desert' | 'arctic';

interface AnimalRound {
  animal: string;
  emoji: string;
  habitat: Habitat;
  options: Habitat[];
}

const ANIMALS: AnimalRound[] = [
  { animal: 'Bear', emoji: '🐻', habitat: 'forest', options: ['forest', 'ocean', 'desert', 'arctic'] },
  { animal: 'Dolphin', emoji: '🐬', habitat: 'ocean', options: ['desert', 'ocean', 'forest', 'arctic'] },
  { animal: 'Camel', emoji: '🐫', habitat: 'desert', options: ['ocean', 'forest', 'desert', 'arctic'] },
  { animal: 'Penguin', emoji: '🐧', habitat: 'arctic', options: ['arctic', 'desert', 'ocean', 'forest'] },
  { animal: 'Monkey', emoji: '🐵', habitat: 'forest', options: ['ocean', 'forest', 'arctic', 'desert'] },
  { animal: 'Shark', emoji: '🦈', habitat: 'ocean', options: ['forest', 'ocean', 'desert', 'arctic'] },
  { animal: 'Snake', emoji: '🐍', habitat: 'desert', options: ['arctic', 'ocean', 'desert', 'forest'] },
  { animal: 'Polar Bear', emoji: '🐻‍❄️', habitat: 'arctic', options: ['desert', 'forest', 'ocean', 'arctic'] },
  { animal: 'Fox', emoji: '🦊', habitat: 'forest', options: ['forest', 'ocean', 'arctic', 'desert'] },
  { animal: 'Whale', emoji: '🐳', habitat: 'ocean', options: ['desert', 'arctic', 'ocean', 'forest'] },
  { animal: 'Lizard', emoji: '🦎', habitat: 'desert', options: ['ocean', 'desert', 'forest', 'arctic'] },
  { animal: 'Owl', emoji: '🦉', habitat: 'forest', options: ['arctic', 'forest', 'ocean', 'desert'] },
];

const HABITAT_ICONS: Record<Habitat, string> = {
  forest: '🌲',
  ocean: '🌊',
  desert: '🏜️',
  arctic: '❄️',
};

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number }> = {
  basic: { rounds: 5 },
  tough: { rounds: 8 },
  high: { rounds: 10 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '5 animals',
  tough: '8 animals',
  high: '10 animals',
};

const ACHIEVEMENTS = [
  { id: 'first-habitat', title: 'Animal Friend', description: 'Matched your first animal', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Wildlife Expert', description: '5 correct in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'score-15', title: 'Habitat Hero', description: 'Scored 15+ points', condition: (s: any) => s.score >= 15 },
  { id: 'perfect', title: 'Zoologist', description: 'All correct!', condition: (s: any) => s.correct >= 10 && s.wrong === 0 },
];

export default function AnimalHabitat({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);

  const eng = useGameEngagement({ slug: game.slug, achievements: ACHIEVEMENTS });

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.basic;
  const totalRounds = config.rounds;

  const animalList = useMemo(() => [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, totalRounds), [totalRounds]);
  const currentAnimal = animalList[round];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = currentAnimal.options[idx] === currentAnimal.habitat;
    setFeedback({ correct: isCorrect });
    if (isCorrect) { eng.onCorrect(2); setMascotTrigger(t => t + 1); setMascotWrong(false); }
    else { eng.onWrong(); setMascotTrigger(t => t + 1); setMascotWrong(true); }
  };

  const next = () => {
    if (round + 1 >= totalRounds) { setPhase('gameover'); eng.playSound('game-over'); eng.checkAchievements(eng.score); onAchievement?.(); }
    else { setRound(r => r + 1); setSelected(null); setFeedback(null); }
  };

  const startWithDifficulty = (diff: Difficulty) => { setDifficulty(diff); eng.reset(); setPhase('playing'); };
  const reset = () => { setRound(0); eng.reset(); setSelected(null); setFeedback(null); setPhase('playing'); };
  const changeDifficulty = () => setPhase('difficulty');
  const resetAll = () => { setPhase('cover'); setDifficulty(null); reset(); };

  if (phase === 'cover') return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="kids" />
        <DifficultySelector title="Animal Habitat Match" description="Match friendly animals to where they live! No timer, just fun!" icon={<PawPrint className="h-14 w-14 text-teal-600" />} difficultyDescriptions={DIFFICULTY_DESCRIPTIONS} onSelect={startWithDifficulty} />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={eng.score >= 15 ? eng.confettiTrigger : 0} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Great Job!</h3>
            <div className="font-display font-extrabold text-5xl text-teal-600 mb-2 animate-pop-in">{eng.score}</div>
            <p className="text-sm text-ink-500 mb-4">{eng.score >= 18 ? 'You know all about animals!' : eng.score >= 10 ? 'Great animal matching!' : 'Keep learning about animals!'}</p>
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
      <AnimatedBackground category="kids" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} />
        <div className="mb-1 text-xs text-ink-400">Animal {round + 1} of {totalRounds}</div>

        <div key={round} className="rounded-xl bg-teal-50 border border-teal-200 p-6 mb-3 animate-slide-in-right text-center">
          <p className="text-lg font-display font-semibold text-ink-900 mb-3">Where does this animal live?</p>
          <div className="text-7xl mb-2 animate-mascot-bounce">{currentAnimal?.emoji}</div>
          <p className="text-xl font-display font-bold text-ink-800">{currentAnimal?.animal}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {currentAnimal?.options.map((option, idx) => {
            const isSelected = selected === idx; const showResult = selected !== null;
            const isCorrect = option === currentAnimal.habitat;
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={showResult}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all animate-pop-in ${showResult ? isCorrect ? 'border-brand-400 bg-brand-50' : isSelected ? 'border-red-300 bg-red-50 animate-shake' : 'border-ink-200 bg-white opacity-60' : 'border-ink-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 hover:scale-[1.02] cursor-pointer'}`}
                style={{ animationDelay: `${idx * 80}ms` }}>
                <span className="text-4xl">{HABITAT_ICONS[option]}</span>
                <span className="text-sm font-semibold text-ink-700 capitalize">{option}</span>
                {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-brand-600 animate-check-bounce" />}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="animate-fade-in rounded-lg border border-ink-200 bg-ink-50 p-3 mb-4 text-center">
            <p className="text-sm font-semibold text-ink-700">
              {feedback.correct ? 'That\'s right! You know your animals!' : 'Not quite — try again next time!'}
            </p>
          </div>
        )}

        {selected !== null && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">
            {round + 1 >= totalRounds ? 'See Results' : 'Next Animal'}
          </button>
        )}
      </div>
    </div>
  );
}
