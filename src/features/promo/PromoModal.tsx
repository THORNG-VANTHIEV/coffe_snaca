import { useEffect, useRef } from 'react'
import { Tag, X } from 'lucide-react'
import type { Promotion } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { promotionText } from '@/services/promotion'
import { PROMO_VISIBLE_MS } from './usePromoGate'
import { prefersReducedMotion } from '@/utils/motion'
import { cn } from '@/utils/cn'

interface PromoModalProps {
  promotion: Promotion
  onClose: () => void
  /** Called with true while the customer is reading, to pause the countdown. */
  onHold: (held: boolean) => void
  held: boolean
}

/**
 * The offer a customer meets on scanning a table QR code (spec §24).
 *
 * It leaves after three seconds. That is short enough to feel like an
 * announcement rather than an interruption, and it is why everything else
 * here is built around not trapping anyone:
 *
 *  - A close button, always, sized for a thumb. The timer is a convenience;
 *    it is never the only way out.
 *  - Escape closes it, and so does the backdrop.
 *  - Hovering, focusing or touching the card pauses the countdown, because a
 *    dialog that vanishes while it is being read is worse than none.
 *  - The progress bar shows the time left, so its disappearance is expected
 *    rather than startling.
 *
 * Focus moves to the close button on open and the backdrop is inert to
 * pointer events beneath, so a screen-reader user meets the offer in order and
 * a sighted one cannot tap a product through it.
 */
export function PromoModal({ promotion, onClose, onHold, held }: PromoModalProps) {
  const { language, t } = useLanguage()
  const { title, text } = promotionText(promotion, language)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const reduced = prefersReducedMotion()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.promo.announcement}
      className="fixed inset-0 z-50 grid place-items-end justify-items-center bg-bg/60 px-4 pb-6 backdrop-blur-sm sm:place-items-center sm:pb-4"
      onClick={onClose}
    >
      <div
        // The card swallows the click so only the backdrop dismisses.
        onClick={(event) => event.stopPropagation()}
        onMouseEnter={() => onHold(true)}
        onMouseLeave={() => onHold(false)}
        onFocusCapture={() => onHold(true)}
        onTouchStart={() => onHold(true)}
        className={cn(
          'relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-border/80',
          'bg-surface/95 shadow-raised backdrop-blur-xl',
          !reduced && 'animate-fade-rise',
        )}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.promo.dismiss}
          className={cn(
            'absolute end-3 top-3 z-10 grid size-9 place-items-center rounded-pill',
            'bg-bg/70 text-text backdrop-blur transition',
            'hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-interactive',
          )}
        >
          <X className="size-4.5" aria-hidden="true" />
        </button>

        {promotion.image ? (
          <img
            src={promotion.image}
            alt=""
            className="aspect-16/9 w-full object-cover"
            // Decorative: the headline below carries the message, and a
            // customer using a screen reader should not sit through a
            // description of a poster in a three-second dialog.
            aria-hidden="true"
          />
        ) : null}

        <div className="flex flex-col gap-2 px-6 pt-6 pb-5 text-center">
          <span className="mx-auto inline-flex items-center gap-1.5 rounded-pill bg-success/15 px-3 py-1 text-[11px] font-semibold tracking-wider text-success uppercase">
            <Tag className="size-3" aria-hidden="true" />
            {t.promo.announcement}
          </span>

          <h2 className="text-lg leading-snug font-semibold text-text sm:text-xl">{title}</h2>

          {text ? (
            <p className="text-sm leading-relaxed text-muted">{text}</p>
          ) : null}
        </div>

        {/*
          The countdown, drawn rather than described. It freezes with the timer
          while the card is held, so a paused dialog looks paused.
        */}
        <div className="h-1 w-full bg-surface-3" aria-hidden="true">
          <div
            className="h-full bg-success"
            style={{
              animation: reduced
                ? undefined
                : `promo-countdown ${PROMO_VISIBLE_MS}ms linear forwards`,
              animationPlayState: held ? 'paused' : 'running',
              width: reduced ? '100%' : undefined,
            }}
          />
        </div>
      </div>
    </div>
  )
}
