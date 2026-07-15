import { useEffect, useState } from 'react';

interface ParticleBurstProps {
  trigger: number;
  type?: 'coin' | 'sparkle' | 'star';
  color?: string;
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  emoji: string;
}

export default function ParticleBurst({ trigger, type = 'sparkle', color = '#f0a030' }: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const emojis = type === 'coin' ? ['$'] : type === 'star' ? ['★'] : ['✦', '✧', '★'];
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: trigger * 100 + i,
      left: 40 + (Math.random() - 0.5) * 30,
      delay: Math.random() * 0.2,
      duration: 0.6 + Math.random() * 0.4,
      emoji: emojis[i % emojis.length],
    }));
    setParticles(newParticles);
    const t = setTimeout(() => setParticles([]), 1200);
    return () => clearTimeout(t);
  }, [trigger, type]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex justify-center items-center overflow-visible" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-coin-drop"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            color,
            fontSize: type === 'coin' ? '1.5rem' : '1.2rem',
            fontWeight: 'bold',
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
