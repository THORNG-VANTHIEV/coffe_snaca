import { useContext } from 'react'
import { LanguageContext, type LanguageState } from '@/features/language/languageContext'

export function useLanguage(): LanguageState {
  const state = useContext(LanguageContext)
  if (!state) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return state
}
