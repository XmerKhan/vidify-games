import { useState, useCallback, useEffect, useRef } from 'react';
import { playSound } from '../lib/sound';
import { triggerFeedback } from '../components/FeedbackOverlay';
import { unlockAchievement, hasAchievement } from '../lib/storage';

interface UseGameEngagementOptions {
  slug: string;
  achievements?: { id: string; title: string; description: string; condition: (state: { score: number; streak: number; level: number; correct: number; wrong: number }) => boolean }[];
}

export function useGameEngagement({ slug, achievements = [] }: UseGameEngagementOptions) {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const unlockedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    achievements.forEach((a) => {
      if (hasAchievement(slug, a.id)) unlockedRef.current.add(a.id);
    });
  }, [slug, achievements]);

  const checkAchievements = useCallback((state: { score: number; streak: number; level: number; correct: number; wrong: number }) => {
    achievements.forEach((a) => {
      if (!unlockedRef.current.has(a.id) && a.condition(state)) {
        unlockedRef.current.add(a.id);
        unlockAchievement(slug, a);
        playSound('achievement');
      }
    });
  }, [slug, achievements]);

  const onCorrect = useCallback((points: number) => {
    setScore((s) => {
      const newScore = s + points;
      setStreak((st) => {
        const newStreak = st + 1;
        setCorrect((c) => {
          const newCorrect = c + 1;
          setLevel((l) => {
            const newLevel = Math.floor(newCorrect / 5) + 1;
            if (newLevel > l) playSound('level-up');
            return newLevel;
          });
          checkAchievements({ score: newScore, streak: newStreak, level: Math.floor(newCorrect / 5) + 1, correct: newCorrect, wrong });
          return newCorrect;
        });
        return newStreak;
      });
      return newScore;
    });
    playSound('correct');
    triggerFeedback('correct');
    setConfettiTrigger((t) => t + 1);
  }, [wrong, checkAchievements]);

  const onWrong = useCallback(() => {
    setStreak(0);
    setWrong((w) => {
      const newWrong = w + 1;
      checkAchievements({ score, streak: 0, level, correct, wrong: newWrong });
      return newWrong;
    });
    playSound('wrong');
    triggerFeedback('wrong');
  }, [score, level, correct, checkAchievements]);

  const reset = useCallback(() => {
    setScore(0);
    setStreak(0);
    setLevel(1);
    setCorrect(0);
    setWrong(0);
  }, []);

  const checkFinalAchievements = useCallback((finalScore: number) => {
    checkAchievements({ score: finalScore, streak, level, correct, wrong });
  }, [checkAchievements, streak, level, correct, wrong]);

  return {
    score,
    streak,
    level,
    correct,
    wrong,
    confettiTrigger,
    setScore,
    setLevel,
    onCorrect,
    onWrong,
    reset,
    checkAchievements: checkFinalAchievements,
    playSound,
  };
}
