import type { Language } from './common'

/** Shop-wide configuration read from `db.json` (spec §23). */
export interface Settings {
  shopNameEn: string
  shopNameKm: string
  taglineEn: string
  taglineKm: string
  logo: string
  phone: string
  addressEn: string
  addressKm: string
  openingHoursEn: string
  openingHoursKm: string
  currencyUsd: boolean
  currencyKhr: boolean
  defaultLanguage: Language
  /** When false, sold-out products are hidden instead of dimmed (spec §16). */
  showUnavailableProducts: boolean
  facebook: string
  telegram: string
}
