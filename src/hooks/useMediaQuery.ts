import { useCallback, useSyncExternalStore } from 'react'

/**
 * Reads a CSS media query from JS.
 *
 * Used only where mobile and desktop need genuinely different markup — the
 * category rail versus the category grid (spec §9). Everything else switches
 * with CSS alone. `matchMedia` answers synchronously on the first render, so
 * there is no flash of the wrong layout.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Matches Tailwind's `lg` breakpoint — the spec's desktop range (spec §34). */
export const DESKTOP_QUERY = '(min-width: 1024px)'
