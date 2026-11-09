// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { dictionaries } from '@/i18n/strings'
import { LanguageContext } from '@/features/language/languageContext'
import { mapMenuData } from '@/services/menuMapper'
import { MenuContext } from '@/store/menuContext'
import { Footer } from '@/components/common/Footer'
import { AboutPage } from './AboutPage'

function open(settings: Record<string, string>) {
  const data = mapMenuData({ settings: { shop_name_en: 'SNACA', ...settings } })

  render(
    <MenuContext value={{ status: 'ready', data, reload: vi.fn() }}>
      <LanguageContext value={{ language: 'en', t: dictionaries.en, setLanguage: vi.fn(), toggleLanguage: vi.fn() }}>
        <MemoryRouter>
          <AboutPage />
          <Footer />
        </MemoryRouter>
      </LanguageContext>
    </MenuContext>,
  )
}

afterEach(cleanup)

describe('text the shop can write', () => {
  it('uses the menu’s own wording until the shop writes some', () => {
    open({})

    // The about page and the footer say the same thing, rather than two versions.
    expect(screen.getAllByText(dictionaries.en.about.intro)).toHaveLength(2)
    expect(screen.getByText(dictionaries.en.about.menuNote)).toBeTruthy()
  })

  it('shows what the shop wrote, in both places', () => {
    open({ about_intro_en: 'Our own words.', menu_note_en: 'Order at the bar.' })

    expect(screen.getAllByText('Our own words.')).toHaveLength(2)
    expect(screen.getByText('Order at the bar.')).toBeTruthy()
    expect(screen.queryByText(dictionaries.en.about.intro)).toBeNull()
  })

  it('falls back to the other language rather than the default', () => {
    open({ about_intro_km: 'ពាក្យរបស់យើង' })

    expect(screen.getAllByText('ពាក្យរបស់យើង')).toHaveLength(2)
  })
})
