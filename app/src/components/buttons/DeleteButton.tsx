'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface DeleteButtonProps {
  onDelete: () => void;
}

const HOLD_DURATION_MS = 700;

export default function DeleteButton({ onDelete }: DeleteButtonProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startedAtRef.current = null;
    setProgress(0);
    setIsHolding(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startedAtRef.current = performance.now();
    setIsHolding(true);
    const tick = () => {
      if (startedAtRef.current === null) return;
      const elapsed = performance.now() - startedAtRef.current;
      const next = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(next);
      if (next >= 100) {
        startedAtRef.current = null;
        setProgress(0);
        setIsHolding(false);
        onDelete();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // Show the helper label while hovering on desktop or while actively
  // holding (on any device). This makes the press-and-hold interaction
  // discoverable instead of relying on a native tooltip.
  const showLabel = isHovering || isHolding;

  return (
    <span
      data-testid="delete-conversation"
      role="button"
      tabIndex={-1}
      aria-label="Hold for å slette"
      onClick={e => e.stopPropagation()}
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        cancel();
      }}
      onTouchStart={start}
      onTouchEnd={cancel}
      onTouchCancel={cancel}
      className={`
        absolute top-1/2 right-2 -translate-y-1/2
        inline-flex items-center justify-center
        h-7 w-7 rounded-btn
        transition-all duration-150
        select-none overflow-hidden
        ring-1 ring-inset
        ${
          isHolding
            ? 'text-accent ring-accent/60 bg-accent/10 scale-110 shadow-sm'
            : 'text-base-content/45 ring-transparent hover:text-accent hover:ring-accent/30 hover:bg-accent/5'
        }
        opacity-80 group-hover:opacity-100 group-focus-within:opacity-100
      `}
    >
      {/* Red fill that grows horizontally while holding — the primary
          "timer" affordance. */}
      <span
        className="absolute inset-y-0 left-0 bg-accent/35 pointer-events-none"
        style={{
          width: `${progress}%`,
          transition: isHolding ? 'width 60ms linear' : 'width 180ms ease-out',
        }}
        aria-hidden
      />

      <svg
        className={`relative h-4 w-4 transition-transform duration-150 ${
          isHolding ? 'rotate-[-8deg]' : ''
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
        />
      </svg>

      {/* Inline helper label with a mini progress bar. Appears above the
          button so the user understands this is a press-and-hold action. */}
      {showLabel && (
        <span
          role="tooltip"
          className="
            pointer-events-none absolute bottom-full right-0 mb-1.5
            whitespace-nowrap rounded-md
            bg-neutral text-neutral-content
            px-2 py-1
            text-[10px] font-medium tracking-wide uppercase
            shadow-elevated
            flex items-center gap-2
            animate-fade-in
          "
        >
          <span>{isHolding ? 'Slipper…' : 'Hold for å slette'}</span>
          <span
            className="relative block h-1 w-8 overflow-hidden rounded-full bg-neutral-content/20"
            aria-hidden
          >
            <span
              className="absolute inset-y-0 left-0 bg-accent"
              style={{
                width: `${progress}%`,
                transition: isHolding ? 'width 60ms linear' : 'width 180ms ease-out',
              }}
            />
          </span>
        </span>
      )}
    </span>
  );
}
