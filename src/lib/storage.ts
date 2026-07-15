const PREFIX = 'vidifygames:';

export interface ScoreEntry {
  name: string;
  score: number;
  date: number;
}

export interface GameStats {
  bestScore: number;
  timesPlayed: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: number;
}

function scoreKey(slug: string) {
  return `${PREFIX}scores:${slug}`;
}

function statsKey(slug: string) {
  return `${PREFIX}stats:${slug}`;
}

function achievementsKey(slug: string) {
  return `${PREFIX}achievements:${slug}`;
}

function soundKey() {
  return `${PREFIX}sound-enabled`;
}

export function getScores(slug: string): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(scoreKey(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScoreEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch {
    return [];
  }
}

export function saveScore(slug: string, name: string, score: number): ScoreEntry[] {
  try {
    const entry: ScoreEntry = { name: name.slice(0, 12) || 'You', score, date: Date.now() };
    const scores = getScores(slug);
    scores.push(entry);
    const sorted = scores.sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem(scoreKey(slug), JSON.stringify(sorted));
    return sorted;
  } catch {
    return [];
  }
}

export function getHighScore(slug: string): number {
  const scores = getScores(slug);
  return scores.length > 0 ? scores[0].score : 0;
}

export function getGameStats(slug: string): GameStats {
  try {
    const raw = localStorage.getItem(statsKey(slug));
    if (!raw) return { bestScore: 0, timesPlayed: 0 };
    return JSON.parse(raw) as GameStats;
  } catch {
    return { bestScore: 0, timesPlayed: 0 };
  }
}

export function recordPlay(slug: string, score: number): GameStats {
  try {
    const stats = getGameStats(slug);
    stats.timesPlayed += 1;
    if (score > stats.bestScore) stats.bestScore = score;
    localStorage.setItem(statsKey(slug), JSON.stringify(stats));
    return stats;
  } catch {
    return { bestScore: 0, timesPlayed: 0 };
  }
}

export function getAchievements(slug: string): Achievement[] {
  try {
    const raw = localStorage.getItem(achievementsKey(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Achievement[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function unlockAchievement(slug: string, achievement: Omit<Achievement, 'unlockedAt'>): Achievement[] {
  try {
    const existing = getAchievements(slug);
    if (existing.some((a) => a.id === achievement.id)) return existing;
    const updated = [...existing, { ...achievement, unlockedAt: Date.now() }];
    localStorage.setItem(achievementsKey(slug), JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function hasAchievement(slug: string, id: string): boolean {
  return getAchievements(slug).some((a) => a.id === id);
}

export function getSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem(soundKey());
    return raw === null ? true : JSON.parse(raw);
  } catch {
    return true;
  }
}

export function setSoundEnabled(value: boolean): void {
  try {
    localStorage.setItem(soundKey(), JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function getGeneric<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${PREFIX}${name}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setGeneric<T>(name: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}${name}`, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
