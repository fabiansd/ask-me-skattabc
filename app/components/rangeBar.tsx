// RangeInput.jsx
import React from 'react';

function RangeBar({ value, onChange }) {
    return (
        <div>
            <input
                type="range"
                min="1"
                max="5"
                value={value}
                className="range-primary"
                step="1"
                onChange={(e) => onChange(e.target.value)}
            />
            <div className="w-full flex justify-between text-xs px-2">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
            </div>
        </div>
    );
}

export default RangeBar;
