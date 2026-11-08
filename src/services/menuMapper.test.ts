import { describe, expect, it } from 'vitest'
import { mapMenuData } from './menuMapper'

const withSize = (name: string) =>
  mapMenuData({
    settings: {},
    tables: [],
    categories: [],
    products: [{ id: 1, slug: 'p', category_id: 1, sizes: [{ name, price_usd: 3, price_khr: 12300 }] }],
  }).products[0]!.sizes[0]!

describe('size labels', () => {
  it('reads the conventional codes in both languages', () => {
    expect(withSize('R')).toMatchObject({ nameEn: 'Regular', nameKm: 'ធម្មតា' })
    expect(withSize('L')).toMatchObject({ nameEn: 'Large', nameKm: 'ធំ' })
  })

  /** Every food item says "Regular" outright, and it reached Khmer pages as English. */
  it('translates a size written out in full', () => {
    expect(withSize('Regular')).toMatchObject({ nameEn: 'Regular', nameKm: 'ធម្មតា' })
    expect(withSize('large')).toMatchObject({ nameEn: 'Large', nameKm: 'ធំ' })
  })

  it('leaves a size of the shop’s own naming as written', () => {
    expect(withSize('Family')).toMatchObject({ nameEn: 'Family', nameKm: 'Family' })
  })
})
