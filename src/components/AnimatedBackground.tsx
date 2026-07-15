import { useMemo } from 'react';

type Category = 'finance' | 'tech' | 'educational' | 'kids';

interface AnimatedBackgroundProps {
  category: Category;
}

const SHAPES: Record<Category, { svg: string; color: string; size: number }[]> = {
  finance: [
    { svg: 'coin', color: 'text-brand-300', size: 32 },
    { svg: 'coin', color: 'text-accent-300', size: 24 },
    { svg: 'dollar', color: 'text-brand-200', size: 28 },
    { svg: 'coin', color: 'text-brand-400', size: 20 },
  ],
  tech: [
    { svg: 'bracket', color: 'text-info-300', size: 30 },
    { svg: 'bracket', color: 'text-info-200', size: 24 },
    { svg: 'binary', color: 'text-info-400', size: 22 },
    { svg: 'bracket', color: 'text-info-300', size: 26 },
  ],
  educational: [
    { svg: 'book', color: 'text-purple-300', size: 30 },
    { svg: 'book', color: 'text-purple-200', size: 24 },
    { svg: 'pencil', color: 'text-purple-400', size: 22 },
    { svg: 'book', color: 'text-purple-300', size: 26 },
  ],
  kids: [
    { svg: 'star', color: 'text-teal-300', size: 30 },
    { svg: 'star', color: 'text-accent-300', size: 24 },
    { svg: 'heart', color: 'text-teal-200', size: 22 },
    { svg: 'star', color: 'text-purple-300', size: 26 },
  ],
};

function Shape({ svg, color, size }: { svg: string; color: string; size: number }) {
  const common = { width: size, height: size, className: `${color} opacity-20` };
  switch (svg) {
    case 'coin':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v12M9 9h4a2 2 0 0 1 0 6h-4" />
        </svg>
      );
    case 'dollar':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1v22M17 5H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H7" />
        </svg>
      );
    case 'bracket':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 4H4v16h4M16 4h4v16h-4" />
        </svg>
      );
    case 'binary':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <text x="2" y="16" fontSize="14" fill="currentColor" stroke="none">10</text>
        </svg>
      );
    case 'book':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h7v16H4zM13 4h7v16h-7z" />
        </svg>
      );
    case 'pencil':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 22l4-1 14-14-3-3L3 18l-1 4z" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-7-4.5-9-9c-1.5-3.5 1-7 4.5-7 2 0 3.5 1 4.5 2.5C13 6 14.5 5 16.5 5c3.5 0 6 3.5 4.5 7-2 4.5-9 9-9 9z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AnimatedBackground({ category }: AnimatedBackgroundProps) {
  const items = useMemo(() => {
    const shapes = SHAPES[category] || SHAPES.kids;
    return Array.from({ length: 12 }, (_, i) => {
      const shape = shapes[i % shapes.length];
      return {
        ...shape,
        left: (i * 37 + 5) % 95,
        top: (i * 53 + 8) % 90,
        anim: i % 2 === 0 ? 'animate-float' : 'animate-float-slow',
        delay: `${(i * 0.4) % 3}s`,
      };
    });
  }, [category]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {items.map((item, i) => (
        <div
          key={i}
          className={`absolute ${item.anim}`}
          style={{ left: `${item.left}%`, top: `${item.top}%`, animationDelay: item.delay }}
        >
          <Shape svg={item.svg} color={item.color} size={item.size} />
        </div>
      ))}
    </div>
  );
}
