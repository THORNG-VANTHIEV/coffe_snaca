import type { Product } from '@/models'
import { ProductCard } from './ProductCard'

/**
 * Horizontally scrolling card rail for Best Sellers and Recommended
 * (spec §10, §11).
 *
 * One list, two layouts: a snapping scroller on phones, a plain grid from
 * `lg` up where sideways scrolling would feel wrong. Rendering it twice would
 * duplicate the cards for screen readers, so the switch is pure CSS.
 */
export function ProductRail({
  products,
  priority = false,
}: {
  products: Product[]
  priority?: boolean
}) {
  return (
    <ul className="motion-stagger scroll-row scrollbar-none -mx-4 px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
      {products.map((product, index) => (
        <li key={product.id} className="scroll-item w-[236px] lg:w-auto">
          <ProductCard
            product={product}
            priority={priority && index < 2}
            className="h-full"
          />
        </li>
      ))}
    </ul>
  )
}
