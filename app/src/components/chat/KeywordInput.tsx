import { useState } from 'react';

import Tooltip from '../common/Tooltip';

interface KeywordInputProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
}

export default function KeywordInput({ keywords, onKeywordsChange }: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddKeyword = () => {
    if (inputValue.trim() && !keywords.includes(inputValue.trim())) {
      onKeywordsChange([...keywords, inputValue.trim()]);
      setInputValue('');
    }
  };

  return (
    <Tooltip text="Søket leter etter eksakte matcher på nøkkelordene">
      <div className="flex w-64 m-1">
        <input
          type="text"
          placeholder="Skriv nøkkelord og trykk på +"
          className="input input-bordered input-sm w-full rounded-l rounded-r-none"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        <button
          type="button"
          onClick={handleAddKeyword}
          className="btn btn-sm bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-r rounded-l-none"
        >
          +
        </button>
      </div>
    </Tooltip>
  );
}
