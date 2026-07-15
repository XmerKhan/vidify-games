import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

interface FeedbackState {
  type: 'correct' | 'wrong';
  key: number;
}

let listener: ((state: FeedbackState) => void) | null = null;

export function triggerFeedback(type: 'correct' | 'wrong') {
  listener?.({ type, key: Date.now() });
}

export default function FeedbackOverlay() {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  useEffect(() => {
    listener = (state) => {
      setFeedback(state);
      setTimeout(() => setFeedback(null), 600);
    };
    return () => { listener = null; };
  }, []);

  if (!feedback) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
      <div
        key={feedback.key}
        className={`flex h-20 w-20 items-center justify-center rounded-full ${
          feedback.type === 'correct'
            ? 'bg-brand-500 animate-check-bounce'
            : 'bg-red-500 animate-shake'
        } shadow-pop`}
      >
        {feedback.type === 'correct' ? (
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        ) : (
          <X className="h-10 w-10 text-white" strokeWidth={3} />
        )}
      </div>
    </div>
  );
}
