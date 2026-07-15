import { useEffect, useRef, useCallback } from 'react';

interface UseCanvasGameOptions {
  onTick: (ctx: CanvasRenderingContext2D, dt: number) => void;
  onKeyLeft?: () => void;
  onKeyRight?: () => void;
  onKeyUp?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  width: number;
  height: number;
  running: boolean;
}

export function useCanvasGame({ onTick, onKeyLeft, onKeyRight, onKeyUp, onSwipeLeft, onSwipeRight, onSwipeUp, width, height, running }: UseCanvasGameOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keep latest callbacks in refs so we don't restart the loop on every render
  const tickRef = useRef(onTick);
  const keyLeftRef = useRef(onKeyLeft);
  const keyRightRef = useRef(onKeyRight);
  const keyUpRef = useRef(onKeyUp);
  const swipeLeftRef = useRef(onSwipeLeft);
  const swipeRightRef = useRef(onSwipeRight);
  const swipeUpRef = useRef(onSwipeUp);

  tickRef.current = onTick;
  keyLeftRef.current = onKeyLeft;
  keyRightRef.current = onKeyRight;
  keyUpRef.current = onKeyUp;
  swipeLeftRef.current = onSwipeLeft;
  swipeRightRef.current = onSwipeRight;
  swipeUpRef.current = onSwipeUp;

  const loop = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = time;
    tickRef.current(ctx, Math.min(dt, 0.05));
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (!running) return;
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, loop]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); keyLeftRef.current?.(); }
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); keyRightRef.current?.(); }
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); keyUpRef.current?.(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx > 30 || absDy > 30) {
      if (absDx > absDy) {
        if (dx > 0) swipeRightRef.current?.();
        else swipeLeftRef.current?.();
      } else {
        if (dy < 0) swipeUpRef.current?.();
      }
    }
    touchStartRef.current = null;
  }, []);

  return { canvasRef, handleTouchStart, handleTouchEnd, width, height };
}
