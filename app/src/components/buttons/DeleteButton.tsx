'use client';
import { useRef, useState } from 'react';

interface DeleteButtonProps {
  onDelete: () => void;
}

export default function DeleteButton({ onDelete }: DeleteButtonProps) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startDelete = () => {
    setProgress(0);
    let currentProgress = 0;

    intervalRef.current = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(intervalRef.current!);
        onDelete();
        setProgress(0);
      }
    }, 50);
  };

  const cancelDelete = () => {
    clearInterval(intervalRef.current!);
    setProgress(0);
  };

  return (
    <div
      className="absolute top-1/2 right-2 transform -translate-y-1/2 w-6 h-6 bg-base-100 rounded opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden"
      onMouseDown={startDelete}
      onMouseUp={cancelDelete}
      onMouseLeave={cancelDelete}
    >
      <div
        className="absolute inset-0 bg-red-500/30 transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
      <svg
        className="w-5 h-5 absolute inset-0.5 text-base-content/60"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
