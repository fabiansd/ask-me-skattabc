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
  loadingText = 'Laster',
}: SearchButtonProps) {
  const buttonText = isLoading
    ? loadingText
    : !currentConversationId
      ? 'Nytt spørsmål'
      : 'Oppfølgingsspørsmål';

  return (
    <Tooltip text="Press enter! Assistenten husker samtalen. PS: Jeg jobber :)">
      <button
        className="btn bg-sky-700 hover:bg-sky-800 text-white font-bold m-1 px-6 rounded min-w-[180px]"
        disabled={disabled}
        onClick={onClick}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{buttonText}</span>
          </div>
        ) : (
          buttonText
        )}
      </button>
    </Tooltip>
  );
}
