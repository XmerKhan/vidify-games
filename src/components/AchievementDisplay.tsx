import { useState, useEffect } from 'react';
import { Award, X } from 'lucide-react';
import { getAchievements, type Achievement } from '../lib/storage';

export function AchievementToast({ slug, trigger }: { slug: string; trigger: number }) {
  const [show, setShow] = useState(false);
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    const achievements = getAchievements(slug);
    if (achievements.length > prevCount && achievements.length > 0) {
      setAchievement(achievements[achievements.length - 1]);
      setShow(true);
      setTimeout(() => setShow(false), 4000);
    }
    setPrevCount(achievements.length);
  }, [trigger, slug, prevCount]);

  if (!show || !achievement) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[70] animate-slide-up">
      <div className="flex items-center gap-3 rounded-xl bg-ink-900 px-4 py-3 shadow-pop border border-ink-700 max-w-xs">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500">
          <Award className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Achievement Unlocked</p>
          <p className="text-sm font-bold text-white truncate">{achievement.title}</p>
          <p className="text-xs text-ink-400 truncate">{achievement.description}</p>
        </div>
        <button onClick={() => setShow(false)} className="shrink-0 text-ink-500 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function AchievementList({ slug }: { slug: string }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setAchievements(getAchievements(slug));
  }, [slug]);

  if (achievements.length === 0) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Award className="h-5 w-5 text-accent-500" />
        <h3 className="font-semibold text-sm text-ink-900">Achievements</h3>
        <span className="text-xs text-ink-400">({achievements.length})</span>
      </div>
      <div className="space-y-2">
        {achievements.map((a) => (
          <div key={a.id} className="flex items-center gap-2.5 rounded-lg bg-accent-50 border border-accent-200 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-500">
              <Award className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink-900 truncate">{a.title}</p>
              <p className="text-xs text-ink-500 truncate">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
