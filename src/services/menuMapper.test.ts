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

describe('exchange rate', () => {
  const rateFrom = (settings: Record<string, unknown>) =>
    mapMenuData({ settings, tables: [], categories: [], products: [] }).settings.khrPerUsd

  it('reads the rate the shop set', () => {
    expect(rateFrom({ khr_per_usd: 4000 })).toBe(4000)
  })

  /** The admin leaves the key out while the shop keeps the rate prices were first set at. */
  it('falls back to 4,100៛ when the file names no rate', () => {
    expect(rateFrom({})).toBe(4100)
  })

  /** 410 or 41000 would put every discount out by a factor of ten. */
  it('ignores a rate no shop would set', () => {
    expect(rateFrom({ khr_per_usd: 410 })).toBe(4100)
    expect(rateFrom({ khr_per_usd: 41000 })).toBe(4100)
    expect(rateFrom({ khr_per_usd: 'abc' })).toBe(4100)
  })
})
