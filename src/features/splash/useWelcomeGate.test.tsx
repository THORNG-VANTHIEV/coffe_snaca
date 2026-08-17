// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEYS } from '@/utils/storage'
import { useWelcomeGate } from './useWelcomeGate'

beforeEach(() => {
  window.sessionStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('useWelcomeGate', () => {
  it('stays open until the customer chooses to view the menu', () => {
    const { result } = renderHook(() => useWelcomeGate())

    act(() => vi.advanceTimersByTime(60_000))

    expect(result.current.showWelcome).toBe(true)
    expect(window.sessionStorage.getItem(STORAGE_KEYS.welcomeSeen)).toBeNull()
  })

  it('dismisses immediately and skips the welcome for the rest of the session', () => {
    const firstVisit = renderHook(() => useWelcomeGate())

    act(() => firstVisit.result.current.dismissWelcome())
    expect(firstVisit.result.current.showWelcome).toBe(false)
    firstVisit.unmount()

    const repeatVisit = renderHook(() => useWelcomeGate())
    expect(repeatVisit.result.current.showWelcome).toBe(false)
  })
})
