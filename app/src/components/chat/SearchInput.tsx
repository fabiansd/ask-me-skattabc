interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

import { useEffect, useRef } from 'react';

export default function SearchInput({ value, onChange, onKeyDown }: SearchInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      if (value.trim() === '') {
        textareaRef.current.style.height = '3rem';
      } else {
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
      }
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      placeholder="Spør meg om skatt"
      className="textarea textarea-bordered w-full max-w-3xl m-1 resize-none min-h-[3rem] rounded"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      rows={1}
    />
  );
}
