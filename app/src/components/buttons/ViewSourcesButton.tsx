import React from 'react';

import Tooltip from '../common/Tooltip';

interface ViewSourcesButtonProps {
  onClick: () => void;
}

const ViewSourcesButton: React.FC<ViewSourcesButtonProps> = ({ onClick }) => {
  return (
    <Tooltip text="Vis kildedokumenter som ble brukt i svaret" position="top">
      <button
        className="btn btn-ghost btn-xs text-xs opacity-60 hover:opacity-100"
        onClick={onClick}
        aria-label="Vis kilder"
      >
        Kilder
      </button>
    </Tooltip>
  );
};

export default ViewSourcesButton;
