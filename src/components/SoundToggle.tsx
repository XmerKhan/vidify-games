import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getSoundEnabled, setSoundEnabled as storeSoundEnabled } from '../lib/storage';
import { setSoundEnabled as setSoundRuntime, playSound } from '../lib/sound';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = getSoundEnabled();
    setEnabled(stored);
    setSoundRuntime(stored);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundRuntime(next);
    storeSoundEnabled(next);
    if (next) playSound('click');
  };

  return (
    <button
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors"
      aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
      title={enabled ? 'Sound on' : 'Sound off'}
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
