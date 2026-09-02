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
      <PromoModal promotion={promotion} products={[]} onClose={vi.fn()} onHold={vi.fn()} held={false} />,
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
      <PromoModal promotion={promotion} products={[]} onClose={onClose} onHold={vi.fn()} held={false} />,
    )

    fireEvent.click(screen.getByRole('button', { name: dictionaries.en.promo.dismiss }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes on Escape and on the backdrop', () => {
    const onClose = vi.fn()
    renderModal(
      <PromoModal promotion={promotion} products={[]} onClose={onClose} onHold={vi.fn()} held={false} />,
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
      <PromoModal promotion={promotion} products={[]} onClose={onClose} onHold={vi.fn()} held={false} />,
    )

    fireEvent.click(screen.getByRole('heading', { name: promotion.titleEn }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('moves focus to the close button so it is reachable straight away', () => {
    renderModal(
      <PromoModal promotion={promotion} products={[]} onClose={vi.fn()} onHold={vi.fn()} held={false} />,
    )

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: dictionaries.en.promo.dismiss }),
    )
  })

  it('pauses the countdown while the customer is reading', () => {
    const onHold = vi.fn()
    renderModal(<PromoModal promotion={promotion} products={[]} onClose={vi.fn()} onHold={onHold} held={false} />)

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
        held={false}
      />,
    )

    const image = view.container.querySelector('img')!
    expect(image.getAttribute('src')).toBe('/images/promo/x.webp')
    expect(image.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('the three-second window', () => {
  it('is the documented duration', () => {
    expect(PROMO_VISIBLE_MS).toBe(3000)
  })

  it('lets the customer read on when they are still holding it', () => {
    vi.useFakeTimers()

    const onClose = vi.fn()
    renderModal(<PromoModal promotion={promotion} products={[]} onClose={onClose} onHold={vi.fn()} held />)

    act(() => {
      vi.advanceTimersByTime(PROMO_VISIBLE_MS * 3)
    })

    // The modal is presentational — the gate owns the timer — so nothing here
    // should be closing itself behind the customer's back.
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
        held={false}
      />,
    )

    expect(screen.getByText('Snaca Edition')).toBeTruthy()
    expect(screen.getByText('−25%')).toBeTruthy()

    // The old price is struck through as one run of text — PriceDisplay joins
    // the two currencies before striking them, so it is not its own node.
    expect(screen.getByText(/\$2\.25/)).toBeTruthy()

    // $2.25 − 25% = $1.69, and riel follows from that, not from 9,300.
    expect(screen.getByText('$1.69')).toBeTruthy()
    expect(screen.getByText('7,000៛')).toBeTruthy()
  })

  it('shows at most three, so it stays a pop-up and not a menu', () => {
    const many = [1, 2, 3, 4, 5].map((id) =>
      discounted({ id, slug: `p-${id}`, nameEn: `Product ${id}` }),
    )

    renderModal(
      <PromoModal
        promotion={promotion}
        products={many}
        onClose={vi.fn()}
        onHold={vi.fn()}
        held={false}
      />,
    )

    expect(screen.getByText('Product 1')).toBeTruthy()
    expect(screen.queryByText('Product 4')).toBeNull()
    expect(screen.getByText(dictionaries.en.promo.andMore)).toBeTruthy()
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
        held={false}
      />,
    )

    fireEvent.click(screen.getByText('Snaca Edition'))
    expect(onClose).toHaveBeenCalled()
  })
})
