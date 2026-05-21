'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'bestseller', label: 'Best Seller' },
];

interface Props {
  total: number;
  currentSort: string;
}

export function CollectionSortBar({ total, currentSort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = SORT_OPTIONS.find((o) => o.value === currentSort) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="border-y border-[#E0E0E0] py-3.5 mb-8">
      <div className="flex items-center justify-between gap-3">
        {/* Left: product count */}
        <span className="text-sm text-[#9A9A9A]">
          {total} {total === 1 ? 'product' : 'products'}
        </span>

        {/* Right: Sort by dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#9A9A9A]">Sort by:</span>
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-1 text-sm text-[#1A1A1A] hover:text-[#6A6A6A] transition-colors"
            >
              <span>{active.label}</span>
              <ChevronDown
                className={`size-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-[#E0E0E0] shadow-md z-30 min-w-[180px] py-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left transition-colors hover:bg-[#F5F5F5] ${
                      opt.value === active.value
                        ? 'text-[#1A1A1A] font-medium'
                        : 'text-[#6A6A6A]'
                    }`}
                  >
                    {opt.label}
                    {opt.value === active.value && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] flex-shrink-0 ml-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
