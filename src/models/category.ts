/**
 * Categories drive the whole navigation. They are data, never hard-coded in
 * components (spec §6).
 */
export type CategoryKind = 'drink' | 'food'

export interface Category {
  id: number
  slug: string
  nameEn: string
  nameKm: string
  descriptionEn: string
  descriptionKm: string
  image: string
  /** Lucide icon name, resolved through `utils/icons`. */
  icon: string
  /**
   * Decides which option groups make sense for its products: drinks get
   * temperature / sugar / ice, food gets portion + its own option groups
   * (spec §15).
   */
  kind: CategoryKind
  active: boolean
  sortOrder: number
}
