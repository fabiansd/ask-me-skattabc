'use client';
import { useState } from 'react';

interface CollapseToggleProps {
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export default function CollapseToggle({ isCollapsed, onToggle }: CollapseToggleProps) {
  const [isButtonFixed, setIsButtonFixed] = useState(false);

  const handleToggle = () => {
    if (isCollapsed) {
      setIsButtonFixed(false);
      onToggle(false);
    } else {
      onToggle(true);
      setTimeout(() => setIsButtonFixed(true), 200);
    }
  };

  return (
    <div className={`relative ${isCollapsed ? '-mt-6 mb-10' : ''}`}>
      <div className={`divider w-full ${isCollapsed ? 'm-0 p-0' : ''}`}></div>
      <button
        onClick={handleToggle}
        className={`${isButtonFixed ? 'fixed' : 'absolute'} left-1/2 -translate-x-1/2 bg-base-200 border border-base-300 rounded w-8 h-8 flex items-center justify-center hover:bg-neutral hover:border-neutral-focus transition-colors ${
          isButtonFixed ? 'top-16' : 'top-1/2 -translate-y-1/2'
        }`}
      >
        <svg
          className={`w-4 h-4 ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
