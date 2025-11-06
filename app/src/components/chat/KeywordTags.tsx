interface KeywordTagsProps {
  keywords: string[];
  onRemoveKeyword: (index: number) => void;
}

export default function KeywordTags({ keywords, onRemoveKeyword }: KeywordTagsProps) {
  if (keywords.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {keywords.map((keyword, index) => (
        <button
          key={index}
          type="button"
          className="badge bg-sky-600 gap-2 hover:bg-sky-500 hover:cursor-pointer transition-colors duration-200"
          onClick={() => onRemoveKeyword(index)}
        >
          <span className="font-bold" style={{ color: 'rgb(31 41 55)' }}>
            {keyword}
          </span>
          <span className="text-xs" style={{ color: 'rgb(31 41 55)' }}>
            ✕
          </span>
        </button>
      ))}
    </div>
  );
}
