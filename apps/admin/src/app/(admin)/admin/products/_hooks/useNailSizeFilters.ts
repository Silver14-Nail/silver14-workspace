'use client';

import { useState, useMemo, useCallback } from 'react';
import type { NailSize } from '../_types';

export function useNailSizeFilters(initialSizes: NailSize[]) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalCount = initialSizes.length;
  const activeCount = totalCount;

  const filtered = useMemo(
    () =>
      initialSizes.filter(
        (s) =>
          search === '' ||
          s.label.toLowerCase().includes(search.toLowerCase()) ||
          s.sizeCode.toLowerCase().includes(search.toLowerCase()),
      ),
    [initialSizes, search],
  );

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filtered, currentPage, itemsPerPage],
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch('');
    setCurrentPage(1);
  }, []);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  return {
    search,
    handleSearch,
    clearSearch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    filtered,
    paginated,
    totalFiltered: filtered.length,
    totalCount,
    activeCount,
  };
}
