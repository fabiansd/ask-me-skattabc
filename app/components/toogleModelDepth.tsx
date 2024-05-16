import React, { useState } from 'react';

interface ToggleSwitchProps {
  onToggle: (state: boolean) => void;
  textA: string;
  textB: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ onToggle, textA, textB }) => {
  const [isTextA, setIsTextA] = useState(true);

  const handleToggle = () => {
    const newState = !isTextA;
    setIsTextA(newState);
    onToggle(newState);
  };

  return (
    <label className="swap btn-ghost m-1 px-6 rounded mr-10">
        <input 
          type="checkbox" 
          checked={!isTextA} 
          onChange={handleToggle} 
        />
        <div className="swap-on">{textB}</div>
        <div className="swap-off">{textA}</div>
    </label>
  );
};

export default ToggleSwitch;
