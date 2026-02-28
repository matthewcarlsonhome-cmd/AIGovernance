'use client';

import { useState, useEffect } from 'react';

/**
 * Reusable hook that tracks whether the viewport matches a CSS media query.
 * Defaults to checking `(max-width: <breakpoint - 1>px)` when a number is passed,
 * or accepts a raw media query string.
 *
 * @example
 *   const isMobile = useMediaQuery(768);     // true when viewport < 768px
 *   const isDark   = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(queryOrBreakpoint: string | number): boolean {
  const query =
    typeof queryOrBreakpoint === 'number'
      ? `(max-width: ${queryOrBreakpoint - 1}px)`
      : queryOrBreakpoint;

  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
