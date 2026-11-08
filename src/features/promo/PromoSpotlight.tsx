import { useEffect, useMemo, useRef } from 'react'
import { Clock, Tag } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { ProductRail } from '@/components/menu/ProductRail'
import { useLanguage } from '@/hooks/useLanguage'
import { useProducts, useSettings } from '@/hooks/useMenu'
import { getDiscountedProducts, promotionText } from '@/services/promotion'
import { prefersReducedMotion } from '@/utils/motion'
import { countdownLabel, deepestDiscount, PROMO_SECTION_ID } from './promoLabels'

/**
 * The running offer, kept on the home page.
 *
 * The pop-up leaves after three seconds by design, and before this nothing
 * else on the menu said an offer was on — a customer who closed it, or
 * glanced away, had no way back. This section stays for as long as the
 * promotion does: headline, how long is left, the deepest discount, and the
 * discounted products as the same cards the rest of the menu uses.
 *
 * It renders nothing when no promotion is live or nothing is discounted, so
 * the home page is unchanged between campaigns.
 */
export function PromoSpotlight() {
  const settings = useSettings()
  const products = useProducts()
  const { language, t } = useLanguage()
  const { hash } = useLocation()
  const sectionRef = useRef<HTMLElement>(null)

  const promotion = settings.promo
  const discounted = useMemo(
    () => getDiscountedProducts(products, settings),
    [products, settings],
  )

  // The pop-up's "see all offers" lands here by hash; the router does not
  // scroll to one on its own.
  useEffect(() => {
    if (hash === `#${PROMO_SECTION_ID}` && sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      })
    }
  }, [hash, discounted.length])

  if (!promotion || discounted.length === 0) return null

  const { title, text } = promotionText(promotion, language)
  const countdown = countdownLabel(promotion, t.promo)
  const deepest = deepestDiscount(discounted)

  return (
    <section
      ref={sectionRef}
      id={PROMO_SECTION_ID}
      aria-labelledby={`${PROMO_SECTION_ID}-title`}
      className="scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-surface shadow-card"
    >
      <div className="relative isolate flex items-start gap-3 p-5 sm:items-center sm:gap-5 sm:p-7">
        {/*
          The banner photo as a faint wash behind the header, faded out
          before the text so the headline never depends on the photo for
          its contrast. Wide screens only: a phone's text runs the full width,
          so there the photo could only ever be a smudge behind it. Phones
          still get it, large, in the pop-up.
        */}
        {promotion.image ? (
          <div className="hidden sm:contents">
            <img
              src={promotion.image}
              alt=""
              aria-hidden="true"
              // Masked to fade out from its corner, so the photo has no
              // edge where it meets the card — on the left or at the bottom.
              className="absolute inset-y-0 end-0 -z-20 h-full w-2/3 object-cover opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black_25%,transparent_75%)] sm:w-1/2 rtl:[mask-image:radial-gradient(ellipse_at_top_left,black_25%,transparent_75%)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-linear-to-r from-surface from-40% via-surface/90 to-surface/30 rtl:bg-linear-to-l"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
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

          <h2
            id={`${PROMO_SECTION_ID}-title`}
            className="mt-3 text-xl leading-snug font-bold text-balance text-text sm:text-3xl"
          >
            {title}
          </h2>

          {text ? (
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{text}</p>
          ) : null}
        </div>

        {/* The headline number, big enough to read from across the table. */}
        <p className="flex shrink-0 flex-col items-center rounded-2xl bg-success px-3 py-2.5 text-bg shadow-raised sm:px-6 sm:py-4">
          <span className="sr-only">{t.promo.upTo.replace('{percent}', String(deepest))}</span>
          <span aria-hidden="true" className="text-[10px] leading-none font-semibold sm:text-xs">
            {t.promo.upToShort}
          </span>
          <span aria-hidden="true" className="mt-1 text-xl leading-none font-extrabold tabular-nums sm:text-4xl">
            −{deepest}%
          </span>
        </p>
      </div>

      <div className="px-4 pb-5 sm:px-7 sm:pb-7">
        <ProductRail products={discounted} />
      </div>
    </section>
  )
}
