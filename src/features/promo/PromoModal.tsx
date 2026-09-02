import { useEffect, useRef } from 'react'
import { Tag, X } from 'lucide-react'
import type { Product, Promotion } from '@/models'
import { getStartingSize } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { promotionText } from '@/services/promotion'
import { PriceDisplay } from '@/components/menu/PriceDisplay'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { productName } from '@/utils/translation'
import { Link } from 'react-router-dom'
import { PROMO_VISIBLE_MS } from './usePromoGate'
import { prefersReducedMotion } from '@/utils/motion'
import { cn } from '@/utils/cn'

/** At most this many items; past that the pop-up becomes a menu. */
const SHOWN = 3

interface PromoModalProps {
  promotion: Promotion
  /** The products the offer actually discounts, deepest cut first. */
  products: Product[]
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
export function PromoModal({ promotion, products, onClose, onHold, held }: PromoModalProps) {
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
          The offer itself, not just the announcement of one.

          A headline is whatever the shop had time to type — often a single
          word — so the pop-up carries the thing the customer is actually
          being offered: which drinks, and what they now cost. Three at most;
          beyond that this stops being a pop-up and becomes a menu.
        */}
        {products.length > 0 && (
          <div className="border-t border-border/70 px-4 pt-3 pb-4">
            <ul className="grid gap-1">
              {products.slice(0, SHOWN).map((product) => {
                const size = getStartingSize(product)

                return (
                  <li key={product.id}>
                    <Link
                      to={`/menu/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-surface-2"
                    >
                      <ImageWithFallback
                        src={product.image}
                        alt=""
                        fit="cover"
                        className="size-12 shrink-0 rounded-lg"
                      />

                      <span className="min-w-0 flex-1 text-start">
                        <span className="block truncate text-sm font-medium text-text">
                          {productName(product, language)}
                        </span>

                        {size && (
                          <PriceDisplay
                            price={size.price}
                            size="sm"
                            discountPercent={product.promoPercent}
                            className="mt-0.5"
                          />
                        )}
                      </span>

                      <span className="shrink-0 rounded-pill bg-success px-2 py-0.5 text-[11px] font-bold tabular-nums text-bg">
                        −{product.promoPercent}%
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {products.length > SHOWN && (
              <p className="mt-2 text-center text-xs text-muted">
                {t.promo.andMore}
              </p>
            )}
          </div>
        )}

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
