import type { Language } from './common'
import type { Promotion } from './promotion'

/** Shop-wide configuration read from `db.json` (spec §23). */
export interface Settings {
  shopNameEn: string
  shopNameKm: string
  taglineEn: string
  taglineKm: string
  logo: string
  /**
   * Hero banner slides, shown as a looping cross-fade. One entry is a static
   * banner; an empty list falls back to the shipped default.
   */
  heroImages: string[]
  phone: string
  addressEn: string
  addressKm: string
  openingHoursEn: string
  openingHoursKm: string
  currencyUsd: boolean
  currencyKhr: boolean
  /**
   * Riel per dollar, set by the shop in the admin. Every riel price in the
   * file is already worked out at this rate; the menu only needs it for the
   * discounted prices it calculates itself.
   */
  khrPerUsd: number
  defaultLanguage: Language
  /** When false, sold-out products are hidden instead of dimmed (spec §16). */
  showUnavailableProducts: boolean
  facebook: string
  telegram: string
  /**
   * The shop's own wording, empty when it has written none, in which case the
   * menu uses the wording in i18n/strings.
   */
  aboutIntroEn: string
  aboutIntroKm: string
  menuNoteEn: string
  menuNoteKm: string
  /**
   * The running promotion, or null when the shop has none. Its date window is
   * still checked before anything is shown — see services/promotion.ts.
   */
  promo: Promotion | null
}
