import { useEffect, useRef } from 'react'
import { ArrowRight, Clock, Tag, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product, Promotion } from '@/models'
import { getStartingSize } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { useSettings } from '@/hooks/useMenu'
import { discountPrice, promotionText } from '@/services/promotion'
import { formatPrice } from '@/utils/currency'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { productName } from '@/utils/translation'
import { prefersReducedMotion } from '@/utils/motion'
import { cn } from '@/utils/cn'
import { countdownLabel, deepestDiscount, PROMO_SECTION_ID } from './promoLabels'

/**
 * How many products the pop-up's row carries. They scroll sideways, so this
 * is about how much there is to swipe through, not how much fits — past six
 * the "see all offers" button is the better way in.
 */
const SHOWN = 6

interface PromoModalProps {
  promotion: Promotion
  /** The products the offer actually discounts, deepest cut first. */
  products: Product[]
  onClose: () => void
  /**
   * Called with true while the customer is reading, so the gate holds the
   * three seconds open. Nothing draws that pause any more — the countdown bar
   * is gone — but a card being read still should not vanish mid-sentence.
   */
  onHold: (held: boolean) => void
}

/**
 * The offer a customer meets on scanning a table QR code (spec §24).
 *
 * It leaves after three seconds, so it is built to be read in one: the
 * banner photo with the deepest discount stamped on it, the headline large,
 * then the discounted products as a row of cards with their new prices. The
 * same offer stays on the home page afterwards (PromoSpotlight), and the
 * button at the bottom goes straight there.
 *
 * Built around not trapping anyone:
 *
 *  - A close button, always, sized for a thumb. The timer is a convenience;
 *    it is never the only way out.
 *  - Escape closes it, and so does the backdrop.
 *  - Hovering, focusing or touching the card pauses the countdown, because a
 *    dialog that vanishes while it is being read is worse than none.
 *
 * Focus moves to the close button on open and the backdrop is inert to
 * pointer events beneath, so a screen-reader user meets the offer in order and
 * a sighted one cannot tap a product through it.
 */
export function PromoModal({ promotion, products, onClose, onHold }: PromoModalProps) {
  const { language, t } = useLanguage()
  const settings = useSettings()
  const { title, text } = promotionText(promotion, language)
  const countdown = countdownLabel(promotion, t.promo)
  const deepest = deepestDiscount(products)
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
      className="fixed inset-0 z-50 grid place-items-center bg-bg/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        onMouseEnter={() => onHold(true)}
        onMouseLeave={() => onHold(false)}
        onFocusCapture={() => onHold(true)}
        onTouchStart={() => onHold(true)}
        className={cn(
          'relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl sm:rounded-[1.75rem]',
          'border border-border/80 bg-surface shadow-raised',
          'max-h-[85dvh] overflow-y-auto',
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

        {/*
          The banner, fading into the card below it so the headline sits on
          plain surface — never on the photo, where its contrast would depend
          on whatever the shop happened to upload. The deepest discount is
          stamped on the corner: the one number worth reading first.
        */}
        <div className="relative">
          {promotion.image ? (
            <img
              src={promotion.image}
              alt=""
              className="aspect-2/1 w-full object-cover"
              aria-hidden="true"
            />
          ) : (
            <div className="h-20 bg-surface-2" aria-hidden="true" />
          )}

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-surface to-transparent"
            aria-hidden="true"
          />

          {deepest > 0 && (
            <div
              className={cn(
                'absolute start-4 top-4 flex flex-col items-center rounded-2xl bg-success px-3 py-2 text-bg shadow-raised',
                !reduced && 'animate-fade-rise',
              )}
            >
              <span className="text-[10px] leading-none font-semibold">{t.promo.upToShort}</span>
              <span className="mt-0.5 text-2xl leading-none font-extrabold tabular-nums">
                −{deepest}%
              </span>
            </div>
          )}
        </div>

        <div className="relative flex flex-col gap-2.5 px-5 pb-5 text-center sm:px-6">
          {/*
            How long is left, in whole days, because `ends_at` is a date and
            nothing finer would be true. It sits beside the label rather than
            below the offer: a customer deciding whether to order today reads
            the deadline first.
          */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-success-soft px-3 py-1 text-[11px] font-semibold text-success">
              <Tag className="size-3" aria-hidden="true" />
              {t.promo.announcement}
            </span>

            {countdown && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-3 py-1 text-[11px] font-semibold text-muted">
                <Clock className="size-3" aria-hidden="true" />
                {countdown}
              </span>
            )}
          </div>

          <h2 className="text-xl leading-snug font-bold text-balance text-text sm:text-2xl">{title}</h2>

          {text ? <p className="text-sm leading-relaxed text-muted">{text}</p> : null}
        </div>

        {/*
          The offer itself, not just the announcement of one: which drinks,
          and what they now cost, as cards to swipe through.
        */}
        {products.length > 0 && (
          <div className="border-t border-border/70 pt-4 pb-5">
            <ul className="scroll-row scroll-row-snap scrollbar-none gap-3 px-5 sm:px-6">
              {products.slice(0, SHOWN).map((product) => {
                const size = getStartingSize(product)

                return (
                  <li key={product.id} className="scroll-item w-36 shrink-0">
                    <Link
                      to={`/menu/${product.slug}`}
                      onClick={onClose}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface-2 text-start transition hover:border-border-strong"
                    >
                      <span className="relative block">
                        <ImageWithFallback
                          src={product.image}
                          alt=""
                          fit="cover"
                          className="aspect-square w-full"
                        />
                        <span className="absolute end-2 top-2 rounded-pill bg-success px-2 py-0.5 text-[11px] font-bold tabular-nums text-bg shadow-card">
                          −{product.promoPercent}%
                        </span>
                      </span>

                      <span className="flex flex-1 flex-col gap-1 p-2.5">
                        <span className="line-clamp-2 text-[13px] leading-snug font-semibold text-text">
                          {productName(product, language)}
                        </span>

                        {/*
                          One currency, new price first: a card this narrow
                          cannot carry both currencies twice over. The menu
                          shows the full pair on the product's own page.
                        */}
                        {size && (
                          <CompactPrice
                            now={formatPrice(discountPrice(size.price, product.promoPercent), settings)}
                            was={formatPrice(size.price, settings)}
                            regularLabel={t.promo.regularPrice}
                          />
                        )}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="px-5 pt-4 sm:px-6">
              <Link
                to={{ pathname: '/', hash: `#${PROMO_SECTION_ID}` }}
                onClick={onClose}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-pill bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition',
                  'hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-interactive',
                )}
              >
                {t.promo.viewOffers}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CompactPrice({
  now,
  was,
  regularLabel,
}: {
  now: { usd: string | null; khr: string | null }
  was: { usd: string | null; khr: string | null }
  regularLabel: string
}) {
  return (
    <span className="mt-auto flex flex-wrap items-baseline gap-x-1.5">
      <span className="text-sm font-bold tabular-nums text-success">{now.usd ?? now.khr}</span>
      <span className="text-[11px] tabular-nums text-muted">
        <span className="sr-only">{regularLabel} </span>
        <s>{was.usd ?? was.khr}</s>
      </span>
    </span>
  )
}
