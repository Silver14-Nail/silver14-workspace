import { TFunction } from 'i18next';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  t: TFunction;
}

export function SearchInput({ value, onChange, t }: Props) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#9A9A9A]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="pl-8 pr-3 py-2 text-xs border border-[#E0E0E0] bg-white text-[#1A1A1A] placeholder:text-[#9A9A9A] outline-none focus:border-[#C0C0C0] transition-colors w-40 md:w-52"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2">
          <X className="size-3 text-[#9A9A9A]" />
        </button>
      )}
    </div>
  );
}
