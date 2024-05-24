// historyDropdownSelect.tsx
'use client';
import React, { useState } from 'react';

const HistoryDropdownSelect: React.FC = () => {

  const handleDelete = () => {
    localStorage.clear();
    alert('Local storage has been cleared');
    window.location.reload();
  };


  return (
    <div>
      <div 
        tabIndex={0} 
        role="button" 
        className="btn bg-red-700 hover:bg-red-800 text-white m-1 px-6 rounded mr-10"
        onClick={handleDelete}>
        {"Slett nylige"}
      </div>
    </div>
  );
};

export default HistoryDropdownSelect;
