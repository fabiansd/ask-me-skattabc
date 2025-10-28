'use client';

interface NewConversationButtonProps {
  onClick: () => void;
}

export default function NewConversationButton({ onClick }: NewConversationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="btn bg-red-500 hover:bg-red-600 text-white px-6 rounded flex-1 mr-2"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Ny samtale
    </button>
  );
}
