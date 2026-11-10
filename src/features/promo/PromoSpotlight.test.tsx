// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Category, Product, Promotion, Settings } from '@/models'
import { dictionaries } from '@/i18n/strings'
import { LanguageContext } from '@/features/language/languageContext'
import { MenuContext } from '@/store/menuContext'
import { PromoSpotlight } from './PromoSpotlight'

const live: Promotion = {
  titleEn: 'Rainy season offer',
  titleKm: 'ការបញ្ចុះតម្លៃរដូវវស្សា',
  textEn: 'Our house coffees, this week only.',
  textKm: '',
  image: '',
  startsAt: '',
  endsAt: '',
  timezone: 'Asia/Phnom_Penh',
}

const settings = (promo: Promotion | null): Settings =>
  ({
    shopNameEn: 'SNACA CAFE',
    shopNameKm: '',
    taglineEn: '',
    taglineKm: '',
    logo: '',
    heroImages: [],
    phone: '',
    addressEn: '',
    addressKm: '',
    openingHoursEn: '',
    openingHoursKm: '',
    currencyUsd: true,
    currencyKhr: true,
    khrPerUsd: 4100,
    defaultLanguage: 'en',
    showUnavailableProducts: true,
    facebook: '',
    telegram: '',
    aboutIntroEn: '',
    aboutIntroKm: '',
    menuNoteEn: '',
    menuNoteKm: '',
    promo,
  }) as Settings

const product = (overrides: Partial<Product>): Product =>
  ({
    id: 1,
    slug: 'snaca-edition',
    categoryId: 1,
    alsoInCategoryIds: [],
    nameEn: 'Snaca Edition',
    nameKm: '',
    descriptionEn: '',
    descriptionKm: '',
    image: '',
    ingredientsEn: [],
    ingredientsKm: [],
    sizes: [{ code: 'R', nameEn: 'Regular', nameKm: '', price: { usd: 2.25, khr: 9300 } }],
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

// Products only reach the page through an active category.
const coffee = {
  id: 1,
  slug: 'coffee',
  nameEn: 'Coffee',
  nameKm: '',
  descriptionEn: '',
  descriptionKm: '',
  image: '',
  icon: 'coffee',
  kind: 'drink',
  active: true,
  sortOrder: 1,
} as Category

function renderSpotlight(promo: Promotion | null, products: Product[]) {
  return render(
    <MenuContext
      value={{
        status: 'ready',
        data: { settings: settings(promo), tables: [], categories: [coffee], products },
        reload: vi.fn(),
      }}
    >
      <LanguageContext
        value={{ language: 'en', t: dictionaries.en, setLanguage: vi.fn(), toggleLanguage: vi.fn() }}
      >
        <MemoryRouter>
          <PromoSpotlight />
        </MemoryRouter>
      </LanguageContext>
    </MenuContext>,
  )
}

afterEach(cleanup)

describe('PromoSpotlight', () => {
  /** The pop-up leaves after three seconds; this is how a customer finds the offer again. */
  it('keeps the running offer on the home page with its discounted products', () => {
    renderSpotlight(live, [
      product({ id: 1, nameEn: 'Iced Latte', slug: 'iced-latte', promoPercent: 20 }),
      product({ id: 2, nameEn: 'Hot Mocha', slug: 'hot-mocha', promoPercent: 30 }),
      product({ id: 3, nameEn: 'Full Price', slug: 'full-price' }),
    ])

    const section = screen.getByRole('region', { name: live.titleEn })
    expect(section.id).toBe('home-promo')

    expect(screen.getByText('Iced Latte')).toBeTruthy()
    expect(screen.getByText('Hot Mocha')).toBeTruthy()
    expect(screen.queryByText('Full Price')).toBeNull()

    // The deepest cut, spelled out for screen readers as well as drawn.
    expect(screen.getByText('Up to 30% off')).toBeTruthy()
  })

  it('does not say "up to" about a single discount', () => {
    renderSpotlight(live, [product({ promoPercent: 20 })])

    expect(screen.getByText('20% off')).toBeTruthy()
    expect(screen.queryByText(dictionaries.en.promo.upToShort)).toBeNull()
  })

  it('is absent between campaigns', () => {
    const view = renderSpotlight(null, [product({ promoPercent: 20 })])

    expect(view.container.innerHTML).toBe('')
  })

  /** A banner announcing an offer that changes no price would be worse than none. */
  it('is absent when the campaign runs but nothing is discounted', () => {
    const view = renderSpotlight(live, [product({})])

    expect(view.container.innerHTML).toBe('')
  })
})
