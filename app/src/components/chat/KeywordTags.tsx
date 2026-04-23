interface KeywordTagsProps {
  keywords: string[];
  onRemoveKeyword: (index: number) => void;
}

export default function KeywordTags({ keywords, onRemoveKeyword }: KeywordTagsProps) {
  if (keywords.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
      {keywords.map((keyword, index) => (
        <button
          key={`${keyword}-${index}`}
          type="button"
          data-testid="keyword-tag"
          onClick={() => onRemoveKeyword(index)}
          aria-label={`Fjern nøkkelord ${keyword}`}
          className="
            group inline-flex items-center gap-1.5
            h-7 pl-2.5 pr-2
            rounded-full
            bg-secondary/15 text-secondary-content
            border border-secondary/30
            text-xs font-medium
            transition-colors duration-150
            hover:bg-secondary/25 hover:border-secondary/50
          "
        >
          <span className="text-base-content/85">{keyword}</span>
          <svg
            className="h-3 w-3 text-base-content/50 group-hover:text-accent transition-colors"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ))}
    </div>
  );
}
