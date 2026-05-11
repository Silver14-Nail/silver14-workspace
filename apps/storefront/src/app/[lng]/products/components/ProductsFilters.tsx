import { TFunction } from 'i18next';
import { SearchInput, SortDropdown } from '.';

interface Props {
  COLLECTIONS: any[];
  activeCollection: string;
  onCollectionChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  sortOpen: boolean;
  onSortToggle: () => void;
  onSortChange: (option: any) => void;
  t: TFunction;
}

export function ProductsFilters({
  COLLECTIONS,
  activeCollection,
  onCollectionChange,
  searchQuery,
  onSearchChange,
  sortOpen,
  onSortToggle,
  onSortChange,
  sortBy,
  t,
}: Props) {
  const activeSortLabel = t(`sort.${sortBy === 'featured' ? 'featured' : sortBy.replace('-', '')}`);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      {/* Collection Pills */}
      <div className="flex flex-wrap gap-2">
        {COLLECTIONS.map((col) => (
          <button
            key={col.id}
            onClick={() => onCollectionChange(col.id)}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest border transition-colors ${
              activeCollection === col.id
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#6A6A6A] border-[#E0E0E0] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
            }`}
            style={{ letterSpacing: '0.1em' }}
          >
            {col.label}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-3">
        <SearchInput value={searchQuery} onChange={onSearchChange} t={t} />
        <SortDropdown
          activeSortLabel={activeSortLabel}
          sortOpen={sortOpen}
          onSortToggle={onSortToggle}
          onSortChange={onSortChange}
          t={t}
        />
      </div>
    </div>
  );
}
