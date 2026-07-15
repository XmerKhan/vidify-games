import type { GameMeta } from '../data/games';

interface ThumbnailProps {
  game: GameMeta;
  className?: string;
}

const colorMap: Record<string, { from: string; to: string; light: string }> = {
  brand: { from: 'from-brand-400', to: 'to-brand-700', light: 'bg-brand-100' },
  info: { from: 'from-info-400', to: 'to-info-700', light: 'bg-info-100' },
  accent: { from: 'from-accent-400', to: 'to-accent-600', light: 'bg-accent-100' },
  purple: { from: 'from-purple-400', to: 'to-purple-700', light: 'bg-purple-100' },
  ink: { from: 'from-ink-600', to: 'to-ink-900', light: 'bg-ink-100' },
  teal: { from: 'from-teal-400', to: 'to-teal-700', light: 'bg-teal-100' },
};

function getThumbnailArt(slug: string): { shapes: React.ReactNode; pattern: string } {
  switch (slug) {
    case 'budget-master':
      return {
        pattern: 'pie',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-90">
            <circle cx="60" cy="60" r="38" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="14" />
            <circle cx="60" cy="60" r="38" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="14" strokeDasharray="60 240" transform="rotate(-90 60 60)" />
            <circle cx="60" cy="60" r="38" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="14" strokeDasharray="40 300" transform="rotate(150 60 60)" />
            <circle cx="60" cy="60" r="38" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="14" strokeDasharray="30 310" transform="rotate(230 60 60)" />
          </svg>
        ),
      };
    case 'stock-market-simulator':
      return {
        pattern: 'chart',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <polyline points="10,80 25,65 35,70 50,45 60,55 75,30 85,40 110,15" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="10,90 25,85 35,88 50,75 60,80 75,60 85,65 110,50" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="45" r="3" fill="rgba(255,255,255,0.8)" />
            <circle cx="75" cy="30" r="3" fill="rgba(255,255,255,0.8)" />
            <circle cx="110" cy="15" r="4" fill="rgba(255,255,255,0.9)" />
          </svg>
        ),
      };
    case 'save-or-spend':
      return {
        pattern: 'scale',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <path d="M 30 90 L 90 90 L 60 30 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinejoin="round" />
            <line x1="60" y1="30" x2="60" y2="90" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <circle cx="60" cy="55" r="4" fill="rgba(255,255,255,0.8)" />
          </svg>
        ),
      };
    case 'code-breaker':
      return {
        pattern: 'pegs',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-85">
            <circle cx="35" cy="40" r="12" fill="rgba(255,255,255,0.7)" />
            <circle cx="65" cy="40" r="12" fill="rgba(255,255,255,0.3)" />
            <circle cx="95" cy="40" r="12" fill="rgba(255,255,255,0.5)" />
            <circle cx="50" cy="70" r="12" fill="rgba(255,255,255,0.4)" />
            <circle cx="80" cy="70" r="12" fill="rgba(255,255,255,0.6)" />
            <circle cx="65" cy="95" r="8" fill="rgba(255,255,255,0.3)" />
          </svg>
        ),
      };
    case 'bug-hunter':
      return {
        pattern: 'bug',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <rect x="30" y="20" width="60" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="30" y="35" width="60" height="8" rx="2" fill="rgba(255,255,255,0.5)" />
            <rect x="30" y="50" width="60" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="30" y="65" width="60" height="8" rx="2" fill="rgba(255,255,255,0.7)" />
            <rect x="30" y="80" width="60" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
            <circle cx="75" cy="69" r="6" fill="rgba(255,255,255,0.9)" />
            <circle cx="75" cy="69" r="3" fill="rgba(239,68,68,0.8)" />
          </svg>
        ),
      };
    case 'binary-blitz':
      return {
        pattern: 'binary',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <text x="20" y="45" fill="rgba(255,255,255,0.7)" fontSize="20" fontFamily="monospace" fontWeight="bold">10</text>
            <text x="55" y="45" fill="rgba(255,255,255,0.4)" fontSize="20" fontFamily="monospace" fontWeight="bold">01</text>
            <text x="20" y="75" fill="rgba(255,255,255,0.4)" fontSize="20" fontFamily="monospace" fontWeight="bold">11</text>
            <text x="55" y="75" fill="rgba(255,255,255,0.7)" fontSize="20" fontFamily="monospace" fontWeight="bold">00</text>
            <text x="20" y="105" fill="rgba(255,255,255,0.3)" fontSize="14" fontFamily="monospace">1011</text>
          </svg>
        ),
      };
    case 'word-chain-challenge':
      return {
        pattern: 'letters',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <rect x="15" y="30" width="25" height="25" rx="4" fill="rgba(255,255,255,0.5)" />
            <text x="22" y="48" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">A</text>
            <rect x="48" y="50" width="25" height="25" rx="4" fill="rgba(255,255,255,0.3)" />
            <text x="55" y="68" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">T</text>
            <rect x="81" y="70" width="25" height="25" rx="4" fill="rgba(255,255,255,0.5)" />
            <text x="88" y="88" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">R</text>
          </svg>
        ),
      };
    case 'memory-grid':
      return {
        pattern: 'grid',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <rect x="20" y="20" width="30" height="30" rx="5" fill="rgba(255,255,255,0.5)" />
            <rect x="70" y="20" width="30" height="30" rx="5" fill="rgba(255,255,255,0.2)" />
            <rect x="20" y="70" width="30" height="30" rx="5" fill="rgba(255,255,255,0.2)" />
            <rect x="70" y="70" width="30" height="30" rx="5" fill="rgba(255,255,255,0.5)" />
            <text x="30" y="40" fill="white" fontSize="14">?</text>
            <text x="80" y="40" fill="rgba(255,255,255,0.4)" fontSize="14">?</text>
          </svg>
        ),
      };
    case 'math-sprint':
      return {
        pattern: 'math',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <text x="20" y="50" fill="rgba(255,255,255,0.7)" fontSize="28" fontWeight="bold" fontFamily="sans-serif">7</text>
            <text x="45" y="50" fill="rgba(255,255,255,0.5)" fontSize="28" fontWeight="bold" fontFamily="sans-serif">×</text>
            <text x="65" y="50" fill="rgba(255,255,255,0.7)" fontSize="28" fontWeight="bold" fontFamily="sans-serif">8</text>
            <text x="30" y="90" fill="rgba(255,255,255,0.3)" fontSize="20" fontWeight="bold" fontFamily="sans-serif">= 56</text>
          </svg>
        ),
      };
    case 'geo-quiz':
      return {
        pattern: 'globe',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <circle cx="60" cy="60" r="35" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <ellipse cx="60" cy="60" rx="35" ry="15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <ellipse cx="60" cy="60" rx="15" ry="35" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <line x1="25" y1="60" x2="95" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <line x1="60" y1="25" x2="60" y2="95" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          </svg>
        ),
      };
    case 'credit-score-climb':
      return {
        pattern: 'bars',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <rect x="20" y="70" width="14" height="30" fill="rgba(255,255,255,0.4)" rx="2" />
            <rect x="42" y="55" width="14" height="45" fill="rgba(255,255,255,0.5)" rx="2" />
            <rect x="64" y="40" width="14" height="60" fill="rgba(255,255,255,0.6)" rx="2" />
            <rect x="86" y="25" width="14" height="75" fill="rgba(255,255,255,0.8)" rx="2" />
          </svg>
        ),
      };
    case 'rent-vs-buy':
      return {
        pattern: 'house',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <path d="M20 60 L60 25 L100 60 L100 100 L20 100 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <rect x="50" y="70" width="20" height="30" fill="rgba(255,255,255,0.4)" rx="2" />
          </svg>
        ),
      };
    case 'retirement-countdown':
      return {
        pattern: 'piggy',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <ellipse cx="60" cy="65" rx="30" ry="22" fill="rgba(255,255,255,0.3)" />
            <rect x="25" y="50" width="70" height="25" rx="4" fill="rgba(255,255,255,0.2)" />
            <circle cx="50" cy="25" r="8" fill="rgba(255,255,255,0.6)" />
          </svg>
        ),
      };
    case 'emergency-fund-builder':
      return {
        pattern: 'shield',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <path d="M60 20 L95 35 L95 65 Q95 85 60 100 Q25 85 25 65 L25 35 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <path d="M45 55 L55 65 L78 42" stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      };
    case 'insurance-matcher':
      return {
        pattern: 'umbrella',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <path d="M20 55 Q60 20 100 55 Z" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <line x1="60" y1="55" x2="60" y2="90" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <path d="M55 90 Q60 100 65 90" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
          </svg>
        ),
      };
    case 'typing-speed':
      return {
        pattern: 'keyboard',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <rect x="10" y="35" width="100" height="50" rx="6" fill="rgba(255,255,255,0.2)" />
            <rect x="18" y="42" width="10" height="10" rx="2" fill="rgba(255,255,255,0.5)" />
            <rect x="32" y="42" width="10" height="10" rx="2" fill="rgba(255,255,255,0.5)" />
            <rect x="46" y="42" width="10" height="10" rx="2" fill="rgba(255,255,255,0.5)" />
            <rect x="60" y="42" width="10" height="10" rx="2" fill="rgba(255,255,255,0.5)" />
            <rect x="74" y="42" width="10" height="10" rx="2" fill="rgba(255,255,255,0.7)" />
            <rect x="40" y="65" width="40" height="8" rx="3" fill="rgba(255,255,255,0.4)" />
          </svg>
        ),
      };
    case 'shortcut-master':
      return {
        pattern: 'keys',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <rect x="20" y="30" width="30" height="30" rx="4" fill="rgba(255,255,255,0.4)" />
            <rect x="55" y="30" width="30" height="30" rx="4" fill="rgba(255,255,255,0.4)" />
            <rect x="55" y="65" width="30" height="30" rx="4" fill="rgba(255,255,255,0.7)" />
          </svg>
        ),
      };
    case 'logic-gate-sim':
      return {
        pattern: 'gate',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <path d="M25 40 L50 40 L65 50 L50 60 L25 60 Z" fill="rgba(255,255,255,0.4)" />
            <circle cx="72" cy="50" r="4" fill="rgba(255,255,255,0.6)" />
            <line x1="15" y1="40" x2="25" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <line x1="15" y1="60" x2="25" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          </svg>
        ),
      };
    case 'website-speed':
      return {
        pattern: 'gauge',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <circle cx="60" cy="60" r="35" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="5" />
            <circle cx="60" cy="60" r="35" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="5" strokeDasharray="80 220" transform="rotate(-90 60 60)" />
            <line x1="60" y1="60" x2="80" y2="40" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ),
      };
    case 'tech-acronym-decoder':
      return {
        pattern: 'acronym',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <text x="60" y="50" textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.7)" fontWeight="bold" fontFamily="monospace">API</text>
            <text x="60" y="75" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace">Application</text>
          </svg>
        ),
      };
    case 'capital-city':
      return {
        pattern: 'buildings',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <rect x="20" y="50" width="20" height="50" fill="rgba(255,255,255,0.4)" />
            <rect x="45" y="35" width="20" height="65" fill="rgba(255,255,255,0.3)" />
            <rect x="70" y="25" width="20" height="75" fill="rgba(255,255,255,0.5)" />
            <path d="M20 50 L30 40 L40 50" fill="rgba(255,255,255,0.5)" />
            <path d="M45 35 L55 25 L65 35" fill="rgba(255,255,255,0.5)" />
            <path d="M70 25 L80 15 L90 25" fill="rgba(255,255,255,0.5)" />
          </svg>
        ),
      };
    case 'science-fact-sprint':
      return {
        pattern: 'flask',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <path d="M30 25 L90 25 L60 75 Z" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="60" cy="55" r="5" fill="rgba(255,255,255,0.7)" />
            <line x1="60" y1="55" x2="60" y2="85" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          </svg>
        ),
      };
    case 'periodic-table-blitz':
      return {
        pattern: 'elements',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <rect x="22" y="22" width="25" height="25" rx="4" fill="rgba(255,255,255,0.4)" />
            <text x="34" y="38" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">H</text>
            <rect x="52" y="22" width="25" height="25" rx="4" fill="rgba(255,255,255,0.4)" />
            <text x="64" y="38" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">He</text>
            <rect x="22" y="52" width="25" height="25" rx="4" fill="rgba(255,255,255,0.5)" />
            <text x="34" y="68" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">Li</text>
            <rect x="52" y="52" width="25" height="25" rx="4" fill="rgba(255,255,255,0.3)" />
            <text x="64" y="68" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">Be</text>
          </svg>
        ),
      };
    case 'history-timeline':
      return {
        pattern: 'timeline',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <line x1="15" y1="60" x2="105" y2="60" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
            <circle cx="25" cy="60" r="6" fill="rgba(255,255,255,0.6)" />
            <circle cx="50" cy="60" r="6" fill="rgba(255,255,255,0.4)" />
            <circle cx="75" cy="60" r="6" fill="rgba(255,255,255,0.6)" />
            <circle cx="95" cy="60" r="6" fill="rgba(255,255,255,0.4)" />
          </svg>
        ),
      };
    case 'world-currency':
      return {
        pattern: 'coins',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <circle cx="60" cy="55" r="35" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <text x="60" y="65" textAnchor="middle" fontSize="36" fill="rgba(255,255,255,0.7)" fontWeight="bold">$</text>
            <text x="30" y="35" textAnchor="middle" fontSize="14" fill="rgba(255,255,255,0.4)" fontWeight="bold">€</text>
            <text x="90" y="35" textAnchor="middle" fontSize="14" fill="rgba(255,255,255,0.4)" fontWeight="bold">¥</text>
          </svg>
        ),
      };
    case 'shape-sorter':
      return {
        pattern: 'shapes',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <circle cx="35" cy="35" r="15" fill="rgba(255,255,255,0.5)" />
            <rect x="65" y="22" width="26" height="26" fill="rgba(255,255,255,0.4)" rx="3" />
            <path d="M35 55 L50 80 L20 80 Z" fill="rgba(255,255,255,0.3)" />
            <path d="M75 55 L88 80 L62 80 Z" fill="rgba(255,255,255,0.5)" />
          </svg>
        ),
      };
    case 'animal-habitat':
      return {
        pattern: 'paw',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <ellipse cx="60" cy="65" rx="25" ry="18" fill="rgba(255,255,255,0.3)" />
            <circle cx="60" cy="40" r="15" fill="rgba(255,255,255,0.4)" />
            <circle cx="53" cy="38" r="3" fill="rgba(255,255,255,0.6)" />
            <circle cx="67" cy="38" r="3" fill="rgba(255,255,255,0.6)" />
          </svg>
        ),
      };
    case 'counting-critters':
      return {
        pattern: 'critters',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <circle cx="30" cy="72" r="10" fill="rgba(255,255,255,0.5)" />
            <circle cx="60" cy="50" r="10" fill="rgba(255,255,255,0.4)" />
            <circle cx="90" cy="72" r="10" fill="rgba(255,255,255,0.5)" />
            <text x="60" y="105" textAnchor="middle" fontSize="14" fill="rgba(255,255,255,0.6)" fontWeight="bold">1 2 3</text>
          </svg>
        ),
      };
    case 'color-mixing':
      return {
        pattern: 'colors',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <circle cx="35" cy="45" r="18" fill="rgba(239,68,68,0.5)" />
            <circle cx="85" cy="45" r="18" fill="rgba(59,130,246,0.5)" />
            <circle cx="60" cy="80" r="18" fill="rgba(168,85,247,0.5)" />
          </svg>
        ),
      };
    case 'pattern-builder':
      return {
        pattern: 'pattern',
        shapes: (
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full opacity-80">
            <circle cx="25" cy="60" r="12" fill="rgba(255,255,255,0.5)" />
            <rect x="45" y="48" width="24" height="24" fill="rgba(255,255,255,0.4)" rx="3" />
            <circle cx="85" cy="60" r="12" fill="rgba(255,255,255,0.5)" />
            <text x="105" y="65" textAnchor="middle" fontSize="16" fill="rgba(255,255,255,0.4)" fontWeight="bold">?</text>
          </svg>
        ),
      };
    default:
      return { pattern: 'default', shapes: null };
  }
}

export default function GameThumbnail({ game, className = '' }: ThumbnailProps) {
  const colors = colorMap[game.accent] || colorMap.ink;
  const { shapes } = getThumbnailArt(game.slug);
  const Icon = game.icon;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colors.from} ${colors.to} ${className}`}>
      {/* Decorative shapes */}
      <div className="absolute inset-0">{shapes}</div>
      {/* Icon badge */}
      <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
        <Icon className="h-5 w-5 text-white" />
      </div>
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />
    </div>
  );
}
