// In-memory, per-tab cache of the last scroll position for a given list view
// (keyed by whatever the caller composes — locale + active filters, etc).
// Shared across any listing page (products, supplies) that restores scroll
// position when the user returns from a detail page. The list data itself is
// restored separately, via each page's own TanStack Query cache.
const scrollPositions = new Map<string, number>();

export function getScrollPosition(key: string): number | undefined {
  return scrollPositions.get(key);
}

export function setScrollPosition(key: string, y: number): void {
  scrollPositions.set(key, y);
}
