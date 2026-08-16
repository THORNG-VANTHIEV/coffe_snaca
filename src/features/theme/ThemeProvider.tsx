import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { readStored, STORAGE_KEYS, writeStored } from '@/utils/storage'
import { DEFAULT_THEME, isTheme, ThemeContext, type Theme } from './themeContext'

/** Address-bar / browser-chrome colour, kept in step with the page. */
const CHROME_COLOR: Record<Theme, string> = {
  dark: '#1A110B',
  light: '#FAF7F2',
}

/**
 * The stored choice, or the shop's default.
 *
 * The same read happens in an inline script in index.html so the correct
 * theme is on `<html>` before the first paint — without it a customer who
 * chose light would see a dark flash on every load. This function is what
 * React uses once it takes over.
 */
function readInitialTheme(): Theme {
  const stored = readStored(STORAGE_KEYS.theme)
  return isTheme(stored) ? stored : DEFAULT_THEME
}

/**
 * Light/dark theme state, defaulting to dark.
 *
 * Unlike the language, the theme is not read from `db.json`: it has to be
 * applied before any data loads, so the default lives in the code and the
 * customer's own choice is remembered in LocalStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme)

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    writeStored(STORAGE_KEYS.theme, next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', CHROME_COLOR[theme])
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
