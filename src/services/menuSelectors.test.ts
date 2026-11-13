import { describe, expect, it } from 'vitest'
import type { Product, Temperature } from '@/models'
import { filterByTemperature } from './menuSelectors'

const product = (id: number, temperature: Temperature[]): Product =>
  ({
    id,
    slug: `product-${id}`,
    categoryId: 1,
    alsoInCategoryIds: [],
    nameEn: `Product ${id}`,
    nameKm: '',
    descriptionEn: '',
    descriptionKm: '',
    image: '',
    ingredientsEn: [],
    ingredientsKm: [],
    sizes: [],
    temperature,
    sugarLevels: [],
    iceLevels: [],
    extras: [],
    options: [],
    promoPercent: 0,
    available: true,
    bestSeller: false,
    recommended: false,
    featured: false,
    sortOrder: id,
  }) as Product

describe('filterByTemperature', () => {
  const hotLatte = product(1, ['hot'])
  const icedLatte = product(2, ['iced'])
  const eitherWay = product(3, ['hot', 'iced'])
  const friedRice = product(4, [])
  const menu = [hotLatte, icedLatte, eitherWay, friedRice]

  it('keeps the whole menu, food included, when no temperature is chosen', () => {
    expect(filterByTemperature(menu, null)).toEqual(menu)
  })

  it('keeps only drinks served at the chosen temperature, in menu order', () => {
    expect(filterByTemperature(menu, 'hot')).toEqual([hotLatte, eitherWay])
    expect(filterByTemperature(menu, 'iced')).toEqual([icedLatte, eitherWay])
  })
})
