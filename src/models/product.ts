import type { Price } from './common'

export type Temperature = 'hot' | 'iced'
export type IceLevel = 'none' | 'less' | 'normal' | 'extra'

/** One purchasable size/portion with its own price in both currencies. */
export interface ProductSize {
  /** Short code shown on the chip: "S", "M", "L", "Regular"… */
  code: string
  nameEn: string
  nameKm: string
  price: Price
}

/** A paid add-on. Informational in version 1 — nothing is orderable. */
export interface ProductExtra {
  nameEn: string
  nameKm: string
  price: Price
}

export interface ProductOptionValue {
  nameEn: string
  nameKm: string
}

/**
 * A free-form option group, so food products are never forced through the
 * coffee-shaped temperature/sugar/ice fields (spec §15).
 */
export interface ProductOptionGroup {
  key: string
  nameEn: string
  nameKm: string
  values: ProductOptionValue[]
}

export interface Product {
  id: number
  slug: string
  categoryId: number

  nameEn: string
  nameKm: string
  descriptionEn: string
  descriptionKm: string

  image: string

  ingredientsEn: string[]
  ingredientsKm: string[]

  sizes: ProductSize[]

  /** Drink-only fields; empty arrays on food products. */
  temperature: Temperature[]
  sugarLevels: number[]
  iceLevels: IceLevel[]

  extras: ProductExtra[]
  /** Per-product option groups (spice level, portion style, …). */
  options: ProductOptionGroup[]

  available: boolean
  bestSeller: boolean
  recommended: boolean
  featured: boolean
  sortOrder: number
}

/**
 * Cheapest size — what the card shows as the "from" price. Returns undefined
 * only if a product somehow ships with no sizes at all.
 */
export function getStartingSize(product: Product): ProductSize | undefined {
  return product.sizes.reduce<ProductSize | undefined>((cheapest, size) => {
    if (!cheapest || size.price.usd < cheapest.price.usd) return size
    return cheapest
  }, undefined)
}

export function hasDrinkOptions(product: Product): boolean {
  return (
    product.temperature.length > 0 ||
    product.sugarLevels.length > 0 ||
    product.iceLevels.length > 0
  )
}
