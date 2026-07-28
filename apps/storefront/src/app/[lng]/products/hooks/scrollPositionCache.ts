// In-memory, per-tab cache of the last scroll position for a given products
// list view (keyed by locale + active filters). The product list itself is
// restored automatically by TanStack Query's own cache (see
// useProductFilters.ts) when the user returns from a product detail page —
// this only needs to remember the scroll offset to go with it.
const scrollPositions = new Map<string, number>();

export function getScrollPosition(key: string): number | undefined {
  return scrollPositions.get(key);
}

export function setScrollPosition(key: string, y: number): void {
  scrollPositions.set(key, y);
}
