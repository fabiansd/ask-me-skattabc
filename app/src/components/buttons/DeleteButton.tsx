'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface DeleteButtonProps {
  onDelete: () => void;
}

const HOLD_DURATION_MS = 600;

export default function DeleteButton({ onDelete }: DeleteButtonProps) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startedAtRef.current = null;
    setProgress(0);
  }, []);

  useEffect(() => cancel, [cancel]);

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startedAtRef.current = performance.now();
    const tick = () => {
      if (startedAtRef.current === null) return;
      const elapsed = performance.now() - startedAtRef.current;
      const next = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(next);
      if (next >= 100) {
        startedAtRef.current = null;
        setProgress(0);
        onDelete();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <span
      data-testid="delete-conversation"
      role="button"
      tabIndex={-1}
      aria-label="Hold for å slette"
      title="Hold knappen inne for å slette"
      onClick={e => e.stopPropagation()}
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onTouchStart={start}
      onTouchEnd={cancel}
      onTouchCancel={cancel}
      className="
        absolute top-1/2 right-2 -translate-y-1/2
        inline-flex items-center justify-center
        h-7 w-7 rounded-btn
        text-base-content/50
        opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
        md:opacity-0 opacity-100
        hover:text-accent hover:bg-accent/10
        transition-[color,opacity,background-color] duration-150
        overflow-hidden
      "
    >
      <span
        className="absolute inset-0 bg-accent/20 transition-[width] duration-75"
        style={{ width: `${progress}%` }}
        aria-hidden
      />
      <svg className="relative h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
        />
      </svg>
    </span>
  );
}
