'use client';
import { useEffect, useRef } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  onKeyDown,
  placeholder = 'Still et spørsmål om norsk skatterett…',
  disabled = false,
}: SearchInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(Math.max(el.scrollHeight, 56), 240) + 'px';
  }, [value]);

  return (
    <div className="relative w-full max-w-3xl">
      <textarea
        ref={textareaRef}
        data-testid="search-input"
        placeholder={placeholder}
        disabled={disabled}
        className="
          w-full resize-none
          rounded-box border border-base-300
          bg-base-100
          px-4 py-3.5 pr-12
          text-base text-base-content placeholder:text-base-content/40
          shadow-card
          transition-all duration-150
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          disabled:bg-base-200 disabled:cursor-not-allowed
        "
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        rows={1}
      />
    </div>
  );
}
