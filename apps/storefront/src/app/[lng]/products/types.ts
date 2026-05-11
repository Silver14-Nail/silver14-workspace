export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'bestseller';

export interface ProductFilters {
  searchQuery: string;
  activeCollection: string;
  sortBy: SortOption;
}
