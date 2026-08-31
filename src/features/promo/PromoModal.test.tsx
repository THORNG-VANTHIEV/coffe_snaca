// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Promotion } from '@/models'
import { dictionaries } from '@/i18n/strings'
import { LanguageContext } from '@/features/language/languageContext'
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

function renderModal(content: ReactNode, language: 'en' | 'km' = 'en') {
  return render(
    <LanguageContext
      value={{
        language,
        t: dictionaries[language],
        setLanguage: vi.fn(),
        toggleLanguage: vi.fn(),
      }}
    >
      {content}
    </LanguageContext>,
  )
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('PromoModal', () => {
  it('announces the offer as a dialog and shows it in the reader’s language', () => {
    renderModal(
      <PromoModal promotion={promotion} onClose={vi.fn()} onHold={vi.fn()} held={false} />,
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
      <PromoModal promotion={promotion} onClose={onClose} onHold={vi.fn()} held={false} />,
    )

    fireEvent.click(screen.getByRole('button', { name: dictionaries.en.promo.dismiss }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes on Escape and on the backdrop', () => {
    const onClose = vi.fn()
    renderModal(
      <PromoModal promotion={promotion} onClose={onClose} onHold={vi.fn()} held={false} />,
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
      <PromoModal promotion={promotion} onClose={onClose} onHold={vi.fn()} held={false} />,
    )

    fireEvent.click(screen.getByRole('heading', { name: promotion.titleEn }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('moves focus to the close button so it is reachable straight away', () => {
    renderModal(
      <PromoModal promotion={promotion} onClose={vi.fn()} onHold={vi.fn()} held={false} />,
    )

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: dictionaries.en.promo.dismiss }),
    )
  })

  it('pauses the countdown while the customer is reading', () => {
    const onHold = vi.fn()
    renderModal(<PromoModal promotion={promotion} onClose={vi.fn()} onHold={onHold} held={false} />)

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
    renderModal(<PromoModal promotion={promotion} onClose={onClose} onHold={vi.fn()} held />)

    act(() => {
      vi.advanceTimersByTime(PROMO_VISIBLE_MS * 3)
    })

    // The modal is presentational — the gate owns the timer — so nothing here
    // should be closing itself behind the customer's back.
    expect(onClose).not.toHaveBeenCalled()
  })
})
