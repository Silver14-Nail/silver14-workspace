'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { TFunction } from 'i18next';
import { sortOptions } from '../constants';
import { SearchInput } from '.';

interface Collection {
  id: string;    // UUID — React key
  slug: string;  // URL param + active state comparison
  label: string;
}

interface Props {
  COLLECTIONS: Collection[];
  activeCollection: string;
  onCollectionChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  sortOpen: boolean;
  onSortToggle: () => void;
  onSortChange: (option: any) => void;
  productCount: number;
  t: TFunction;
}

function ShapeFilter({
  collections,
  activeCollection,
  onCollectionChange,
}: {
  collections: Collection[];
  activeCollection: string;
  onCollectionChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeLabel = collections.find((c) => c.slug === activeCollection)?.label ?? 'All';
  const isFiltered = activeCollection !== 'all';

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 text-sm transition-colors ${
          isFiltered ? 'text-[#1A1A1A] font-semibold' : 'text-[#6A6A6A] hover:text-[#1A1A1A]'
        }`}
      >
        <span>Collection{isFiltered ? `: ${activeLabel}` : ''}</span>
        {isFiltered ? (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onCollectionChange('all');
              setOpen(false);
            }}
            className="ml-0.5 p-0.5 rounded-full hover:bg-[#F0F0F0]"
          >
            <X className="size-3" />
          </span>
        ) : (
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 bg-white border border-[#E0E0E0] shadow-md z-30 min-w-[160px] py-1">
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => {
                onCollectionChange(col.slug);
                setOpen(false);
              }}
              className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left transition-colors hover:bg-[#F5F5F5] ${
                col.slug === activeCollection ? 'text-[#1A1A1A] font-medium' : 'text-[#6A6A6A]'
              }`}
            >
              {col.label}
              {col.slug === activeCollection && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] flex-shrink-0 ml-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortSelect({
  sortBy,
  sortOpen,
  onSortToggle,
  onSortChange,
  t,
}: {
  sortBy: string;
  sortOpen: boolean;
  onSortToggle: () => void;
  onSortChange: (option: any) => void;
  t: TFunction;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const activeOption = sortOptions.find((o) => o.value === sortBy) ?? sortOptions[0];

  useEffect(() => {
    if (!sortOpen) return undefined;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onSortToggle();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortOpen, onSortToggle]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onSortToggle}
        className="flex items-center gap-1 text-sm text-[#1A1A1A] hover:text-[#6A6A6A] transition-colors"
      >
        <span>{t(activeOption.labelKey)}</span>
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {sortOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-[#E0E0E0] shadow-md z-30 min-w-[180px] py-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left transition-colors hover:bg-[#F5F5F5] ${
                opt.value === sortBy ? 'text-[#1A1A1A] font-medium' : 'text-[#6A6A6A]'
              }`}
            >
              {t(opt.labelKey)}
              {opt.value === sortBy && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] flex-shrink-0 ml-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductsFilters({
  COLLECTIONS,
  activeCollection,
  onCollectionChange,
  searchQuery,
  onSearchChange,
  sortBy,
  sortOpen,
  onSortToggle,
  onSortChange,
  productCount,
  t,
}: Props) {
  return (
    <div className="border-y border-[#E0E0E0] py-3.5 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filter controls */}
        <div className="flex items-center gap-5">
          <span className="text-sm text-[#9A9A9A]">Filter:</span>
          <ShapeFilter
            collections={COLLECTIONS}
            activeCollection={activeCollection}
            onCollectionChange={onCollectionChange}
          />
        </div>

        {/* Right: Search + Sort by + count */}
        <div className="flex items-center gap-4">
          <SearchInput value={searchQuery} onChange={onSearchChange} t={t} />

          <div className="hidden sm:block w-px h-4 bg-[#E0E0E0]" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-[#9A9A9A]">Sort by:</span>
            <SortSelect
              sortBy={sortBy}
              sortOpen={sortOpen}
              onSortToggle={onSortToggle}
              onSortChange={onSortChange}
              t={t}
            />
          </div>

          <div className="hidden sm:block w-px h-4 bg-[#E0E0E0]" />

          <span className="hidden sm:block text-sm text-[#9A9A9A] whitespace-nowrap">
            {t('results', { count: productCount })}
          </span>
        </div>
      </div>
    </div>
  );
}
