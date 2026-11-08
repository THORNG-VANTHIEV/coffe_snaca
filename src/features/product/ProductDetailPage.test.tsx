// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { dictionaries } from '@/i18n/strings'
import { LanguageContext } from '@/features/language/languageContext'
import { MenuContext } from '@/store/menuContext'
import { mapMenuData } from '@/services/menuMapper'
import { ProductDetailPage } from './ProductDetailPage'

const menu = mapMenuData({
  settings: { shop_name_en: 'SNACA', currency_usd: true, currency_khr: true },
  tables: [],
  categories: [
    { id: 1, slug: 'coffee', name_en: 'Coffee', kind: 'drink', active: true, sort_order: 1 },
    { id: 2, slug: 'lunch', name_en: 'Lunch', kind: 'food', active: true, sort_order: 2 },
  ],
  products: [
    { id: 1, slug: 'latte', category_id: 1, name_en: 'Latte', temperature: ['hot'], available: true, sizes: [{ name: 'R', price_usd: 2, price_khr: 8200 }] },
    { id: 2, slug: 'rice', category_id: 2, name_en: 'Rice', temperature: ['hot'], available: true, sizes: [{ name: 'Regular', price_usd: 3, price_khr: 12300 }] },
  ],
})

function open(slug: string) {
  render(
    <MenuContext value={{ status: 'ready', data: menu, reload: vi.fn() }}>
      <LanguageContext value={{ language: 'en', t: dictionaries.en, setLanguage: vi.fn(), toggleLanguage: vi.fn() }}>
        <MemoryRouter initialEntries={[`/menu/${slug}`]}>
          <Routes>
            <Route path="/menu/:slug" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </LanguageContext>
    </MenuContext>,
  )
}

afterEach(cleanup)

describe('drink options on the product page', () => {
  it('offers a temperature on a drink', () => {
    open('latte')
    expect(screen.queryByText(dictionaries.en.product.temperature)).toBeTruthy()
  })

  /** All 43 food items carry `temperature`, and the admin form has no field to clear it. */
  it('does not on food, even when the data carries one', () => {
    open('rice')
    expect(screen.queryByText(dictionaries.en.product.temperature)).toBeNull()
    expect(screen.queryByText(dictionaries.en.product.portion)).toBeTruthy()
  })
})
