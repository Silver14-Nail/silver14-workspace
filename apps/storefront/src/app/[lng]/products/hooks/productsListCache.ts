import type { StorefrontProduct } from '@/types/product';

interface CachedListState {
  products: StorefrontProduct[];
  currentPage: number;
  hasMore: boolean;
  totalItems: number;
  scrollY: number;
}

// In-memory only — survives client-side (SPA) navigation away from and back
// to the products page within the same tab/session, cleared on a full page
// reload. Keyed by locale + filter params so different searches/collections/
// sorts never restore into each other's view.
//
// This exists because the products list route is dynamically rendered
// (`cache: 'no-store'`), so Next's Router Cache doesn't reliably keep the
// client component mounted across a `/products` -> `/products/[slug]` -> back
// round trip. Without this, going back re-mounts the page with only the
// first SSR page of results, collapsing the accumulated infinite-scroll list
// back down to ~24 items and stranding the browser's scroll position past
// the (now much shorter) content.
const cache = new Map<string, CachedListState>();

export function getCachedProductsList(key: string): CachedListState | undefined {
  return cache.get(key);
}

export function setCachedProductsList(key: string, state: CachedListState): void {
  cache.set(key, state);
}
