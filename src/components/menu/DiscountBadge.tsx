import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/cn'

/**
 * The "-20%" chip on a discounted product (spec §24).
 *
 * Colour choices, in a palette that is deliberately two-tone:
 *
 *  - Not red. `--danger` means "you cannot have this", and a discount that
 *    borrows it would make the two impossible to tell apart at a glance.
 *  - Not the accent tone either — the best-seller and recommended badges
 *    already sit in the top-left corner wearing it.
 *  - `--success` filled, where availability wears the same hue only as a soft
 *    tint, so solid vs tinted separates them without a new colour.
 *
 * `text-bg` rather than a fixed white or navy: the background token flips with
 * the theme, so the label stays the opposite of the fill in both.
 *
 * The chip reads as symbols alone, so the accessible name spells it out.
 */
export function DiscountBadge({
  percent,
  className,
}: {
  percent: number
  className?: string
}) {
  const { t } = useLanguage()

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill bg-success px-2 py-1 text-[11px] leading-none font-bold text-bg shadow-sm tabular-nums',
        className,
      )}
    >
      <span aria-hidden="true">−{percent}%</span>
      <span className="sr-only">
        {t.promo.discount} {percent}%
      </span>
    </span>
  )
}
