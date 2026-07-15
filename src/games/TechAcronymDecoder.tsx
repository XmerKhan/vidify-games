import { useState, useMemo, useEffect } from 'react';
import { BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useGameEngagement } from '../lib/useGameEngagement';

interface AcronymQuestion {
  acronym: string;
  options: string[];
  answer: string;
}

const QUESTIONS: AcronymQuestion[] = [
  { acronym: 'API', options: ['Application Programming Interface', 'Advanced Protocol Internet', 'Automated Process Integration', 'Application Process Identifier'], answer: 'Application Programming Interface' },
  { acronym: 'CSS', options: ['Computer Style System', 'Cascading Style Sheets', 'Creative Style Syntax', 'Client Side Scripting'], answer: 'Cascading Style Sheets' },
  { acronym: 'DNS', options: ['Domain Name System', 'Data Network Service', 'Direct Network Server', 'Dynamic Name Service'], answer: 'Domain Name System' },
  { acronym: 'SQL', options: ['Structured Query Language', 'Simple Question Language', 'System Query Logic', 'Server Quality Language'], answer: 'Structured Query Language' },
  { acronym: 'HTTP', options: ['HyperText Transfer Protocol', 'High Tech Transfer Process', 'HyperText Transmission Protocol', 'Host Transfer Text Protocol'], answer: 'HyperText Transfer Protocol' },
  { acronym: 'URL', options: ['Universal Resource Locator', 'Uniform Resource Locator', 'Unique Reference Link', 'Universal Reference Locator'], answer: 'Uniform Resource Locator' },
  { acronym: 'HTML', options: ['HyperText Markup Language', 'High Tech Modern Language', 'Hyper Tool Markup Language', 'Home Tool Markup Language'], answer: 'HyperText Markup Language' },
  { acronym: 'JSON', options: ['JavaScript Object Notation', 'Java Standard Object Notation', 'JavaScript Oriented Network', 'Java Serialized Object Notation'], answer: 'JavaScript Object Notation' },
  { acronym: 'AJAX', options: ['Asynchronous JavaScript and XML', 'Advanced JavaScript and XML', 'Automated JSON and XML', 'Asynchronous Java and XML'], answer: 'Asynchronous JavaScript and XML' },
  { acronym: 'DOM', options: ['Document Object Model', 'Data Object Manager', 'Document Oriented Model', 'Dynamic Object Model'], answer: 'Document Object Model' },
  { acronym: 'FTP', options: ['File Transfer Protocol', 'Fast Transfer Process', 'File Transmission Protocol', 'Full Text Protocol'], answer: 'File Transfer Protocol' },
  { acronym: 'SSL', options: ['Secure Sockets Layer', 'Safe Sockets Layer', 'System Security Layer', 'Server Security Lock'], answer: 'Secure Sockets Layer' },
  { acronym: 'REST', options: ['Representational State Transfer', 'Remote Endpoint Service Technology', 'Request Enable State Transfer', 'Resource Entity State Transfer'], answer: 'Representational State Transfer' },
  { acronym: 'VPN', options: ['Virtual Private Network', 'Verified Public Network', 'Very Personal Network', 'Virtual Protected Node'], answer: 'Virtual Private Network' },
  { acronym: 'SSH', options: ['Secure Shell', 'Safe Shell', 'System Shell Handler', 'Server Security Host'], answer: 'Secure Shell' },
  { acronym: 'IDE', options: ['Integrated Development Environment', 'Interface Design Editor', 'Interactive Development Editor', 'Integrated Debugging Environment'], answer: 'Integrated Development Environment' },
  { acronym: 'SDK', options: ['Software Development Kit', 'System Design Kit', 'Standard Development Kit', 'Software Deployment Key'], answer: 'Software Development Kit' },
  { acronym: 'MVC', options: ['Model View Controller', 'Multi View Component', 'Model Variable Controller', 'Module View Container'], answer: 'Model View Controller' },
  { acronym: 'CRUD', options: ['Create Read Update Delete', 'Control Read Update Data', 'Cache Read Update Delete', 'Create Request Update Deploy'], answer: 'Create Read Update Delete' },
  { acronym: 'CI/CD', options: ['Continuous Integration / Continuous Deployment', 'Code Integration / Code Deployment', 'Central Integration / Central Deployment', 'Continuous Inspection / Continuous Delivery'], answer: 'Continuous Integration / Continuous Deployment' },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number; timePerQuestion: number }> = {
  basic: { rounds: 8, timePerQuestion: 15 },
  tough: { rounds: 12, timePerQuestion: 10 },
  high: { rounds: 16, timePerQuestion: 7 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '8 acronyms, 15s each',
  tough: '12 acronyms, 10s each',
  high: '16 acronyms, 7s each',
};

const ACHIEVEMENTS = [
  { id: 'first-decode', title: 'Decoder', description: 'Decoded your first acronym', condition: (s: any) => s.correct >= 1 },
  { id: 'streak-5', title: 'Tech Fluent', description: '5 correct in a row', condition: (s: any) => s.streak >= 5 },
  { id: 'score-25', title: 'Jargon Buster', description: 'Scored 25+ points', condition: (s: any) => s.score >= 25 },
  { id: 'perfect', title: 'Tech Dictionary', description: 'Perfect round', condition: (s: any) => s.correct >= 16 && s.wrong === 0 },
];

export default function TechAcronymDecoder({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
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
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = question.options[idx] === question.answer;
    setFeedback({ correct: isCorrect });
    if (isCorrect) {
      eng.onCorrect(2);
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
    } else {
      eng.onWrong();
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
    }
  };

  const handleTimeout = () => {
    if (selected !== null) return;
    setSelected(-1);
    setFeedback({ correct: false });
    eng.onWrong();
    setMascotTrigger((t) => t + 1);
    setMascotWrong(true);
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
      setTimeLeft(config.timePerQuestion);
    }
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    eng.reset();
    setPhase('playing');
    setTimeLeft(DIFFICULTY_CONFIG[diff].timePerQuestion);
  };

  const reset = () => {
    setRound(0);
    eng.reset();
    setSelected(null);
    setFeedback(null);
    setTimeLeft(config.timePerQuestion);
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
          title="Tech Acronym Decoder"
          description="Decode tech acronyms by matching them to their full names!"
          icon={<BookOpen className="h-14 w-14 text-info-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
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
            <div className="font-display font-extrabold text-5xl text-info-600 mb-2 animate-pop-in">{eng.score}</div>
            <p className="text-sm text-ink-500 mb-4">
              {eng.score >= 25 ? 'Tech vocabulary expert!' : eng.score >= 16 ? 'Solid tech knowledge!' : 'Keep learning those acronyms!'}
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
        <GameHUD level={eng.level} streak={eng.streak} score={eng.score} timeLeft={timeLeft} />
        <div className="mb-1 text-xs text-ink-400">Acronym {round + 1} / {totalRounds}</div>

        <div key={round} className="rounded-xl bg-info-50 border border-info-200 p-6 mb-3 animate-slide-in-right text-center">
          <p className="text-sm text-ink-500 mb-1">What does</p>
          <p className="font-display font-extrabold text-4xl text-info-600 font-mono">{question?.acronym}</p>
          <p className="text-sm text-ink-500 mt-1">stand for?</p>
        </div>

        <div className="space-y-2.5 mb-4">
          {question?.options.map((option, idx) => {
            const isSelected = selected === idx;
            const showResult = selected !== null;
            const isCorrect = option === question.answer;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={`w-full text-left rounded-lg border p-3.5 text-sm transition-all animate-slide-in-right ${
                  showResult
                    ? isCorrect ? 'border-brand-400 bg-brand-50'
                    : isSelected ? 'border-red-300 bg-red-50 animate-shake'
                    : 'border-ink-200 bg-white opacity-60'
                    : 'border-ink-200 bg-white hover:border-info-300 hover:bg-info-50/50 hover:scale-[1.02] cursor-pointer'
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
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
              {feedback.correct ? <CheckCircle2 className="h-5 w-5 text-brand-600 animate-check-bounce" />
              : <XCircle className="h-5 w-5 text-red-500" />}
              <p className="text-sm text-ink-700">
                {feedback.correct ? 'Correct!' : `The answer was: ${question.answer}`}
              </p>
            </div>
          </div>
        )}

        {selected !== null && (
          <button onClick={next} className="btn-primary w-full animate-glow-pulse">
            {round + 1 >= totalRounds ? 'See Results' : 'Next Acronym'}
          </button>
        )}
      </div>
    </div>
  );
}
