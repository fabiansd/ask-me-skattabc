// historyDropdownSelect.tsx
"use client";
import React from "react";
import { SearchState } from "../../interface/skattSokInterface";
import { Icons } from "../icons/iconsWrapper";

interface HistoryDropdownProps {
  searchHistory: SearchState[];
  onSelect: (search: SearchState) => void;
}

const HistoryDropdownSelect: React.FC<HistoryDropdownProps> = ({
  searchHistory,
  onSelect,
}) => {
  const handleItemClick = (selectedSearch: SearchState) => {
    onSelect(selectedSearch);
  };

  const reversedHistory = [...searchHistory].reverse();

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn m-1 px-6 rounded mr-10">
        {"Logg"}
      </div>
      <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-64 max-h-200 overflow-y-auto">
        {reversedHistory.length > 0 ? (
          reversedHistory.map((search, index) => (
            <li key={index}>
              <a
                href="#"
                onClick={() => handleItemClick(search)}
                className="flex justify-between items-center w-full"
              >
                <span>{search.searchInput}</span>
                <span>
                  {search.chatFeedback === "thumbsUp" && (
                    <Icons.ThumbsUp className="w-4 h-4 text-green-600" />
                  )}
                  {search.chatFeedback === "thumbsDown" && (
                    <Icons.ThumbsDown className="w-4 h-4 text-red-600" />
                  )}
                </span>
              </a>
            </li>
          ))
        ) : (
          <li>
            <a>Ingen historikk</a>
          </li>
        )}
      </ul>
    </div>
  );
};

export default HistoryDropdownSelect;
