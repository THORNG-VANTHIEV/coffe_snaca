// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import type { Settings } from '@/models'
import { STORAGE_KEYS } from '@/utils/storage'
import { PROMO_VISIBLE_MS, usePromoGate } from './usePromoGate'

const settings = (promoOverrides: Record<string, string> | null = {}): Settings => ({
  shopNameEn: 'SNACA CAFE',
  shopNameKm: 'ស្នាក់ការ កាហ្វេ',
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
  defaultLanguage: 'en',
  showUnavailableProducts: true,
  facebook: '',
  telegram: '',
  promo:
    promoOverrides === null
      ? null
      : {
          titleEn: 'Rainy season offer',
          titleKm: 'ការបញ្ចុះតម្លៃរដូវវស្សា',
          textEn: '',
          textKm: '',
          image: '',
          startsAt: '',
          endsAt: '',
          timezone: 'Asia/Phnom_Penh',
          ...promoOverrides,
        },
})

beforeEach(() => {
  window.sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('usePromoGate', () => {
  it('opens the offer once the menu is ready', () => {
    const { result } = renderHook(() => usePromoGate(settings(), true))

    expect(result.current.promotion).not.toBeNull()
  })

  /** The splash owns the screen first; two overlays at once is one too many. */
  it('stays shut while the welcome screen is still up', () => {
    const { result } = renderHook(() => usePromoGate(settings(), false))

    expect(result.current.promotion).toBeNull()
    expect(window.sessionStorage.getItem(STORAGE_KEYS.promoSeen)).toBeNull()
  })

  it('does nothing when the shop has no promotion', () => {
    const { result } = renderHook(() => usePromoGate(settings(null), true))

    expect(result.current.promotion).toBeNull()
  })

  it('does nothing when the campaign is outside its dates', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-10T04:00:00Z'))

    const { result } = renderHook(() =>
      usePromoGate(settings({ startsAt: '2026-09-01', endsAt: '2026-09-05' }), true),
    )

    expect(result.current.promotion).toBeNull()
  })

  it('closes itself after three seconds', () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => usePromoGate(settings(), true))
    expect(result.current.promotion).not.toBeNull()

    act(() => {
      vi.advanceTimersByTime(PROMO_VISIBLE_MS - 1)
    })
    expect(result.current.promotion).not.toBeNull()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.promotion).toBeNull()
  })

  it('holds the countdown open while the customer is reading', () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => usePromoGate(settings(), true))

    act(() => {
      result.current.hold(true)
    })
    act(() => {
      vi.advanceTimersByTime(PROMO_VISIBLE_MS * 5)
    })

    expect(result.current.promotion).not.toBeNull()

    // Letting go starts a fresh three seconds rather than closing at once.
    act(() => {
      result.current.hold(false)
    })
    act(() => {
      vi.advanceTimersByTime(PROMO_VISIBLE_MS)
    })

    expect(result.current.promotion).toBeNull()
  })

  it('closes on request, before the timer', () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => usePromoGate(settings(), true))

    act(() => {
      result.current.close()
    })

    expect(result.current.promotion).toBeNull()
  })

  /**
   * The offer is an announcement, not a wall. Once it has been shown it must
   * not reappear on the next page — which is why it is marked seen as it
   * opens rather than as it closes.
   */
  it('shows once per visit, even if the customer navigates away mid-offer', () => {
    const first = renderHook(() => usePromoGate(settings(), true))
    expect(first.result.current.promotion).not.toBeNull()
    expect(window.sessionStorage.getItem(STORAGE_KEYS.promoSeen)).toBe('1')

    first.unmount()

    const second = renderHook(() => usePromoGate(settings(), true))
    expect(second.result.current.promotion).toBeNull()
  })
})
