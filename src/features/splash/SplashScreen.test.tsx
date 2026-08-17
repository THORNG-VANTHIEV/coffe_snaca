// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Settings } from '@/models'
import { dictionaries } from '@/i18n/strings'
import { LanguageContext } from '@/features/language/languageContext'
import { MOTION_DURATION_MS } from '@/utils/motion'
import { SplashScreen } from './SplashScreen'

const settings: Settings = {
  shopNameEn: 'SNACA COFE',
  shopNameKm: 'ស្នាក់ការ កាហ្វេ',
  taglineEn: 'Fresh coffee, better moments.',
  taglineKm: 'កាហ្វេស្រស់ សម្រាប់ពេលវេលាដ៏ល្អរបស់អ្នក',
  logo: '/coffe_snaca/images/logo/logo.png',
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
}

function renderSplash(content: ReactNode) {
  return render(
    <LanguageContext
      value={{
        language: 'en',
        t: dictionaries.en,
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

describe('SplashScreen', () => {
  it('announces the real loading state before menu data is ready', () => {
    renderSplash(<SplashScreen />)

    expect(screen.getByRole('status').textContent).toContain('Loading the menu')
    expect(screen.queryByRole('button', { name: 'View menu' })).toBeNull()
  })

  it('shows the shop identity and lets the customer enter immediately', () => {
    const onContinue = vi.fn()
    const view = renderSplash(<SplashScreen settings={settings} onContinue={onContinue} />)

    expect(screen.getByRole('heading', { name: 'SNACA COFE' })).toBeTruthy()
    expect(screen.getByText('Fresh coffee, better moments.')).toBeTruthy()
    expect(view.container.querySelector('img')?.getAttribute('src')).toBe(settings.logo)

    fireEvent.click(screen.getByRole('button', { name: 'View menu' }))
    expect(onContinue).toHaveBeenCalledOnce()
  })

  it('finishes the welcome exit even if the browser omits the animation event', () => {
    vi.useFakeTimers()
    const onExitComplete = vi.fn()
    const view = renderSplash(
      <SplashScreen
        settings={settings}
        onContinue={vi.fn()}
        exiting
        onExitComplete={onExitComplete}
      />,
    )

    expect(view.container.querySelector('section')?.className).toContain('animate-welcome-exit')

    act(() => vi.advanceTimersByTime(MOTION_DURATION_MS.standard + 80))
    expect(onExitComplete).toHaveBeenCalledOnce()
  })
})
