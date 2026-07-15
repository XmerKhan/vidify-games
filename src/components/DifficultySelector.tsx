import { Sprout, Flame, Skull } from 'lucide-react';

export type Difficulty = 'basic' | 'tough' | 'high';

interface DifficultyOption {
  key: Difficulty;
  label: string;
  desc: string;
  icon: React.ReactNode;
  gradient: string;
  ring: string;
  delay: string;
}

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  difficultyDescriptions?: Partial<Record<Difficulty, string>>;
  showChangeOption?: boolean;
  currentDifficulty?: Difficulty;
  onChange?: () => void;
}

const DEFAULT_OPTIONS: DifficultyOption[] = [
  { key: 'basic', label: 'Basic', desc: 'Relaxed pace, forgiving rules', icon: <Sprout className="h-8 w-8" />, gradient: 'from-brand-400 to-brand-600', ring: 'ring-brand-400', delay: '0ms' },
  { key: 'tough', label: 'Tough', desc: 'Faster pace, higher stakes', icon: <Flame className="h-8 w-8" />, gradient: 'from-accent-400 to-accent-600', ring: 'ring-accent-400', delay: '100ms' },
  { key: 'high', label: 'High', desc: 'Expert mode — maximum challenge', icon: <Skull className="h-8 w-8" />, gradient: 'from-red-400 to-red-600', ring: 'ring-red-400', delay: '200ms' },
];

export default function DifficultySelector({
  onSelect,
  title = 'Choose Your Difficulty',
  description,
  icon,
  difficultyDescriptions,
  showChangeOption = false,
  currentDifficulty,
  onChange,
}: DifficultySelectorProps) {
  const options = DEFAULT_OPTIONS.map((opt) => ({
    ...opt,
    desc: difficultyDescriptions?.[opt.key] || opt.desc,
  }));

  return (
    <div className="relative text-center py-4">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      {title && <h3 className="font-display font-bold text-2xl text-ink-900 mb-2">{title}</h3>}
      {description && <p className="text-sm text-ink-500 max-w-sm mx-auto mb-6">{description}</p>}
      <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-5">Choose Your Difficulty</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            style={{ animationDelay: opt.delay }}
            className="group animate-drop-in"
          >
            <div className={`rounded-2xl bg-gradient-to-br ${opt.gradient} p-6 text-white shadow-soft transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:ring-4 ${opt.ring} ${currentDifficulty === opt.key ? 'ring-4 ' + opt.ring : ''}`}>
              <div className="flex justify-center mb-3">
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm transition-transform group-hover:scale-110">
                  {opt.icon}
                </div>
              </div>
              <div className="font-display font-bold text-xl mb-1">{opt.label}</div>
              <div className="text-xs text-white/80">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
      {showChangeOption && onChange && (
        <button onClick={onChange} className="mt-6 text-sm font-semibold text-ink-500 hover:text-brand-700 transition-colors">
          Change Difficulty
        </button>
      )}
    </div>
  );
}
