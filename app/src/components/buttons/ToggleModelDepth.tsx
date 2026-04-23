'use client';
import React from 'react';

import Tooltip from '../common/Tooltip';

interface ToggleSwitchProps {
  onToggle: (state: boolean) => void;
  isDetailed: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ onToggle, isDetailed }) => {
  const select = (detailed: boolean) => () => onToggle(detailed);

  return (
    <Tooltip text="Konkret gir korte svar, Detaljert gir grundige forklaringer">
      <div
        role="radiogroup"
        aria-label="Svartype"
        data-testid="toggle-model-depth"
        data-state={isDetailed ? 'detaljert' : 'konkret'}
        className="
          inline-flex items-center
          h-9 p-0.5
          rounded-btn border border-base-300
          bg-base-200
          text-sm
        "
      >
        <button
          type="button"
          role="radio"
          aria-checked={!isDetailed}
          onClick={select(false)}
          className={`
            h-full px-3.5 rounded-[0.3rem]
            transition-colors duration-150
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-secondary
            ${
              !isDetailed
                ? 'bg-base-100 text-base-content shadow-card font-medium'
                : 'text-base-content/60 hover:text-base-content'
            }
          `}
        >
          Konkret
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isDetailed}
          onClick={select(true)}
          className={`
            h-full px-3.5 rounded-[0.3rem]
            transition-colors duration-150
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-secondary
            ${
              isDetailed
                ? 'bg-base-100 text-base-content shadow-card font-medium'
                : 'text-base-content/60 hover:text-base-content'
            }
          `}
        >
          Detaljert
        </button>
      </div>
    </Tooltip>
  );
};

export default ToggleSwitch;
