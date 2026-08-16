import { createContext } from 'react'
import type { Language } from '@/models'
import type { Strings } from '@/i18n/strings'

export interface LanguageState {
  language: Language
  /** UI dictionary for the active language. */
  t: Strings
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
}

export const LanguageContext = createContext<LanguageState | null>(null)
