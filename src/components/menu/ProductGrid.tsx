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
 * Responsive product grid. Single column on the narrowest phones so names and
 * prices stay comfortable, two up from 420px (spec §34).
 */
export function ProductGrid({ products, priorityCount = 0, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  )
}
