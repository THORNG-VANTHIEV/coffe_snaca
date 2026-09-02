import { describe, expect, it } from 'vitest'
import type { Product, Promotion } from '@/models'
import {
  activeDiscount,
  discountPrice,
  getDiscountedProducts,
  isPromotionLive,
  isValidPercent,
  shopToday,
} from './promotion'

const promotion = (overrides: Partial<Promotion> = {}): Promotion => ({
  titleEn: 'Rainy season offer',
  titleKm: 'ការបញ្ចុះតម្លៃរដូវវស្សា',
  textEn: '',
  textKm: '',
  image: '',
  startsAt: '',
  endsAt: '',
  timezone: 'Asia/Phnom_Penh',
  ...overrides,
})

describe('discountPrice', () => {
  /**
   * The same worked examples as the admin's PromotionTest. If either side
   * changes, these numbers are what catches it — and the riel figures are the
   * ones scripts/validate-data.mjs would reject if the rule ever drifted.
   */
  it('derives riel from the discounted dollars at the fixed rate', () => {
    // $2.25 − 20% = $1.80 → 1.80 x 4100 = 7,380 → up to 7,400
    expect(discountPrice({ usd: 2.25, khr: 9300 }, 20)).toEqual({ usd: 1.8, khr: 7400 })

    // $2.70 − 20% = $2.16 → 2.16 x 4100 = 8,856 → up to 8,900
    expect(discountPrice({ usd: 2.7, khr: 11100 }, 20)).toEqual({ usd: 2.16, khr: 8900 })

    // $3.00 − 15% = $2.55 → 2.55 x 4100 = 10,455 → up to 10,500
    expect(discountPrice({ usd: 3, khr: 12300 }, 15)).toEqual({ usd: 2.55, khr: 10500 })
  })

  it('rounds the discounted dollars to the cent', () => {
    // 2.25 * 0.8 is 1.8000000000000003 in binary floating point, and the riel
    // figure is derived from this number — so it must be money first.
    expect(discountPrice({ usd: 2.25, khr: 9300 }, 20).usd).toBe(1.8)
    expect(discountPrice({ usd: 1.99, khr: 8200 }, 33).usd).toBe(1.33)
  })

  it('leaves a price alone when the percentage is not usable', () => {
    const price = { usd: 2.25, khr: 9300 }

    expect(discountPrice(price, 0)).toBe(price)
    expect(discountPrice(price, 91)).toBe(price)
    expect(discountPrice(price, Number.NaN)).toBe(price)
  })

  it('leaves a free item free', () => {
    expect(discountPrice({ usd: 0, khr: 0 }, 20)).toEqual({ usd: 0, khr: 0 })
  })
})

describe('isValidPercent', () => {
  it('accepts 1 to 90 and nothing else', () => {
    expect(isValidPercent(1)).toBe(true)
    expect(isValidPercent(90)).toBe(true)
    expect(isValidPercent(0)).toBe(false)
    expect(isValidPercent(91)).toBe(false)
  })
})

describe('shopToday', () => {
  it('answers in the shop’s timezone, not the device’s', () => {
    // 22:00 UTC is already the next day in Phnom Penh (UTC+7).
    const lateUtc = new Date('2026-09-01T22:00:00Z')

    expect(shopToday('Asia/Phnom_Penh', lateUtc)).toBe('2026-09-02')
    expect(shopToday('UTC', lateUtc)).toBe('2026-09-01')
  })

  it('falls back to the device day rather than throwing on a bad timezone', () => {
    expect(shopToday('Not/AZone', new Date('2026-09-01T12:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('isPromotionLive', () => {
  const inside = new Date('2026-09-03T04:00:00Z') // 11:00 in Phnom Penh

  it('is not live without a promotion', () => {
    expect(isPromotionLive(null, inside)).toBe(false)
  })

  it('runs unbounded when neither date is set', () => {
    expect(isPromotionLive(promotion(), inside)).toBe(true)
  })

  it('includes both the first and the last day', () => {
    const window = promotion({ startsAt: '2026-09-03', endsAt: '2026-09-03' })

    expect(isPromotionLive(window, inside)).toBe(true)
  })

  it('has not started the day before, and has finished the day after', () => {
    const window = promotion({ startsAt: '2026-09-03', endsAt: '2026-09-05' })

    expect(isPromotionLive(window, new Date('2026-09-02T04:00:00Z'))).toBe(false)
    expect(isPromotionLive(window, new Date('2026-09-06T04:00:00Z'))).toBe(false)
  })

  /** The whole reason the dates ship to the browser instead of being applied
      at publish time: the campaign opens and closes without a republish. */
  it('opens on its own day with no republish', () => {
    const scheduled = promotion({ startsAt: '2026-09-05' })

    expect(isPromotionLive(scheduled, new Date('2026-09-04T23:00:00Z'))).toBe(true) // already the 5th in Cambodia
    expect(isPromotionLive(scheduled, new Date('2026-09-04T10:00:00Z'))).toBe(false)
  })
})

describe('activeDiscount', () => {
  it('is zero while the campaign is not running, whatever the product says', () => {
    expect(activeDiscount({ promoPercent: 20 }, { promo: null })).toBe(0)

    const finished = promotion({ endsAt: '2026-08-01' })
    expect(
      activeDiscount({ promoPercent: 20 }, { promo: finished }, new Date('2026-09-03T04:00:00Z')),
    ).toBe(0)
  })

  it('is the product’s percentage while the campaign is running', () => {
    expect(
      activeDiscount(
        { promoPercent: 20 },
        { promo: promotion() },
        new Date('2026-09-03T04:00:00Z'),
      ),
    ).toBe(20)
  })

  it('is zero for a product with no discount during a live campaign', () => {
    expect(
      activeDiscount({ promoPercent: 0 }, { promo: promotion() }, new Date('2026-09-03T04:00:00Z')),
    ).toBe(0)
  })
})

describe('getDiscountedProducts', () => {
  const product = (overrides: Partial<Product>): Product =>
    ({
      id: 1,
      slug: 'x',
      categoryId: 1,
      alsoInCategoryIds: [],
      nameEn: 'X',
      nameKm: '',
      descriptionEn: '',
      descriptionKm: '',
      image: '',
      ingredientsEn: [],
      ingredientsKm: [],
      sizes: [],
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
      sortOrder: 1,
      ...overrides,
    }) as Product

  const live = { promo: promotion() }
  const now = new Date('2026-09-03T04:00:00Z')

  it('is empty while the campaign is not running, whatever the products say', () => {
    expect(getDiscountedProducts([product({ promoPercent: 20 })], { promo: null }, now)).toEqual([])
  })

  it('lists only the discounted ones, deepest cut first', () => {
    const result = getDiscountedProducts(
      [
        product({ id: 1, promoPercent: 10 }),
        product({ id: 2, promoPercent: 0 }),
        product({ id: 3, promoPercent: 30 }),
      ],
      live,
      now,
    )

    expect(result.map((p) => p.id)).toEqual([3, 1])
  })

  /** A discount on something nobody can buy is not an offer. */
  it('leaves out a sold-out product', () => {
    const result = getDiscountedProducts(
      [product({ id: 1, promoPercent: 25, available: false })],
      live,
      now,
    )

    expect(result).toEqual([])
  })
})
