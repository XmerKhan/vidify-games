import { useEffect, useState } from 'react';

type Category = 'finance' | 'tech' | 'educational' | 'kids';

interface GameMascotProps {
  category: Category;
  trigger?: number;
  wrong?: boolean;
  size?: number;
}

function MascotSVG({ category, size }: { category: Category; size: number }) {
  const common = { width: size, height: size, viewBox: '0 0 120 120' };
  switch (category) {
    case 'finance':
      return (
        <svg {...common}>
          <circle cx="60" cy="60" r="50" fill="#10a37f" />
          <circle cx="48" cy="52" r="6" fill="#fff" />
          <circle cx="72" cy="52" r="6" fill="#fff" />
          <circle cx="48" cy="52" r="3" fill="#0d3b2c" />
          <circle cx="72" cy="52" r="3" fill="#0d3b2c" />
          <path d="M42 72 Q60 86 78 72" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="20" cy="30" r="8" fill="#f0a030" />
          <text x="20" y="34" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">$</text>
        </svg>
      );
    case 'tech':
      return (
        <svg {...common}>
          <rect x="15" y="20" width="90" height="80" rx="12" fill="#3b82f6" />
          <rect x="22" y="28" width="76" height="56" rx="4" fill="#1e3a5f" />
          <text x="60" y="62" textAnchor="middle" fontSize="24" fill="#4ade80" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>
          <circle cx="48" cy="92" r="4" fill="#fff" />
          <circle cx="60" cy="92" r="4" fill="#fff" />
          <circle cx="72" cy="92" r="4" fill="#fff" />
        </svg>
      );
    case 'educational':
      return (
        <svg {...common}>
          <rect x="20" y="25" width="35" height="70" rx="4" fill="#a855f7" transform="rotate(-5 37 60)" />
          <rect x="55" y="25" width="35" height="70" rx="4" fill="#c084fc" transform="rotate(5 72 60)" />
          <line x1="37" y1="30" x2="37" y2="90" stroke="#7c3aed" strokeWidth="2" />
          <line x1="72" y1="30" x2="72" y2="90" stroke="#9333ea" strokeWidth="2" />
          <circle cx="60" cy="100" r="6" fill="#fbbf24" />
        </svg>
      );
    case 'kids':
      return (
        <svg {...common}>
          <circle cx="60" cy="60" r="50" fill="#14b8a6" />
          <circle cx="48" cy="52" r="6" fill="#fff" />
          <circle cx="72" cy="52" r="6" fill="#fff" />
          <circle cx="48" cy="52" r="3" fill="#0d3b2c" />
          <circle cx="72" cy="52" r="3" fill="#0d3b2c" />
          <path d="M42 72 Q60 86 78 72" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M30 35 l4 4 4-4" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M82 35 l4 4 4-4" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function GameMascot({ category, trigger = 0, wrong = false, size = 80 }: GameMascotProps) {
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (trigger > 0) {
      setAnimClass(wrong ? 'animate-mascot-wobble' : 'animate-mascot-bounce');
      const t = setTimeout(() => setAnimClass(''), 700);
      return () => clearTimeout(t);
    }
  }, [trigger, wrong]);

  return (
    <div className={`flex justify-center ${animClass}`} aria-hidden="true">
      <MascotSVG category={category} size={size} />
    </div>
  );
}
