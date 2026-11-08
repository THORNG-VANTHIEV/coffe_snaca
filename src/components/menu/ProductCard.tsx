import { Link } from 'react-router-dom'
import type { Product } from '@/models'
import { getStartingSize } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { useSettings } from '@/hooks/useMenu'
import { activeDiscount } from '@/services/promotion'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { AvailabilityBadge } from './AvailabilityBadge'
import { DiscountBadge } from './DiscountBadge'
import { PriceDisplay } from './PriceDisplay'
import { ProductBadge } from './ProductBadge'
import { cn } from '@/utils/cn'
import { productAltName, productDescription, productName } from '@/utils/translation'

interface ProductCardProps {
  product: Product
  /** The first screenful of cards skips lazy loading. */
  priority?: boolean
  /**
   * Below 420px, a row with the photo beside the text instead of a card with
   * the photo on top. For long lists; a rail's cards stay full size.
   */
  compact?: boolean
  className?: string
}

/** The menu's workhorse card (spec §12, §33). */
export function ProductCard({ product, priority, compact = false, className }: ProductCardProps) {
  const { language, t } = useLanguage()
  const settings = useSettings()
  const discount = activeDiscount(product, settings)

  const name = productName(product, language)
  const altName = productAltName(product, language)
  const description = productDescription(product, language)
  const startingSize = getStartingSize(product)
  const hasRange = product.sizes.length > 1
  const hasMarker = product.bestSeller || product.recommended

  return (
    <Link
      to={`/menu/${product.slug}`}
      className={cn(
        'group flex overflow-hidden rounded-card bg-surface shadow-card',
        compact ? 'flex-row min-[420px]:flex-col' : 'flex-col',
        'border border-border/70 transition duration-var(--motion-standard) ease-out',
        'hover:-translate-y-1 hover:border-border-strong hover:shadow-raised focus-visible:-translate-y-1',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          compact && 'w-28 shrink-0 self-stretch min-[420px]:w-auto min-[420px]:self-auto',
        )}
      >
        <ImageWithFallback
          src={product.image}
          alt={name}
          priority={priority}
          fit="cover"
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 80vw"
          className={cn(
            'w-full',
            compact ? 'h-full min-h-28 min-[420px]:aspect-4/3 min-[420px]:h-auto min-[420px]:min-h-0' : 'aspect-4/3',
            !product.available && 'opacity-55 grayscale-35',
          )}
          imageClassName="group-hover:scale-[1.04]"
        />

        {/* A 7rem photo has no room for these; in a row they sit above the name. */}
        {hasMarker && (
          <div
            className={cn(
              'pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5',
              compact && 'max-[419px]:hidden',
            )}
          >
            {product.bestSeller && <ProductBadge kind="bestSeller" />}
            {product.recommended && <ProductBadge kind="recommended" />}
          </div>
        )}

        {/* Top-right, opposite the best-seller stack: two badges competing
            for the same corner is how a card stops being scannable. */}
        {discount > 0 && (
          <div
            className={cn(
              'pointer-events-none absolute top-3 end-3',
              compact && 'max-[419px]:top-2 max-[419px]:end-2',
            )}
          >
            <DiscountBadge percent={discount} />
          </div>
        )}

        {!product.available && (
          <div className={cn('absolute inset-x-3 bottom-3', compact && 'max-[419px]:inset-x-2 max-[419px]:bottom-2')}>
            <AvailabilityBadge available={false} compact={compact} className="shadow-sm" />
          </div>
        )}
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col gap-1.5 p-4', compact && 'max-[419px]:gap-1 max-[419px]:p-3')}>
        {compact && hasMarker && (
          <div className="flex flex-wrap gap-1.5 min-[420px]:hidden">
            {product.bestSeller && <ProductBadge kind="bestSeller" />}
            {product.recommended && <ProductBadge kind="recommended" />}
          </div>
        )}

        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-text">{name}</h3>

        {altName && altName !== name && (
          <p
            className="line-clamp-1 text-xs text-muted"
            lang={language === 'km' ? 'en' : 'km'}
          >
            {altName}
          </p>
        )}

        {description && (
          <p className={cn('line-clamp-2 text-[13px] leading-relaxed text-muted', compact && 'max-[419px]:line-clamp-1')}>
            {description}
          </p>
        )}

        {startingSize && (
          <PriceDisplay
            price={startingSize.price}
            prefix={hasRange ? t.common.from : undefined}
            discountPercent={discount}
            className="mt-auto pt-2"
          />
        )}
      </div>
    </Link>
  )
}
