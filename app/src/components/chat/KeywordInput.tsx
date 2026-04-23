'use client';
import { useState } from 'react';

import Tooltip from '../common/Tooltip';

interface KeywordInputProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
}

export default function KeywordInput({ keywords, onKeywordsChange }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      onKeywordsChange([...keywords, trimmed]);
      setInputValue('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <Tooltip text="Legg til eksakte nøkkelord, f.eks. § 6-15 eller «fradrag»">
      <div className="flex w-full sm:w-64 items-stretch rounded-btn border border-base-300 bg-base-100 shadow-card overflow-hidden">
        <input
          type="text"
          data-testid="keyword-input"
          placeholder="Nøkkelord"
          className="
            flex-1 h-9 px-3
            bg-transparent text-sm text-base-content placeholder:text-base-content/40
            focus:outline-none
          "
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Legg til nøkkelord"
        />
        <button
          type="button"
          data-testid="keyword-add"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="
            h-9 px-3 inline-flex items-center justify-center
            border-l border-base-300 text-secondary
            hover:bg-secondary/10 active:bg-secondary/20
            disabled:text-base-content/30 disabled:hover:bg-transparent
            transition-colors
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-secondary
          "
          aria-label="Legg til nøkkelord"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
          </svg>
        </button>
      </div>
    </Tooltip>
  );
}
