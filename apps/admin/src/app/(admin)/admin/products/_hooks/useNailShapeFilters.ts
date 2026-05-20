'use client';

import { useState, useMemo, useCallback } from 'react';
import type { NailShape } from '../_types';

export function useNailShapeFilters(initialShapes: NailShape[]) {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalCount = initialShapes.length;
  const activeCount = useMemo(
    () => initialShapes.filter((s) => s.isActive).length,
    [initialShapes],
  );

  const filtered = useMemo(
    () =>
      initialShapes.filter((s) => {
        if (statusFilter !== 'all' && (statusFilter === 'active' ? !s.isActive : s.isActive))
          return false;
        if (tierFilter !== 'all' && s.sizeTier !== tierFilter) return false;
        if (search.trim() && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [initialShapes, search, tierFilter, statusFilter],
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

  const handleTierFilter = useCallback((value: string) => {
    setTierFilter(value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
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
    tierFilter,
    handleTierFilter,
    statusFilter,
    handleStatusFilter,
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
