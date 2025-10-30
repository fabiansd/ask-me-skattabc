interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

export default function SearchInput({ value, onChange, onKeyDown }: SearchInputProps) {
  return (
    <input
      type="text"
      placeholder="Spør meg om skatt"
      className="input input-bordered w-full max-w-3xl m-1"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
}
