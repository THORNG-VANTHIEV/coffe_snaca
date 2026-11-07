// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Product, Promotion } from '@/models'
import { dictionaries } from '@/i18n/strings'
import { LanguageContext } from '@/features/language/languageContext'
import { MenuContext } from '@/store/menuContext'
import { MemoryRouter } from 'react-router-dom'
import { PromoModal } from './PromoModal'
import { PROMO_VISIBLE_MS } from './usePromoGate'

const promotion: Promotion = {
  titleEn: 'Rainy season offer',
  titleKm: 'ការបញ្ចុះតម្លៃរដូវវស្សា',
  textEn: '20% off our house coffees.',
  textKm: 'បញ្ចុះតម្លៃ ២០% លើកាហ្វេផ្ទះ។',
  image: '',
  startsAt: '',
  endsAt: '',
  timezone: 'Asia/Phnom_Penh',
}

const settings = {
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
  defaultLanguage: 'en' as const,
  showUnavailableProducts: true,
  facebook: '',
  telegram: '',
  promo: null,
}

/**
 * The pop-up now links to products and prints prices, so it needs a router
 * and the menu around it — the two things those bring.
 */
function renderModal(content: ReactNode, language: 'en' | 'km' = 'en') {
  return render(
    <MenuContext
      value={{
        status: 'ready',
        data: { settings, tables: [], categories: [], products: [] },
        reload: vi.fn(),
      }}
    >
      <LanguageContext
        value={{
          language,
          t: dictionaries[language],
          setLanguage: vi.fn(),
          toggleLanguage: vi.fn(),
        }}
      >
        <MemoryRouter>{content}</MemoryRouter>
      </LanguageContext>
    </MenuContext>,
  )
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('PromoModal', () => {
  it('announces the offer as a dialog and shows it in the reader’s language', () => {
    renderModal(
      <PromoModal promotion={promotion} products={[]} onClose={vi.fn()} onHold={vi.fn()} />,
      'km',
    )

    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true')
    expect(screen.getByRole('heading', { name: promotion.titleKm })).toBeTruthy()
    expect(screen.getByText(promotion.textKm)).toBeTruthy()
  })

  /** The three-second timer is a convenience; this is the guaranteed way out. */
  it('closes on the close button', () => {
    const onClose = vi.fn()
    renderModal(
      <PromoModal promotion={promotion} products={[]} onClose={onClose} onHold={vi.fn()} />,
    )

    fireEvent.click(screen.getByRole('button', { name: dictionaries.en.promo.dismiss }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes on Escape and on the backdrop', () => {
    const onClose = vi.fn()
    renderModal(
      <PromoModal promotion={promotion} products={[]} onClose={onClose} onHold={vi.fn()} />,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  /** A tap meant for the offer must not fall through and dismiss it. */
  it('does not close when the card itself is clicked', () => {
    const onClose = vi.fn()
    renderModal(
      <PromoModal promotion={promotion} products={[]} onClose={onClose} onHold={vi.fn()} />,
    )

    fireEvent.click(screen.getByRole('heading', { name: promotion.titleEn }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('moves focus to the close button so it is reachable straight away', () => {
    renderModal(
      <PromoModal promotion={promotion} products={[]} onClose={vi.fn()} onHold={vi.fn()} />,
    )

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: dictionaries.en.promo.dismiss }),
    )
  })

  it('pauses the countdown while the customer is reading', () => {
    const onHold = vi.fn()
    renderModal(<PromoModal promotion={promotion} products={[]} onClose={vi.fn()} onHold={onHold} />)

    const card = screen.getByRole('heading', { name: promotion.titleEn }).closest('div')!
      .parentElement!

    fireEvent.mouseEnter(card)
    expect(onHold).toHaveBeenLastCalledWith(true)

    fireEvent.mouseLeave(card)
    expect(onHold).toHaveBeenLastCalledWith(false)
  })

  it('hides a banner image from assistive technology — the headline carries it', () => {
    const view = renderModal(
      <PromoModal
        promotion={{ ...promotion, image: '/images/promo/x.webp' }}
        products={[]}
        onClose={vi.fn()}
        onHold={vi.fn()}
       
      />,
    )

    const image = view.container.querySelector('img')!
    expect(image.getAttribute('src')).toBe('/images/promo/x.webp')
    expect(image.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('how it sits on the screen', () => {
  it('is centred, not anchored to the bottom of the phone', () => {
    renderModal(<PromoModal promotion={promotion} products={[]} onClose={vi.fn()} onHold={vi.fn()} />)

    const backdrop = screen.getByRole('dialog').className

    expect(backdrop).toContain('place-items-center')
    expect(backdrop).not.toContain('place-items-end')
  })

  /** The shop asked for the meter to go; the three seconds stay. */
  it('draws no countdown bar', () => {
    const view = renderModal(
      <PromoModal promotion={promotion} products={[]} onClose={vi.fn()} onHold={vi.fn()} />,
    )

    expect(view.container.querySelector('[style*="promo-countdown"]')).toBeNull()
    expect(view.container.innerHTML).not.toContain('promo-countdown')
  })

  it('grows a step with the screen instead of sitting at one width', () => {
    const view = renderModal(
      <PromoModal promotion={promotion} products={[]} onClose={vi.fn()} onHold={vi.fn()} />,
    )

    const card = view.container.querySelector('[role="dialog"] > div')!

    expect(card.className).toContain('max-w-sm')
    expect(card.className).toContain('sm:max-w-md')
  })

  /** Centred and carrying a list, it must not run off a short screen. */
  it('scrolls inside itself rather than off the top', () => {
    const view = renderModal(
      <PromoModal promotion={promotion} products={[]} onClose={vi.fn()} onHold={vi.fn()} />,
    )

    const card = view.container.querySelector('[role="dialog"] > div')!

    expect(card.className).toContain('overflow-y-auto')

    // dvh, not vh: a phone browser's toolbar slides away, and vh would
    // measure the taller viewport and let the card run under it.
    expect(card.className).toContain('max-h-[85dvh]')
  })
})

describe('the promotion countdown', () => {
  it('says nothing when the offer has no end date', () => {
    renderModal(<PromoModal promotion={promotion} products={[]} onClose={vi.fn()} onHold={vi.fn()} />)

    expect(screen.queryByText(dictionaries.en.promo.endsToday)).toBeNull()
    expect(screen.queryByText(/days left/)).toBeNull()
  })

  it('names the last day rather than counting zero', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-03T04:00:00Z'))

    renderModal(
      <PromoModal
        promotion={{ ...promotion, endsAt: '2026-09-03' }}
        products={[]}
        onClose={vi.fn()}
        onHold={vi.fn()}
      />,
    )

    expect(screen.getByText(dictionaries.en.promo.endsToday)).toBeTruthy()
  })

  it('counts the days that remain', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-03T04:00:00Z'))

    renderModal(
      <PromoModal
        promotion={{ ...promotion, endsAt: '2026-09-08' }}
        products={[]}
        onClose={vi.fn()}
        onHold={vi.fn()}
      />,
    )

    expect(screen.getByText('5 days left')).toBeTruthy()
  })
})

describe('the three-second window', () => {
  it('is the documented duration', () => {
    expect(PROMO_VISIBLE_MS).toBe(3000)
  })

  it('never closes itself — the gate owns the timer', () => {
    vi.useFakeTimers()

    const onClose = vi.fn()
    renderModal(<PromoModal promotion={promotion} products={[]} onClose={onClose} onHold={vi.fn()} />)

    act(() => {
      vi.advanceTimersByTime(PROMO_VISIBLE_MS * 3)
    })

    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('the offer itself', () => {
  const discounted = (overrides: Partial<Product>): Product =>
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
      promoPercent: 25,
      available: true,
      bestSeller: false,
      recommended: false,
      featured: false,
      sortOrder: 1,
      ...overrides,
    }) as Product

  /**
   * A headline is whatever the shop had time to type — often a single word.
   * The pop-up has to carry the thing being offered, or it announces nothing.
   */
  it('names the discounted products and what they now cost', () => {
    renderModal(
      <PromoModal
        promotion={promotion}
        products={[discounted({})]}
        onClose={vi.fn()}
        onHold={vi.fn()}
      />,
    )

    expect(screen.getByText('Snaca Edition')).toBeTruthy()

    // $2.25 − 25% = $1.69, the old price struck beside it. The card is too
    // narrow for both currencies twice over, so it carries the first one.
    expect(screen.getByText('$1.69')).toBeTruthy()
    expect(screen.getByText('$2.25').tagName).toBe('S')
  })

  /** The one number worth reading first, stamped on the banner. */
  it('stamps the deepest discount on the banner', () => {
    renderModal(
      <PromoModal
        promotion={promotion}
        products={[discounted({ id: 1, promoPercent: 10 }), discounted({ id: 2, slug: 'b', promoPercent: 30 })]}
        onClose={vi.fn()}
        onHold={vi.fn()}
      />,
    )

    expect(screen.getByText(dictionaries.en.promo.upToShort)).toBeTruthy()
    // Once on the banner, once on the product carrying it.
    expect(screen.getAllByText('−30%')).toHaveLength(2)
  })

  it('carries six to swipe through, then hands over to the home page', () => {
    const many = [1, 2, 3, 4, 5, 6, 7].map((id) =>
      discounted({ id, slug: `p-${id}`, nameEn: `Product ${id}` }),
    )
    const onClose = vi.fn()

    renderModal(
      <PromoModal promotion={promotion} products={many} onClose={onClose} onHold={vi.fn()} />,
    )

    expect(screen.getByText('Product 6')).toBeTruthy()
    expect(screen.queryByText('Product 7')).toBeNull()

    const seeAll = screen.getByRole('link', { name: dictionaries.en.promo.viewOffers })
    expect(seeAll.getAttribute('href')).toBe('/#home-promo')

    fireEvent.click(seeAll)
    expect(onClose).toHaveBeenCalled()
  })

  /** Tapping an item is a decision; it should take you there, not leave the
      offer sitting over the product you just chose. */
  it('closes when an item is followed', () => {
    const onClose = vi.fn()

    renderModal(
      <PromoModal
        promotion={promotion}
        products={[discounted({})]}
        onClose={onClose}
        onHold={vi.fn()}
       
      />,
    )

    fireEvent.click(screen.getByText('Snaca Edition'))
    expect(onClose).toHaveBeenCalled()
  })
})
