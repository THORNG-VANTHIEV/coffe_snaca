import type { Price } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { useSettings } from '@/hooks/useMenu'
import { discountPrice, isValidPercent } from '@/services/promotion'
import { formatPrice } from '@/utils/currency'
import { cn } from '@/utils/cn'

interface PriceDisplayProps {
  price: Price
  size?: 'sm' | 'md' | 'lg'
  /** Optional "From" prefix for products sold in several sizes (spec §12). */
  prefix?: string
  /**
   * Percentage off, already checked against the running campaign by the
   * caller (see `activeDiscount`). Zero renders an ordinary price.
   */
  discountPercent?: number
  className?: string
}

const USD_SIZE = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
} as const

const KHR_SIZE = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const

const WAS_SIZE = {
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-sm',
} as const

/** Both currencies side by side, exactly as authored (spec §17, §24). */
export function PriceDisplay({
  price,
  size = 'md',
  prefix,
  discountPercent = 0,
  className,
}: PriceDisplayProps) {
  const settings = useSettings()
  const { t } = useLanguage()

  const discounted = isValidPercent(discountPercent)
  const payable = discounted ? discountPrice(price, discountPercent) : price

  const { usd, khr } = formatPrice(payable, settings)
  const was = discounted ? formatPrice(price, settings) : null

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      {prefix && <span className="text-xs text-muted">{prefix}</span>}

      {/*
        The old price comes first, struck through, because that is the order
        it is read in — and it is labelled, so a screen reader announces
        "Regular price $2.25" rather than two bare numbers whose relationship
        only the strikethrough carries.
      */}
      {was && (
        <span className={cn('text-muted tabular-nums', WAS_SIZE[size])}>
          <span className="sr-only">{t.promo.regularPrice} </span>
          <s>{[was.usd, was.khr].filter(Boolean).join(' | ')}</s>
        </span>
      )}

      {usd && (
        <span
          className={cn(
            'font-semibold tabular-nums',
            USD_SIZE[size],
            discounted ? 'text-success' : 'text-text',
          )}
        >
          {usd}
        </span>
      )}

      {usd && khr && <span className="text-border-strong" aria-hidden="true">|</span>}

      {khr && <span className={cn('text-muted tabular-nums', KHR_SIZE[size])}>{khr}</span>}
    </div>
  )
}
