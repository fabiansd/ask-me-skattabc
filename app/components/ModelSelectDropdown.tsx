import React, { useState } from 'react';

interface ModelSelectProps {
    models: string[];
    onSelect: (newValue: string) => void; 
}

const ModelSelectDropdown = ({ models, onSelect }: ModelSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(models[0]);

  const handleItemClick = (model: string) => {
    setSelectedItem(model);
    onSelect(model);
    setIsOpen(false);
  };

  return (
    <div className="dropdown dropdown-hover">
      <div tabIndex={0} role="button" className="btn m-1" onClick={() => setIsOpen(!isOpen)}>
        {selectedItem || "Velg modell"}
      </div>
      {isOpen && (
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          {models.map(model => (
            <li key={model}><a onClick={() => handleItemClick(model)}>{model}</a></li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModelSelectDropdown;