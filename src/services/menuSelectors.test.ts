import { describe, expect, it } from 'vitest'
import type { Category, MenuData, Product, Settings } from '@/models'
import { getVisibleProducts } from './menuSelectors'

const category = (id: number, manualOrder: boolean): Category => ({
  id,
  slug: `category-${id}`,
  nameEn: `Category ${id}`,
  nameKm: '',
  descriptionEn: '',
  descriptionKm: '',
  image: '',
  icon: 'coffee',
  kind: 'drink',
  active: true,
  sortOrder: id,
  manualOrder,
})

const product = (
  id: number,
  categoryId: number,
  sortOrder: number,
  usd: number,
  overrides: Partial<Product> = {},
): Product =>
  ({
    id,
    slug: `product-${id}`,
    categoryId,
    alsoInCategoryIds: [],
    nameEn: `Product ${id}`,
    nameKm: '',
    descriptionEn: '',
    descriptionKm: '',
    image: '',
    ingredientsEn: [],
    ingredientsKm: [],
    sizes: [{ code: 'R', nameEn: 'Regular', nameKm: '', price: { usd, khr: usd * 4100 } }],
    temperature: [],
    sugarLevels: [],
    iceLevels: [],
    extras: [],
    options: [],
    promoPercent: 0,
    available: true,
    bestSeller: false,
    recommended: false,
    featured: false,
    sortOrder,
    ...overrides,
  }) as Product

const menu = (categories: Category[], products: Product[]): MenuData => ({
  settings: { showUnavailableProducts: true } as Settings,
  tables: [],
  categories,
  products,
})

const ids = (products: Product[]) => products.map((p) => p.id)

describe('getVisibleProducts ordering inside a category', () => {
  // A cheap coffee placed first, a pricier tea placed second, and a best
  // seller placed last.
  const items = (categoryId: number) => [
    product(1, categoryId, 1, 1.5),
    product(2, categoryId, 2, 2.5),
    product(3, categoryId, 3, 2.0, { bestSeller: true }),
  ]

  it('ranks by badge, then dearest first, by default', () => {
    expect(ids(getVisibleProducts(menu([category(1, false)], items(1))))).toEqual([3, 2, 1])
  })

  it('keeps the shop’s own order when the category asks for it', () => {
    expect(ids(getVisibleProducts(menu([category(1, true)], items(1))))).toEqual([1, 2, 3])
  })

  it('still sinks sold-out items to the bottom of a hand-ordered category', () => {
    const products = items(1).map((p) => (p.id === 1 ? { ...p, available: false } : p))

    expect(ids(getVisibleProducts(menu([category(1, true)], products)))).toEqual([2, 3, 1])
  })
})
