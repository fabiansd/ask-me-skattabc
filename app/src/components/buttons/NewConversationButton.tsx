'use client';
import Button from '../common/Button';

interface NewConversationButtonProps {
  onClick: () => void;
}

export default function NewConversationButton({ onClick }: NewConversationButtonProps) {
  return (
    <Button
      data-testid="new-conversation"
      variant="primary"
      size="sm"
      onClick={onClick}
      fullWidth
      leftIcon={
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
        </svg>
      }
    >
      Ny samtale
    </Button>
  );
}
