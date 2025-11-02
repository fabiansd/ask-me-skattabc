'use client';

interface CollapseButtonProps {
  onClick: () => void;
  title: string;
  isFloating?: boolean;
}

export default function CollapseButton({
  onClick,
  title,
  isFloating = false,
}: CollapseButtonProps) {
  if (isFloating) {
    return (
      <button
        onClick={onClick}
        className="fixed left-0 z-60 btn btn-ghost btn-sm p-2 bg-base-200 border border-base-300 transition-opacity duration-200"
        style={{ top: 'calc(4rem + 1rem + 0.5rem)' }}
        title={title}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <button onClick={onClick} className="btn btn-ghost btn-sm p-2" title={title}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
