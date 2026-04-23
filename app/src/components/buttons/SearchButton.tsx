'use client';
import Button from '../common/Button';
import Tooltip from '../common/Tooltip';

interface SearchButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
  currentConversationId: number | null;
  loadingText?: string;
}

export default function SearchButton({
  isLoading,
  disabled,
  onClick,
  currentConversationId,
  loadingText = 'Laster…',
}: SearchButtonProps) {
  const buttonText = isLoading
    ? loadingText
    : !currentConversationId
      ? 'Still spørsmål'
      : 'Følg opp';

  const sendIcon = (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
    </svg>
  );

  return (
    <Tooltip text="Assistenten husker samtalen. Trykk Enter for å sende.">
      <Button
        data-testid="submit-query"
        variant="primary"
        size="md"
        loading={isLoading}
        disabled={disabled}
        onClick={onClick}
        rightIcon={!isLoading ? sendIcon : undefined}
        className="min-w-[150px]"
      >
        {buttonText}
      </Button>
    </Tooltip>
  );
}
