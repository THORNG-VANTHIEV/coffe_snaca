import type { Category, Product } from '@/models'

/**
 * Menu search (spec §8, §43).
 *
 * Matches across both languages at once — the customer may read Khmer but
 * type "latte" — over name, description, ingredients and category name.
 */

/**
 * Folds Latin accents ("café" → "cafe") and lowercases, while leaving Khmer
 * untouched: the combining range stripped here (U+0300–U+036F) is Latin only,
 * so Khmer vowel signs and coeng survive intact.
 */
export function normalizeQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

interface IndexedProduct {
  product: Product
  name: string
  altName: string
  category: string
  description: string
  ingredients: string
}

export type SearchIndex = readonly IndexedProduct[]

export function buildSearchIndex(
  products: Product[],
  categories: Category[],
): SearchIndex {
  const categoryNames = new Map(
    categories.map((category) => [
      category.id,
      normalizeQuery(`${category.nameEn} ${category.nameKm} ${category.slug}`),
    ]),
  )

  return products.map((product) => ({
    product,
    name: normalizeQuery(product.nameEn),
    altName: normalizeQuery(product.nameKm),
    category: categoryNames.get(product.categoryId) ?? '',
    description: normalizeQuery(`${product.descriptionEn} ${product.descriptionKm}`),
    ingredients: normalizeQuery(
      [...product.ingredientsEn, ...product.ingredientsKm].join(' '),
    ),
  }))
}

/** Weighted so a name hit always outranks a passing mention in a description. */
function scoreToken(entry: IndexedProduct, token: string): number {
  let score = 0
  if (entry.name.startsWith(token)) score += 100
  else if (entry.name.includes(token)) score += 60
  if (entry.altName.includes(token)) score += 50
  if (entry.category.includes(token)) score += 25
  if (entry.ingredients.includes(token)) score += 15
  if (entry.description.includes(token)) score += 10
  return score
}

/**
 * Every whitespace-separated token must match somewhere, so "iced latte"
 * narrows the list instead of widening it.
 */
export function searchProducts(index: SearchIndex, rawQuery: string): Product[] {
  const query = normalizeQuery(rawQuery)
  if (!query) return []

  const tokens = query.split(' ')

  return index
    .map((entry) => {
      let total = 0
      for (const token of tokens) {
        const score = scoreToken(entry, token)
        if (score === 0) return null
        total += score
      }
      return { entry, total }
    })
    .filter((hit): hit is { entry: IndexedProduct; total: number } => hit !== null)
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total
      const available = Number(b.entry.product.available) - Number(a.entry.product.available)
      if (available !== 0) return available
      return a.entry.product.sortOrder - b.entry.product.sortOrder
    })
    .map((hit) => hit.entry.product)
}
