import type { Category, MenuData, Product, Table } from '@/models'

/**
 * Pure read models derived from the loaded menu. Pages compose these instead
 * of filtering arrays inline, so the ordering and visibility rules live in
 * exactly one place.
 */

export function getActiveCategories(menu: MenuData): Category[] {
  return menu.categories.filter((category) => category.active)
}

/**
 * Every product the customer is allowed to see. Categories that are switched
 * off take their products with them, and sold-out items are dropped entirely
 * when the shop prefers to hide them (spec §16, §23).
 *
 * Ordering is category first, then the product's own `sort_order` — so the
 * full menu reads as coffee, then tea, then food, and the owner can number
 * each category from 1 without thinking about the others. Sold-out items sink
 * to the bottom of their own category rather than the bottom of the menu.
 */
export function getVisibleProducts(menu: MenuData): Product[] {
  const categories = getActiveCategories(menu)
  const categoryOrder = new Map(categories.map((category) => [category.id, category.sortOrder]))

  return menu.products
    .filter((product) => categoryOrder.has(product.categoryId))
    .filter((product) => menu.settings.showUnavailableProducts || product.available)
    .sort((a, b) => {
      const categoryDelta =
        (categoryOrder.get(a.categoryId) ?? 0) - (categoryOrder.get(b.categoryId) ?? 0)
      if (categoryDelta !== 0) return categoryDelta
      if (a.available !== b.available) return a.available ? -1 : 1
      return a.sortOrder - b.sortOrder || a.id - b.id
    })
}

export function getProductsByCategory(products: Product[], categoryId: number): Product[] {
  return products.filter((product) => product.categoryId === categoryId)
}

export function getBestSellers(products: Product[]): Product[] {
  return products.filter((product) => product.bestSeller)
}

export function getRecommended(products: Product[]): Product[] {
  return products.filter((product) => product.recommended)
}

export function findProductBySlug(products: Product[], slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function findCategoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  return categories.find((category) => category.slug === slug)
}

/** Indexed lookup for cards that need to name their category. */
export function indexCategoriesById(categories: Category[]): Map<number, Category> {
  return new Map(categories.map((category) => [category.id, category]))
}

/**
 * Validates `?table=05` against the table list. An unknown or disabled table
 * resolves to nothing, and the UI simply drops the table line (spec §21).
 */
export function findActiveTable(tables: Table[], number: string | null): Table | undefined {
  if (!number) return undefined
  return tables.find((table) => table.active && table.number === number)
}

/** "You May Also Like" — same category, current product excluded (spec §61). */
export function getRelatedProducts(
  products: Product[],
  current: Product,
  limit = 6,
): Product[] {
  return products
    .filter(
      (product) => product.categoryId === current.categoryId && product.id !== current.id,
    )
    .slice(0, limit)
}
