'use client';
interface CollapseToggleProps {
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export default function CollapseToggle({ isCollapsed, onToggle }: CollapseToggleProps) {
  return (
    <div className="relative my-4">
      <div className="h-px bg-base-300" aria-hidden />
      <button
        type="button"
        data-testid="collapse-toggle"
        aria-label={isCollapsed ? 'Vis søkefelt' : 'Skjul søkefelt'}
        aria-expanded={!isCollapsed}
        onClick={() => onToggle(!isCollapsed)}
        className="
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          inline-flex items-center gap-1.5 h-7 px-3
          rounded-full bg-base-100 border border-base-300
          text-xs text-base-content/60 hover:text-base-content hover:border-base-content/30
          shadow-card transition-colors
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary
        "
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
        <span>{isCollapsed ? 'Vis søk' : 'Skjul søk'}</span>
      </button>
    </div>
  );
}
