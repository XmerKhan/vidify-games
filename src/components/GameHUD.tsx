import { Zap, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSoundEnabled, setSoundEnabled as storeSoundEnabled } from '../lib/storage';
import { setSoundEnabled as setSoundRuntime, playSound } from '../lib/sound';

interface GameHUDProps {
  level?: number;
  streak: number;
  score?: number;
  timeLeft?: number;
}

export default function GameHUD({ level, streak, score, timeLeft }: GameHUDProps) {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const stored = getSoundEnabled();
    setSoundOn(stored);
    setSoundRuntime(stored);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundRuntime(next);
    storeSoundEnabled(next);
    if (next) playSound('click');
  };

  return (
    <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        {level !== undefined && (
          <span className="badge-ink">Level {level}</span>
        )}
        {streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-bold text-accent-700 animate-streak-pop">
            <Zap className="h-3 w-3" />
            {streak}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {score !== undefined && (
          <span className="text-sm font-bold text-ink-700">Score: {score}</span>
        )}
        {timeLeft !== undefined && (
          <span className={`text-sm font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-ink-600'}`}>{timeLeft}s</span>
        )}
        <button
          onClick={toggleSound}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
          aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
