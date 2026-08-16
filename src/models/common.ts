/** The two languages the menu is published in (spec §18). */
export type Language = 'km' | 'en'

export const LANGUAGES: readonly Language[] = ['km', 'en'] as const

export function isLanguage(value: unknown): value is Language {
  return value === 'km' || value === 'en'
}

/**
 * A price is always carried in both currencies. Conversion is never computed
 * at runtime — the shop sets both numbers by hand (spec §17).
 */
export interface Price {
  usd: number
  khr: number
}

/** Anything the UI can render in either language. */
export interface Localized {
  en: string
  km: string
}
