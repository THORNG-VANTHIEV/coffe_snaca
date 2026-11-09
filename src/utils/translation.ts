import type {
  Category,
  Language,
  Product,
  ProductExtra,
  ProductOptionGroup,
  ProductOptionValue,
  ProductSize,
  Settings,
} from '@/models'

/**
 * Readers for the bilingual fields carried by the data itself (spec §19).
 *
 * The mapper already back-fills a missing translation with the other
 * language, so these never return an empty string for a populated record.
 */

export function pick(language: Language, en: string, km: string): string {
  return language === 'km' ? km || en : en || km
}

function pickList(language: Language, en: string[], km: string[]): string[] {
  if (language === 'km') return km.length > 0 ? km : en
  return en.length > 0 ? en : km
}

export const productName = (product: Product, language: Language): string =>
  pick(language, product.nameEn, product.nameKm)

export const productDescription = (product: Product, language: Language): string =>
  pick(language, product.descriptionEn, product.descriptionKm)

export const productIngredients = (product: Product, language: Language): string[] =>
  pickList(language, product.ingredientsEn, product.ingredientsKm)

/** The other language's name, shown as a secondary line on cards and titles. */
export const productAltName = (product: Product, language: Language): string =>
  language === 'km' ? product.nameEn : product.nameKm

/**
 * Whether two strings say the same words, ignoring case, spacing and
 * punctuation: "Fresh Coffee. Better Moments." and "Fresh coffee, better
 * moments." are one sentence. Letters, marks and digits are all kept, because
 * Khmer vowels and subscripts are marks, not punctuation.
 */
export function sameWords(a: string, b: string): boolean {
  const words = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu, '')
  return words(a) === words(b)
}

export const categoryName = (category: Category, language: Language): string =>
  pick(language, category.nameEn, category.nameKm)

export const categoryDescription = (category: Category, language: Language): string =>
  pick(language, category.descriptionEn, category.descriptionKm)

export const sizeName = (size: ProductSize, language: Language): string =>
  pick(language, size.nameEn, size.nameKm)

export const extraName = (extra: ProductExtra, language: Language): string =>
  pick(language, extra.nameEn, extra.nameKm)

export const optionGroupName = (group: ProductOptionGroup, language: Language): string =>
  pick(language, group.nameEn, group.nameKm)

export const optionValueName = (value: ProductOptionValue, language: Language): string =>
  pick(language, value.nameEn, value.nameKm)

export const shopIntro = (settings: Settings, language: Language): string =>
  pick(language, settings.aboutIntroEn, settings.aboutIntroKm)

export const shopMenuNote = (settings: Settings, language: Language): string =>
  pick(language, settings.menuNoteEn, settings.menuNoteKm)

export const shopName = (settings: Settings, language: Language): string =>
  pick(language, settings.shopNameEn, settings.shopNameKm)

export const shopTagline = (settings: Settings, language: Language): string =>
  pick(language, settings.taglineEn, settings.taglineKm)

export const shopAddress = (settings: Settings, language: Language): string =>
  pick(language, settings.addressEn, settings.addressKm)

export const shopOpeningHours = (settings: Settings, language: Language): string =>
  pick(language, settings.openingHoursEn, settings.openingHoursKm)
