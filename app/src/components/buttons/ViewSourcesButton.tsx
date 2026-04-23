import React from 'react';

import Tooltip from '../common/Tooltip';

interface ViewSourcesButtonProps {
  onClick: () => void;
}

const ViewSourcesButton: React.FC<ViewSourcesButtonProps> = ({ onClick }) => {
  return (
    <Tooltip text="Se kildedokumentene som ble brukt i svaret" position="top">
      <button
        data-testid="view-sources"
        type="button"
        onClick={onClick}
        aria-label="Vis kilder"
        className="
          inline-flex items-center gap-1.5
          h-7 px-2.5
          rounded-btn
          text-xs font-medium text-primary
          hover:bg-primary/10
          transition-colors
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary
        "
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 5.5A2.5 2.5 0 016.5 3H19a1 1 0 011 1v14.5A2.5 2.5 0 0117.5 21H6.5A2.5 2.5 0 014 18.5v-13z M8 7h8M8 11h8M8 15h5"
          />
        </svg>
        Kilder
      </button>
    </Tooltip>
  );
};

export default ViewSourcesButton;
