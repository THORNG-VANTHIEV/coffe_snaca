import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isLanguage, type Language } from '@/models'
import { dictionaries } from '@/i18n/strings'
import { useMenuState } from '@/hooks/useMenu'
import { readStored, STORAGE_KEYS, writeStored } from '@/utils/storage'
import { LanguageContext } from './languageContext'

/** The customer's own choice always wins over the shop default. */
function readStoredLanguage(): Language | null {
  const stored = readStored(STORAGE_KEYS.language)
  return isLanguage(stored) ? stored : null
}

/**
 * Language state (spec §18). Khmer is the default; the choice is remembered
 * in LocalStorage and survives refreshes and re-scans.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { data } = useMenuState()
  const [chosen, setChosen] = useState<Language | null>(readStoredLanguage)

  const shopDefault = data?.settings.defaultLanguage ?? 'km'
  const language = chosen ?? shopDefault

  const setLanguage = useCallback((next: Language) => {
    setChosen(next)
    writeStored(STORAGE_KEYS.language, next)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'km' ? 'en' : 'km')
  }, [language, setLanguage])

  // Keeps `:lang(km)` line-height rules and screen readers in sync.
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({ language, t: dictionaries[language], setLanguage, toggleLanguage }),
    [language, setLanguage, toggleLanguage],
  )

  return <LanguageContext value={value}>{children}</LanguageContext>
}
