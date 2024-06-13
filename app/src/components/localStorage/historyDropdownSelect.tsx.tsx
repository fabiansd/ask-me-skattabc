// historyDropdownSelect.tsx
'use client';
import React from 'react';
import { SearchState } from '../../interface/skattSokInterface';

interface HistoryDropdownProps {
  searchHistory: SearchState[];
  onSelect: (search: SearchState) => void;
}

const HistoryDropdownSelect: React.FC<HistoryDropdownProps> = ({ searchHistory, onSelect }) => {

  const handleItemClick = (selectedSearch: SearchState) => {
    onSelect(selectedSearch);
  };

  const reversedHistory = [...searchHistory].reverse();

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn m-1 px-6 rounded mr-10">
        {"Spørsmål logg"}
      </div>
        <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-64 max-h-200 overflow-y-auto">
          {reversedHistory.length > 0 ? (
            reversedHistory.map((search, index) => (
              <li key={index}>
                <a href="#" onClick={() => handleItemClick(search)}>{`${search.searchInput}`}</a>
              </li>
            ))
          ) : (
            <li><a>Ingen historikk</a></li>
          )}
        </ul>
    </div>
  );
};

export default HistoryDropdownSelect;
