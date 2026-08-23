import { useEffect, useRef } from 'react'
import { LayoutGrid } from 'lucide-react'
import type { Category } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { resolveCategoryIcon } from '@/utils/icons'
import { categoryName } from '@/utils/translation'
import { CategoryChip } from './CategoryChip'

interface CategoryListProps {
  categories: Category[]
  /** Slug of the selected category; null means "All". */
  activeSlug?: string | null
  /** Optional click handler for smooth scrolling without full URL refresh */
  onSelectCategory?: (slug: string | null) => void
  /** Builds the destination for a chip — null slug is the "All" chip. */
  hrefFor?: (slug: string | null) => string
  showAll?: boolean
  className?: string
}

/**
 * Horizontally scrollable category chips (spec §9). Wraps onto multiple rows
 * from `lg` up, where a scroller would just hide options.
 */
export function CategoryList({
  categories,
  activeSlug = null,
  onSelectCategory,
  hrefFor,
  showAll = true,
  className,
}: CategoryListProps) {
  const { language, t } = useLanguage()
  const listRef = useRef<HTMLUListElement>(null)
  const activeItemRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const container = listRef.current
    const item = activeItemRef.current
    if (!container || !item) return

    // From `lg` up the row wraps instead of scrolling, so there is nothing to
    // centre — and `scrollTo` on an unscrollable box would be a no-op anyway.
    const maxScrollLeft = container.scrollWidth - container.clientWidth
    if (maxScrollLeft <= 0) return

    // Measured against the list itself: `offsetLeft` is relative to the nearest
    // positioned ancestor, which here is the sticky bar wrapping the list, not
    // the scroll container.
    const containerRect = container.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    const itemStart = itemRect.left - containerRect.left + container.scrollLeft

    const targetScrollLeft = Math.max(
      0,
      Math.min(itemStart - (container.clientWidth - itemRect.width) / 2, maxScrollLeft),
    )

    if (Math.abs(container.scrollLeft - targetScrollLeft) > 4) {
      container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' })
    }
  }, [activeSlug])

  return (
    <nav aria-label={t.sections.categories} className={className}>
      <ul
        ref={listRef}
        className="scroll-row scrollbar-none -mx-4 px-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
      >
        {showAll && (
          <li
            ref={activeSlug === null ? activeItemRef : undefined}
            className="scroll-item"
          >
            <CategoryChip
              to={hrefFor ? hrefFor(null) : undefined}
              onClick={onSelectCategory ? () => onSelectCategory(null) : undefined}
              label={t.common.all}
              icon={LayoutGrid}
              active={activeSlug === null}
            />
          </li>
        )}

        {categories.map((category) => {
          const isActive = activeSlug === category.slug
          return (
            <li
              key={category.id}
              ref={isActive ? activeItemRef : undefined}
              className="scroll-item"
            >
              <CategoryChip
                to={hrefFor ? hrefFor(category.slug) : undefined}
                onClick={onSelectCategory ? () => onSelectCategory(category.slug) : undefined}
                label={categoryName(category, language)}
                icon={resolveCategoryIcon(category.icon)}
                active={isActive}
              />
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

