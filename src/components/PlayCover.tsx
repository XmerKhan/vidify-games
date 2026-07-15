import { useState } from 'react';
import { Play } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import type { Category } from '../data/games';

interface PlayCoverProps {
  title: string;
  tagline: string;
  category: Category;
  slug: string;
  onPlay: () => void;
}

function CoverMascot({ slug }: { slug: string; category: Category }) {
  const common = { width: 120, height: 120, viewBox: '0 0 120 120' };
  const mascots: Record<string, React.ReactElement> = {
    'budget-master': (
      <svg {...common}>
        <circle cx="60" cy="55" r="42" fill="#10a37f" />
        <circle cx="48" cy="48" r="7" fill="#fff" /><circle cx="72" cy="48" r="7" fill="#fff" />
        <circle cx="48" cy="48" r="3.5" fill="#0d3b2c" /><circle cx="72" cy="48" r="3.5" fill="#0d3b2c" />
        <path d="M42 68 Q60 82 78 68" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="18" cy="25" r="10" fill="#f0a030" />
        <text x="18" y="30" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">$</text>
        <rect x="50" y="95" width="20" height="8" rx="4" fill="#0d3b2c" />
      </svg>
    ),
    'stock-market-simulator': (
      <svg {...common}>
        <circle cx="60" cy="55" r="42" fill="#10a37f" />
        <circle cx="48" cy="48" r="7" fill="#fff" /><circle cx="72" cy="48" r="7" fill="#fff" />
        <circle cx="48" cy="48" r="3.5" fill="#0d3b2c" /><circle cx="72" cy="48" r="3.5" fill="#0d3b2c" />
        <path d="M42 68 Q60 76 78 68" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M25 35 L35 25 L45 30 L55 18" stroke="#fbbf24" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="55" cy="18" r="4" fill="#fbbf24" />
      </svg>
    ),
    'save-or-spend': (
      <svg {...common}>
        <circle cx="60" cy="55" r="42" fill="#10a37f" />
        <circle cx="48" cy="48" r="7" fill="#fff" /><circle cx="72" cy="48" r="7" fill="#fff" />
        <circle cx="48" cy="48" r="3.5" fill="#0d3b2c" /><circle cx="72" cy="48" r="3.5" fill="#0d3b2c" />
        <path d="M42 68 Q60 82 78 68" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M30 25 L90 25 M45 25 L45 15 M75 25 L75 15" stroke="#f0a030" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="60" cy="25" r="5" fill="#f0a030" />
      </svg>
    ),
    'code-breaker': (
      <svg {...common}>
        <rect x="18" y="15" width="84" height="90" rx="14" fill="#3b82f6" />
        <rect x="25" y="22" width="70" height="65" rx="6" fill="#1e3a5f" />
        <circle cx="42" cy="45" r="8" fill="#ef4444" /><circle cx="60" cy="45" r="8" fill="#fbbf24" />
        <circle cx="78" cy="45" r="8" fill="#10a37f" /><circle cx="51" cy="65" r="8" fill="#a855f7" />
        <circle cx="69" cy="65" r="8" fill="#3b82f6" />
        <circle cx="42" cy="88" r="3" fill="#fff" /><circle cx="60" cy="88" r="3" fill="#fff" /><circle cx="78" cy="88" r="3" fill="#fff" />
      </svg>
    ),
    'bug-hunter': (
      <svg {...common}>
        <rect x="15" y="12" width="90" height="96" rx="12" fill="#1e3a5f" />
        <rect x="22" y="20" width="76" height="80" rx="4" fill="#0f1f3a" />
        <text x="60" y="42" textAnchor="middle" fontSize="11" fill="#4ade80" fontFamily="monospace">function</text>
        <text x="60" y="58" textAnchor="middle" fontSize="11" fill="#4ade80" fontFamily="monospace">  return x</text>
        <text x="60" y="74" textAnchor="middle" fontSize="11" fill="#ef4444" fontFamily="monospace">  - y; //?</text>
        <circle cx="90" cy="74" r="8" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-pulse" />
        <circle cx="30" cy="92" r="3" fill="#4ade80" /><circle cx="42" cy="92" r="3" fill="#4ade80" /><circle cx="54" cy="92" r="3" fill="#4ade80" />
      </svg>
    ),
    'binary-blitz': (
      <svg {...common}>
        <rect x="15" y="15" width="90" height="90" rx="14" fill="#3b82f6" />
        <rect x="22" y="22" width="76" height="76" rx="4" fill="#1e3a5f" />
        <text x="35" y="45" textAnchor="middle" fontSize="16" fill="#4ade80" fontFamily="monospace" fontWeight="bold">1</text>
        <text x="60" y="45" textAnchor="middle" fontSize="16" fill="#4ade80" fontFamily="monospace" fontWeight="bold">0</text>
        <text x="85" y="45" textAnchor="middle" fontSize="16" fill="#4ade80" fontFamily="monospace" fontWeight="bold">1</text>
        <text x="35" y="68" textAnchor="middle" fontSize="16" fill="#4ade80" fontFamily="monospace" fontWeight="bold">1</text>
        <text x="60" y="68" textAnchor="middle" fontSize="16" fill="#4ade80" fontFamily="monospace" fontWeight="bold">1</text>
        <text x="85" y="68" textAnchor="middle" fontSize="16" fill="#4ade80" fontFamily="monospace" fontWeight="bold">0</text>
        <rect x="40" y="78" width="40" height="10" rx="5" fill="#fbbf24" />
        <circle cx="60" cy="83" r="3" fill="#fff" />
      </svg>
    ),
    'word-chain-challenge': (
      <svg {...common}>
        <circle cx="60" cy="55" r="42" fill="#a855f7" />
        <circle cx="48" cy="48" r="7" fill="#fff" /><circle cx="72" cy="48" r="7" fill="#fff" />
        <circle cx="48" cy="48" r="3.5" fill="#6b21a8" /><circle cx="72" cy="48" r="3.5" fill="#6b21a8" />
        <path d="M42 68 Q60 82 78 68" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        <text x="30" y="30" textAnchor="middle" fontSize="14" fill="#fbbf24" fontWeight="bold" fontFamily="monospace">A</text>
        <text x="60" y="22" textAnchor="middle" fontSize="14" fill="#fbbf24" fontWeight="bold" fontFamily="monospace">B</text>
        <text x="90" y="30" textAnchor="middle" fontSize="14" fill="#fbbf24" fontWeight="bold" fontFamily="monospace">C</text>
      </svg>
    ),
    'memory-grid': (
      <svg {...common}>
        <rect x="20" y="18" width="35" height="40" rx="6" fill="#a855f7" />
        <rect x="65" y="18" width="35" height="40" rx="6" fill="#c084fc" />
        <rect x="20" y="68" width="35" height="40" rx="6" fill="#c084fc" />
        <rect x="65" y="68" width="35" height="40" rx="6" fill="#a855f7" />
        <text x="37" y="45" textAnchor="middle" fontSize="20">🇯🇵</text>
        <text x="82" y="45" textAnchor="middle" fontSize="20">❓</text>
        <text x="37" y="95" textAnchor="middle" fontSize="20">❓</text>
        <text x="82" y="95" textAnchor="middle" fontSize="20">🇯🇵</text>
      </svg>
    ),
    'math-sprint': (
      <svg {...common}>
        <circle cx="60" cy="55" r="42" fill="#f97316" />
        <circle cx="48" cy="48" r="7" fill="#fff" /><circle cx="72" cy="48" r="7" fill="#fff" />
        <circle cx="48" cy="48" r="3.5" fill="#9a3412" /><circle cx="72" cy="48" r="3.5" fill="#9a3412" />
        <path d="M42 68 Q60 82 78 68" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        <text x="25" y="28" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">+</text>
        <text x="95" y="28" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">×</text>
        <text x="25" y="95" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">÷</text>
        <text x="95" y="95" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">−</text>
      </svg>
    ),
    'geo-quiz': (
      <svg {...common}>
        <circle cx="60" cy="55" r="42" fill="#a855f7" />
        <circle cx="48" cy="48" r="7" fill="#fff" /><circle cx="72" cy="48" r="7" fill="#fff" />
        <circle cx="48" cy="48" r="3.5" fill="#6b21a8" /><circle cx="72" cy="48" r="3.5" fill="#6b21a8" />
        <path d="M42 68 Q60 82 78 68" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="60" cy="25" r="8" fill="#3b82f6" />
        <path d="M52 25 Q60 18 68 25" stroke="#10a37f" strokeWidth="2" fill="none" />
        <path d="M52 25 Q60 32 68 25" stroke="#10a37f" strokeWidth="2" fill="none" />
      </svg>
    ),
    'credit-score-climb': (
      <svg {...common}>
        <rect x="15" y="15" width="90" height="90" rx="14" fill="#0d9488" />
        <rect x="22" y="22" width="76" height="76" rx="6" fill="#115e59" />
        <rect x="30" y="70" width="12" height="20" fill="#fbbf24" rx="2" />
        <rect x="48" y="55" width="12" height="35" fill="#fbbf24" rx="2" />
        <rect x="66" y="40" width="12" height="50" fill="#fbbf24" rx="2" />
        <rect x="84" y="30" width="12" height="60" fill="#10a37f" rx="2" />
        <path d="M30 65 L48 50 L66 35 L84 25" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
    'rent-vs-buy': (
      <svg {...common}>
        <path d="M20 60 L60 25 L100 60 L100 100 L20 100 Z" fill="#0d9488" />
        <rect x="50" y="70" width="20" height="30" fill="#115e59" rx="2" />
        <rect x="30" y="65" width="12" height="12" fill="#fbbf24" rx="2" />
        <rect x="78" y="65" width="12" height="12" fill="#fbbf24" rx="2" />
        <path d="M60 25 L60 15" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <path d="M55 18 L60 12 L65 18" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
    'retirement-countdown': (
      <svg {...common}>
        <ellipse cx="60" cy="70" rx="35" ry="25" fill="#0d9488" />
        <rect x="25" y="50" width="70" height="25" rx="4" fill="#115e59" />
        <rect x="40" y="35" width="40" height="20" rx="4" fill="#0d9488" />
        <circle cx="50" cy="25" r="8" fill="#fbbf24" />
        <text x="50" y="29" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">$</text>
        <rect x="55" y="45" width="3" height="10" fill="#fbbf24" />
      </svg>
    ),
    'emergency-fund-builder': (
      <svg {...common}>
        <path d="M60 20 L95 35 L95 65 Q95 85 60 100 Q25 85 25 65 L25 35 Z" fill="#0d9488" />
        <path d="M60 35 L60 85 M45 55 L60 45 L75 55" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="60" cy="55" r="5" fill="#fbbf24" />
      </svg>
    ),
    'insurance-matcher': (
      <svg {...common}>
        <path d="M60 20 L95 35 L95 60 Q95 85 60 100 Q25 85 25 60 L25 35 Z" fill="#0d9488" />
        <path d="M60 20 L95 35 L95 60 Q95 85 60 100 Q25 85 25 60 L25 35 Z" fill="none" stroke="#115e59" strokeWidth="2" />
        <path d="M45 55 L55 65 L78 42" stroke="#fbbf24" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'typing-speed': (
      <svg {...common}>
        <rect x="10" y="25" width="100" height="70" rx="8" fill="#3b82f6" />
        <rect x="18" y="33" width="84" height="40" rx="4" fill="#1e3a5f" />
        <rect x="22" y="38" width="8" height="8" rx="2" fill="#4ade80" />
        <rect x="34" y="38" width="8" height="8" rx="2" fill="#4ade80" />
        <rect x="46" y="38" width="8" height="8" rx="2" fill="#4ade80" />
        <rect x="58" y="38" width="8" height="8" rx="2" fill="#4ade80" />
        <rect x="70" y="38" width="8" height="8" rx="2" fill="#4ade80" />
        <rect x="82" y="38" width="8" height="8" rx="2" fill="#fbbf24" />
        <rect x="22" y="50" width="8" height="8" rx="2" fill="#4ade80" />
        <rect x="34" y="50" width="8" height="8" rx="2" fill="#4ade80" />
        <rect x="46" y="50" width="8" height="8" rx="2" fill="#4ade80" />
        <rect x="58" y="50" width="8" height="8" rx="2" fill="#4ade80" />
        <rect x="70" y="50" width="8" height="8" rx="2" fill="#4ade80" />
        <rect x="82" y="50" width="8" height="8" rx="2" fill="#4ade80" />
        <rect x="40" y="78" width="40" height="6" rx="3" fill="#fbbf24" />
      </svg>
    ),
    'shortcut-master': (
      <svg {...common}>
        <rect x="15" y="20" width="90" height="80" rx="10" fill="#3b82f6" />
        <rect x="25" y="30" width="25" height="25" rx="4" fill="#1e3a5f" />
        <rect x="55" y="30" width="25" height="25" rx="4" fill="#1e3a5f" />
        <rect x="85" y="30" width="15" height="25" rx="4" fill="#1e3a5f" />
        <rect x="25" y="60" width="25" height="25" rx="4" fill="#1e3a5f" />
        <rect x="55" y="60" width="25" height="25" rx="4" fill="#fbbf24" />
        <rect x="85" y="60" width="15" height="25" rx="4" fill="#1e3a5f" />
        <text x="67" y="77" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">Ctrl</text>
      </svg>
    ),
    'logic-gate-sim': (
      <svg {...common}>
        <rect x="15" y="15" width="90" height="90" rx="10" fill="#3b82f6" />
        <path d="M25 40 L50 40 L65 50 L50 60 L25 60 Z" fill="#fbbf24" />
        <circle cx="72" cy="50" r="4" fill="#fbbf24" />
        <line x1="15" y1="40" x2="25" y2="40" stroke="#4ade80" strokeWidth="2" />
        <line x1="15" y1="60" x2="25" y2="60" stroke="#4ade80" strokeWidth="2" />
        <line x1="76" y1="50" x2="95" y2="50" stroke="#4ade80" strokeWidth="2" />
        <text x="40" y="80" textAnchor="middle" fontSize="10" fill="#fff" fontFamily="monospace">AND</text>
      </svg>
    ),
    'website-speed': (
      <svg {...common}>
        <circle cx="60" cy="60" r="40" fill="none" stroke="#3b82f6" strokeWidth="6" />
        <circle cx="60" cy="60" r="40" fill="none" stroke="#fbbf24" strokeWidth="6" strokeDasharray="120 250" transform="rotate(-90 60 60)" />
        <path d="M60 60 L80 40" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="60" r="5" fill="#4ade80" />
        <text x="60" y="100" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">2s</text>
      </svg>
    ),
    'tech-acronym-decoder': (
      <svg {...common}>
        <rect x="15" y="20" width="90" height="80" rx="10" fill="#3b82f6" />
        <text x="60" y="50" textAnchor="middle" fontSize="18" fill="#fbbf24" fontWeight="bold" fontFamily="monospace">API</text>
        <text x="60" y="75" textAnchor="middle" fontSize="9" fill="#4ade80" fontFamily="monospace">Application</text>
        <text x="60" y="87" textAnchor="middle" fontSize="9" fill="#4ade80" fontFamily="monospace">Programming</text>
      </svg>
    ),
    'capital-city': (
      <svg {...common}>
        <rect x="20" y="50" width="20" height="50" fill="#a855f7" />
        <rect x="45" y="35" width="20" height="65" fill="#c084fc" />
        <rect x="70" y="25" width="20" height="75" fill="#a855f7" />
        <path d="M20 50 L30 40 L40 50" fill="#fbbf24" />
        <path d="M45 35 L55 25 L65 35" fill="#fbbf24" />
        <path d="M70 25 L80 15 L90 25" fill="#fbbf24" />
        <rect x="15" y="95" width="80" height="5" fill="#6b21a8" />
      </svg>
    ),
    'science-fact-sprint': (
      <svg {...common}>
        <path d="M30 25 L90 25 L60 75 Z" fill="none" stroke="#a855f7" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="60" cy="55" r="6" fill="#fbbf24" />
        <line x1="60" y1="55" x2="60" y2="85" stroke="#a855f7" strokeWidth="3" />
        <path d="M50 90 L70 90" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="30" r="3" fill="#c084fc" />
        <circle cx="80" cy="30" r="3" fill="#c084fc" />
      </svg>
    ),
    'periodic-table-blitz': (
      <svg {...common}>
        <rect x="15" y="15" width="90" height="90" rx="8" fill="#a855f7" />
        <rect x="22" y="22" width="25" height="25" rx="4" fill="#c084fc" />
        <text x="34" y="38" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">H</text>
        <rect x="52" y="22" width="25" height="25" rx="4" fill="#c084fc" />
        <text x="64" y="38" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">He</text>
        <rect x="82" y="22" width="18" height="25" rx="4" fill="#6b21a8" />
        <rect x="22" y="52" width="25" height="25" rx="4" fill="#c084fc" />
        <text x="34" y="68" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">Li</text>
        <rect x="52" y="52" width="25" height="25" rx="4" fill="#fbbf24" />
        <text x="64" y="68" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">Be</text>
        <rect x="82" y="52" width="18" height="25" rx="4" fill="#6b21a8" />
        <rect x="22" y="82" width="76" height="18" rx="4" fill="#6b21a8" />
      </svg>
    ),
    'history-timeline': (
      <svg {...common}>
        <line x1="15" y1="60" x2="105" y2="60" stroke="#a855f7" strokeWidth="3" />
        <circle cx="25" cy="60" r="6" fill="#fbbf24" />
        <circle cx="50" cy="60" r="6" fill="#c084fc" />
        <circle cx="75" cy="60" r="6" fill="#fbbf24" />
        <circle cx="95" cy="60" r="6" fill="#c084fc" />
        <rect x="18" y="25" width="14" height="25" fill="#a855f7" rx="2" />
        <rect x="43" y="20" width="14" height="30" fill="#a855f7" rx="2" />
        <rect x="68" y="30" width="14" height="20" fill="#a855f7" rx="2" />
        <rect x="88" y="22" width="14" height="28" fill="#a855f7" rx="2" />
      </svg>
    ),
    'world-currency': (
      <svg {...common}>
        <circle cx="60" cy="55" r="42" fill="#a855f7" />
        <text x="60" y="65" textAnchor="middle" fontSize="36" fill="#fbbf24" fontWeight="bold">$</text>
        <text x="30" y="35" textAnchor="middle" fontSize="14" fill="#fbbf24" fontWeight="bold">€</text>
        <text x="90" y="35" textAnchor="middle" fontSize="14" fill="#fbbf24" fontWeight="bold">¥</text>
        <text x="30" y="90" textAnchor="middle" fontSize="14" fill="#fbbf24" fontWeight="bold">£</text>
        <text x="90" y="90" textAnchor="middle" fontSize="14" fill="#fbbf24" fontWeight="bold">₹</text>
      </svg>
    ),
    'shape-sorter': (
      <svg {...common}>
        <circle cx="35" cy="35" r="15" fill="#14b8a6" />
        <rect x="65" y="22" width="26" height="26" fill="#fbbf24" rx="3" />
        <path d="M35 55 L50 80 L20 80 Z" fill="#f97316" />
        <path d="M75 55 L88 80 L62 80 Z" fill="#a855f7" />
      </svg>
    ),
    'animal-habitat': (
      <svg {...common}>
        <ellipse cx="60" cy="65" rx="30" ry="22" fill="#14b8a6" />
        <circle cx="60" cy="40" r="18" fill="#14b8a6" />
        <circle cx="53" cy="38" r="4" fill="#fff" /><circle cx="67" cy="38" r="4" fill="#fff" />
        <circle cx="53" cy="38" r="2" fill="#0f766e" /><circle cx="67" cy="38" r="2" fill="#0f766e" />
        <path d="M50 48 Q60 54 70 48" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="80" cy="30" r="8" fill="#fbbf24" />
        <path d="M75 25 L85 25 M80 20 L80 30" stroke="#fbbf24" strokeWidth="2" />
      </svg>
    ),
    'counting-critters': (
      <svg {...common}>
        <ellipse cx="30" cy="80" rx="12" ry="10" fill="#14b8a6" />
        <circle cx="30" cy="72" r="6" fill="#14b8a6" />
        <ellipse cx="60" cy="50" rx="12" ry="10" fill="#fbbf24" />
        <circle cx="60" cy="42" r="6" fill="#fbbf24" />
        <ellipse cx="90" cy="80" rx="12" ry="10" fill="#f97316" />
        <circle cx="90" cy="72" r="6" fill="#f97316" />
        <text x="60" y="105" textAnchor="middle" fontSize="14" fill="#0f766e" fontWeight="bold">1 2 3</text>
      </svg>
    ),
    'color-mixing': (
      <svg {...common}>
        <circle cx="35" cy="45" r="18" fill="#ef4444" opacity="0.7" />
        <circle cx="85" cy="45" r="18" fill="#3b82f6" opacity="0.7" />
        <circle cx="60" cy="80" r="18" fill="#a855f7" opacity="0.7" />
      </svg>
    ),
    'pattern-builder': (
      <svg {...common}>
        <circle cx="25" cy="60" r="12" fill="#14b8a6" />
        <rect x="45" y="48" width="24" height="24" fill="#fbbf24" rx="3" />
        <circle cx="85" cy="60" r="12" fill="#14b8a6" />
        <rect x="100" y="48" width="24" height="24" fill="#fbbf24" rx="3" transform="translate(-10 0)" opacity="0.3" />
        <text x="105" y="62" textAnchor="middle" fontSize="16" fill="#0f766e" fontWeight="bold">?</text>
      </svg>
    ),
  };
  return mascots[slug] || (
    <svg {...common}>
      <circle cx="60" cy="55" r="42" fill="#6366f1" />
      <circle cx="48" cy="48" r="7" fill="#fff" /><circle cx="72" cy="48" r="7" fill="#fff" />
      <path d="M42 68 Q60 82 78 68" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function PlayCover({ title, tagline, category, slug, onPlay }: PlayCoverProps) {
  const [fading, setFading] = useState(false);

  const handlePlay = () => {
    setFading(true);
    setTimeout(onPlay, 350);
  };

  return (
    <div className={`relative ${fading ? 'animate-cover-fade-out' : 'animate-fade-in'}`}>
      <AnimatedBackground category={category} />
      <div className="relative flex flex-col items-center justify-center py-8 text-center">
        <div className="animate-mascot-idle mb-4">
          <CoverMascot slug={slug} category={category} />
        </div>
        <h2 className="font-display font-extrabold text-3xl text-ink-900 mb-2">{title}</h2>
        <p className="text-sm text-ink-500 max-w-sm mb-6">{tagline}</p>
        <button
          onClick={handlePlay}
          className="btn bg-brand-600 text-white px-8 py-3.5 text-base font-bold rounded-xl animate-play-glow hover:scale-105 transition-transform"
        >
          <Play className="h-5 w-5 fill-white" />
          Play
        </button>
      </div>
    </div>
  );
}
