'use client';
interface ScrollToBottomButtonProps {
  onClick: () => void;
}

export default function ScrollToBottomButton({ onClick }: ScrollToBottomButtonProps) {
  return (
    <button
      data-testid="scroll-to-bottom"
      onClick={onClick}
      aria-label="Scroll til bunn"
      className="
        fixed bottom-6 right-4 sm:right-8 z-20
        h-10 w-10 rounded-full
        bg-base-100 border border-base-300 text-base-content/70
        shadow-elevated
        hover:text-base-content hover:border-base-content/30
        transition-colors
        animate-fade-in
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary
        inline-flex items-center justify-center
      "
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}
