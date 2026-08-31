import { useCallback, useEffect, useRef, useState } from 'react'
import type { Settings } from '@/models'
import { isPromotionLive } from '@/services/promotion'
import { readSessionStored, STORAGE_KEYS, writeSessionStored } from '@/utils/storage'

/** How long the offer stays up before it bows out on its own (spec §24). */
export const PROMO_VISIBLE_MS = 3000

/**
 * Decides whether the promotion pop-up should be on screen.
 *
 * Rules, in the order they bite:
 *
 *  1. **Once per session.** A customer who has already seen the offer is
 *     browsing the menu; showing it again on every page would be an
 *     obstruction, not an announcement. Session storage, not local — a visit
 *     tomorrow is a new visit.
 *  2. **Only after the welcome screen.** Two overlays stacked on a scanned QR
 *     code is one too many, and the offer would be counted as seen while a
 *     splash covered it.
 *  3. **Three seconds, then out.** The timer is paused while the customer is
 *     interacting — see `hold` — because dismissing an offer mid-read is worse
 *     than never showing it.
 *
 * The auto-dismiss is a convenience, never the only way out: the pop-up always
 * carries a close button and answers Escape.
 */
export function usePromoGate(settings: Settings | undefined, ready: boolean) {
  const promotion = settings?.promo ?? null
  const live = isPromotionLive(promotion)

  const [isOpen, setIsOpen] = useState(false)
  const [held, setHeld] = useState(false)
  const opened = useRef(false)

  useEffect(() => {
    if (!ready || !live || opened.current) return
    if (readSessionStored(STORAGE_KEYS.promoSeen) === '1') return

    // Marked seen on opening, not on closing: a customer who navigates away
    // during those three seconds has seen it, and should not be shown it
    // again on the next page.
    opened.current = true
    writeSessionStored(STORAGE_KEYS.promoSeen, '1')
    setIsOpen(true)
  }, [ready, live])

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (!isOpen || held) return

    const timer = window.setTimeout(() => setIsOpen(false), PROMO_VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [isOpen, held])

  return {
    /** The live promotion to render, or null. */
    promotion: isOpen ? promotion : null,
    close,
    /** Call with true while the customer is reading, to stop the countdown. */
    hold: setHeld,
    held,
  }
}
