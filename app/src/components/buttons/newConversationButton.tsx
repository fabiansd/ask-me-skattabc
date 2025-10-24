// historyDropdownSelect.tsx
'use client';
import React from 'react';

interface NewConversationButtonProps {
  disabled?: boolean;
  handleDelete: () => void;
}

const NewConversationButton: React.FC<NewConversationButtonProps> = ({
  disabled = false,
  handleDelete,
}) => {
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

export default NewConversationButton;
