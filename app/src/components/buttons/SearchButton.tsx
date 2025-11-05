import Tooltip from '../common/Tooltip';

interface SearchButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
  currentConversationId: number | null;
}

export default function SearchButton({
  isLoading,
  disabled,
  onClick,
  currentConversationId,
}: SearchButtonProps) {
  return (
    <Tooltip text="Press enter! Assistenten husker samtalen og bygger videre på den">
      <button
        className="btn bg-sky-700 hover:bg-sky-800 text-white font-bold m-1 px-6 rounded min-w-[180px]"
        disabled={disabled}
        onClick={onClick}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-700"></div>
        ) : !currentConversationId ? (
          'Nytt spørsmål'
        ) : (
          'Oppfølgingsspørsmål'
        )}
      </button>
    </Tooltip>
  );
}
