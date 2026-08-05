'use client';

import { createContext, useContext } from 'react';

const RegionContext = createContext(false);

// Set once by a Server Component (see [lng]/layout.tsx) from the CF-IPCountry
// header, so the value is present on the very first render — including SSR —
// unlike Redux state seeded via a post-hydration useEffect, which would let
// the initial (wrong) image src slip out before the fix could take effect.
export function RegionProvider({
  isAsiaRegion,
  children,
}: {
  isAsiaRegion: boolean;
  children: React.ReactNode;
}) {
  return <RegionContext.Provider value={isAsiaRegion}>{children}</RegionContext.Provider>;
}

export function useIsAsiaRegion(): boolean {
  return useContext(RegionContext);
}
