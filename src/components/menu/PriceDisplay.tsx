import type { Price } from '@/models'
import { useSettings } from '@/hooks/useMenu'
import { formatPrice } from '@/utils/currency'
import { cn } from '@/utils/cn'

interface PriceDisplayProps {
  price: Price
  size?: 'sm' | 'md' | 'lg'
  /** Optional "From" prefix for products sold in several sizes (spec §12). */
  prefix?: string
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

/** Both currencies side by side, exactly as authored (spec §17). */
export function PriceDisplay({ price, size = 'md', prefix, className }: PriceDisplayProps) {
  const settings = useSettings()
  const { usd, khr } = formatPrice(price, settings)

  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      {prefix && <span className="text-xs text-muted">{prefix}</span>}

      {usd && (
        <span className={cn('font-semibold text-text tabular-nums', USD_SIZE[size])}>{usd}</span>
      )}

      {usd && khr && <span className="text-border-strong" aria-hidden="true">|</span>}

      {khr && (
        <span className={cn('text-muted tabular-nums', KHR_SIZE[size])}>{khr}</span>
      )}
    </p>
  )
}
