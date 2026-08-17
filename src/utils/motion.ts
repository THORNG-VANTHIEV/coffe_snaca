/** Shared JS timings; their CSS counterparts live in variables.css. */
export const MOTION_DURATION_MS = {
  fast: 150,
  standard: 220,
  slow: 320,
} as const

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false
}
