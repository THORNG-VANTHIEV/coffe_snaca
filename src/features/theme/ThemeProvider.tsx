import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { readStored, STORAGE_KEYS, writeStored } from '@/utils/storage'
import { DEFAULT_THEME, isTheme, ThemeContext, type Theme } from './themeContext'

/** Address-bar / browser-chrome colour, kept in step with the page. */
const CHROME_COLOR: Record<Theme, string> = {
  dark: '#1A110B',
  light: '#FAF7F2',
}

/** Matches the 260ms transition in globals.css, with a little slack. */
const TRANSITION_CLASS = 'theme-transition'
const TRANSITION_MS = 320

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
  const transitionTimer = useRef<number | undefined>(undefined)

  const setTheme = useCallback((next: Theme) => {
    // Armed before the attribute flips, so the browser has the transition in
    // place when the new palette lands. The class is added synchronously here
    // and the swap happens in the effect below, a frame later.
    const root = document.documentElement
    root.classList.add(TRANSITION_CLASS)

    window.clearTimeout(transitionTimer.current)
    transitionTimer.current = window.setTimeout(() => {
      root.classList.remove(TRANSITION_CLASS)
    }, TRANSITION_MS)

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

  // Never leave the global colour transition armed behind us.
  useEffect(
    () => () => {
      window.clearTimeout(transitionTimer.current)
      document.documentElement.classList.remove(TRANSITION_CLASS)
    },
    [],
  )

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
