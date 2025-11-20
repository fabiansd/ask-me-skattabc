'use client';

interface ScrollToBottomButtonProps {
  onClick: () => void;
}

export default function ScrollToBottomButton({ onClick }: ScrollToBottomButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-base-200 border border-base-300 rounded w-10 h-10 flex items-center justify-center hover:bg-neutral hover:border-neutral-focus transition-colors shadow-lg z-10"
      aria-label="Scroll til bunn"
    >
      <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
