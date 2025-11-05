interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

export default function SearchInput({ value, onChange, onKeyDown }: SearchInputProps) {
  return (
    <textarea
      placeholder="Spør meg om skatt"
      className="textarea textarea-bordered w-full max-w-3xl m-1 resize-none min-h-[3rem] rounded"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      rows={1}
      onInput={e => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = Math.min(target.scrollHeight, 200) + 'px';
      }}
    />
  );
}
