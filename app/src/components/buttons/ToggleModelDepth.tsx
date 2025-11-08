import React from 'react';

import Tooltip from '../common/Tooltip';

interface ToggleSwitchProps {
  onToggle: (state: boolean) => void;
  isDetailed: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ onToggle, isDetailed }) => {
  const handleToggle = () => {
    const newValue = !isDetailed;
    console.log('🎛️', newValue ? 'DETALJERT' : 'KONKRET', '(isDetailed:', newValue + ')');
    onToggle(newValue);
  };

  return (
    <Tooltip text="Velg mellom korte presise og utdypende forklarende svar">
      <label className="swap btn btn-ghost m-1 px-6 rounded mr-16">
        <input type="checkbox" checked={isDetailed} onChange={handleToggle} />
        <div className="swap-on">{'Detaljert'}</div>
        <div className="swap-off">{'Konkret'}</div>
      </label>
    </Tooltip>
  );
};

export default ToggleSwitch;
