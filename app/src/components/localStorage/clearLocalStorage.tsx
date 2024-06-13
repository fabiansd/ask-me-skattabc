// historyDropdownSelect.tsx
'use client';
import React, { useState } from 'react';

interface ClearHistoryButtonProps {
  disabled?: boolean;
  handleDelete: () => void;
}

const ClearHistoryButton: React.FC<ClearHistoryButtonProps> = ({ disabled = false, handleDelete }) => {
  return (
    <div>
      <button 
        className="btn bg-red-500 hover:bg-red-600 text-white m-1 px-6 rounded mr-10"
        onClick={!disabled ? handleDelete : undefined}
        disabled={disabled}
        >
        Nytt emne
      </button>
    </div>
  );
};

export default ClearHistoryButton;
