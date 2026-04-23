'use client';
import IconButton from '../common/IconButton';

interface CollapseButtonProps {
  onClick: () => void;
  title: string;
  isFloating?: boolean;
}

const ChevronRight = (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronLeft = (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

export default function CollapseButton({
  onClick,
  title,
  isFloating = false,
}: CollapseButtonProps) {
  if (isFloating) {
    return (
      <IconButton
        label={title}
        onClick={onClick}
        variant="subtle"
        className="fixed left-0 top-[calc(4rem+1rem)] z-40 rounded-l-none rounded-r-btn shadow-card"
      >
        {ChevronRight}
      </IconButton>
    );
  }

  return (
    <IconButton label={title} onClick={onClick} variant="ghost">
      {ChevronLeft}
    </IconButton>
  );
}
