type SoundType = 'correct' | 'wrong' | 'level-up' | 'click' | 'game-over' | 'achievement';

let audioCtx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export function isSoundEnabled() {
  return enabled;
}

export function playSound(type: SoundType) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  const tone = (freq: number, start: number, duration: number, volume = 0.15, type: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(volume, now + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + duration);
  };

  switch (type) {
    case 'correct':
      tone(523.25, 0, 0.1, 0.12, 'sine');
      tone(659.25, 0.08, 0.12, 0.12, 'sine');
      tone(783.99, 0.16, 0.15, 0.12, 'sine');
      break;
    case 'wrong':
      tone(220, 0, 0.12, 0.1, 'sawtooth');
      tone(180, 0.1, 0.15, 0.1, 'sawtooth');
      break;
    case 'level-up':
      tone(523.25, 0, 0.08, 0.12, 'square');
      tone(659.25, 0.06, 0.08, 0.12, 'square');
      tone(783.99, 0.12, 0.08, 0.12, 'square');
      tone(1046.5, 0.18, 0.2, 0.12, 'square');
      break;
    case 'click':
      tone(800, 0, 0.03, 0.05, 'sine');
      break;
    case 'game-over':
      tone(440, 0, 0.15, 0.1, 'sine');
      tone(330, 0.12, 0.15, 0.1, 'sine');
      tone(220, 0.24, 0.3, 0.1, 'sine');
      break;
    case 'achievement':
      tone(659.25, 0, 0.1, 0.12, 'sine');
      tone(880, 0.08, 0.1, 0.12, 'sine');
      tone(1108.73, 0.16, 0.15, 0.12, 'sine');
      tone(1318.51, 0.24, 0.25, 0.12, 'sine');
      break;
  }
}
