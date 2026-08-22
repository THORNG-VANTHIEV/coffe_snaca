import { createContext } from 'react'

/**
 * Two explicit themes, no "system" option: the shop wants the dark
 * coffee-house look by default regardless of what the customer's phone is set
 * to, and a third state would make the toggle ambiguous.
 */
export type Theme = 'dark' | 'light'

export const DEFAULT_THEME: Theme = 'light'

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light'
}

export interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeState | null>(null)
