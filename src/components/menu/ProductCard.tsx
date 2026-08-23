import { Link } from 'react-router-dom'
import type { Product } from '@/models'
import { getStartingSize } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { AvailabilityBadge } from './AvailabilityBadge'
import { PriceDisplay } from './PriceDisplay'
import { ProductBadge } from './ProductBadge'
import { cn } from '@/utils/cn'
import { productAltName, productDescription, productName } from '@/utils/translation'

interface ProductCardProps {
  product: Product
  /** The first screenful of cards skips lazy loading. */
  priority?: boolean
  className?: string
}

/** The menu's workhorse card (spec §12, §33). */
export function ProductCard({ product, priority, className }: ProductCardProps) {
  const { language, t } = useLanguage()

  const name = productName(product, language)
  const altName = productAltName(product, language)
  const description = productDescription(product, language)
  const startingSize = getStartingSize(product)
  const hasRange = product.sizes.length > 1

  return (
    <Link
      to={`/menu/${product.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-card bg-surface shadow-card',
        'border border-border/70 transition duration-[var(--motion-standard)] ease-out',
        'hover:-translate-y-1 hover:border-border-strong hover:shadow-raised focus-visible:-translate-y-1',
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={name}
          priority={priority}
          fit="cover"
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 80vw"
          className={cn(
            'aspect-[4/3] w-full',
            !product.available && 'opacity-55 grayscale-[35%]',
          )}
          imageClassName="group-hover:scale-[1.04]"
        />

        {(product.bestSeller || product.recommended) && (
          <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
            {product.bestSeller && <ProductBadge kind="bestSeller" />}
            {product.recommended && <ProductBadge kind="recommended" />}
          </div>
        )}

        {!product.available && (
          <div className="absolute inset-x-3 bottom-3">
            <AvailabilityBadge available={false} className="shadow-sm" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
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
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">{description}</p>
        )}

        {startingSize && (
          <PriceDisplay
            price={startingSize.price}
            prefix={hasRange ? t.common.from : undefined}
            className="mt-auto pt-2"
          />
        )}
      </div>
    </Link>
  )
}
