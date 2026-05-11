import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { sortOptions } from '../constants';
import { TFunction } from 'i18next';

interface Props {
  activeSortLabel: string;
  sortOpen: boolean;
  onSortToggle: () => void;
  onSortChange: (option: any) => void;
  t: TFunction;
}

export function SortDropdown({ activeSortLabel, sortOpen, onSortToggle, onSortChange, t }: Props) {
  return (
    <div className="relative">
      <button
        onClick={onSortToggle}
        className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-widest border border-[#E0E0E0] text-[#6A6A6A] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors bg-white"
        style={{ letterSpacing: '0.1em' }}
      >
        <SlidersHorizontal className="size-3.5" />
        <span className="hidden sm:inline">{activeSortLabel}</span>
        <ChevronDown className="size-3" />
      </button>

      {sortOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-[#E0E0E0] shadow-lg z-20 min-w-[180px]">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`block w-full text-left px-4 py-2.5 text-xs uppercase tracking-widest hover:bg-[#F5F5F5] transition-colors ${'text-[#6A6A6A] hover:text-[#1A1A1A]'}`}
              style={{ letterSpacing: '0.1em' }}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
