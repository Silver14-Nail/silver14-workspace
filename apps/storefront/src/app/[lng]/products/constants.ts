export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'bestseller';

export const sortOptions: { value: SortOption; labelKey: string }[] = [
  { value: 'featured', labelKey: 'sort.featured' },
  { value: 'newest', labelKey: 'sort.newest' },
  { value: 'bestseller', labelKey: 'sort.bestseller' },
  { value: 'price-asc', labelKey: 'sort.priceAsc' },
  { value: 'price-desc', labelKey: 'sort.priceDesc' },
];

export const getSortFromParams = (searchParams: URLSearchParams): SortOption => {
  const sort = searchParams.get('sort');
  const legacyFilter = searchParams.get('filter');

  if (sort === 'price-asc' || sort === 'price-desc' || sort === 'newest' || sort === 'bestseller') {
    return sort as SortOption;
  }
  if (legacyFilter === 'new') return 'newest';
  if (legacyFilter === 'bestseller') return 'bestseller';

  return 'featured';
};
