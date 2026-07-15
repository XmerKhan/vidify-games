import { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Award } from 'lucide-react';
import { getScores, saveScore, recordPlay, getAchievements, type ScoreEntry, type Achievement } from '../lib/storage';

interface LeaderboardProps {
  slug: string;
  score: number;
  onPlayAgain?: () => void;
}

export default function Leaderboard({ slug, score, onPlayAgain }: LeaderboardProps) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<ScoreEntry[]>(() => getScores(slug));
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    recordPlay(slug, score);
    setAchievements(getAchievements(slug));
  }, [slug, score]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveScore(slug, name || 'You', score);
    setScores(updated);
    setSubmitted(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-accent-500" />
        <h3 className="font-display font-bold text-lg text-ink-900">
          {submitted ? 'Leaderboard' : `You scored ${score}!`}
        </h3>
      </div>

      {!submitted && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={12}
            className="input flex-1"
          />
          <button type="submit" className="btn-primary">Save</button>
        </form>
      )}

      {submitted && onPlayAgain && (
        <button onClick={onPlayAgain} className="btn-secondary w-full">
          <RotateCcw className="h-4 w-4" />
          Play Again
        </button>
      )}

      {achievements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-accent-500" />
            <span className="text-xs font-semibold text-ink-600">Achievements ({achievements.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {achievements.map((a) => (
              <span key={a.id} className="badge-accent" title={a.description}>
                {a.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {scores.length > 0 && (
        <div className="space-y-1.5">
          {scores.map((entry, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                entry.score === score && submitted ? 'bg-brand-50 border border-brand-200' : 'bg-ink-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  i === 0 ? 'bg-accent-400 text-white' : i === 1 ? 'bg-ink-300 text-white' : i === 2 ? 'bg-ink-200 text-ink-700' : 'bg-ink-100 text-ink-500'
                }`}>
                  {i + 1}
                </span>
                <span className="font-medium text-ink-800">{entry.name}</span>
              </span>
              <span className="font-bold text-ink-900">{entry.score}</span>
            </div>
          ))}
        </div>
      )}

      {scores.length === 0 && submitted && (
        <p className="text-sm text-ink-400">No scores yet. Be the first!</p>
      )}
    </div>
  );
}
