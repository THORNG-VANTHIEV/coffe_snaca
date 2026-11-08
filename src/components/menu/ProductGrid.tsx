import type { Product } from '@/models'
import { ProductCard } from './ProductCard'
import { cn } from '@/utils/cn'

interface ProductGridProps {
  products: Product[]
  /** How many cards to load eagerly — roughly the first screenful. */
  priorityCount?: number
  className?: string
}

/**
 * Responsive product grid (spec §34). A single column of compact rows on
 * phones under 420px, where a full-size card per product ran the menu to some
 * 47 screens of scrolling; two cards up from 420px.
 */
export function ProductGrid({ products, priorityCount = 0, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        'motion-stagger grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 min-[420px]:gap-4 md:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} compact />
      ))}
    </div>
  )
}
