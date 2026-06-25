'use client';

import { useEffect, useRef } from 'react';

export function useIntersectionObserver(
  onIntersect: () => void,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onIntersect);
  callbackRef.current = onIntersect;

  useEffect(() => {
    const el = enabled ? sentinelRef.current : null;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) callbackRef.current();
      },
      { rootMargin: '300px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return sentinelRef;
}
