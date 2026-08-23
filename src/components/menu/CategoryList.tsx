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
  /** Builds the destination for a chip — null slug is the "All" chip. */
  hrefFor: (slug: string | null) => string
  showAll?: boolean
}

/**
 * Horizontally scrollable category chips (spec §9). Wraps onto multiple rows
 * from `lg` up, where a scroller would just hide options.
 */
export function CategoryList({
  categories,
  activeSlug = null,
  hrefFor,
  showAll = true,
}: CategoryListProps) {
  const { language, t } = useLanguage()
  const listRef = useRef<HTMLUListElement>(null)
  const activeItemRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (activeItemRef.current && listRef.current) {
      const container = listRef.current
      const item = activeItemRef.current

      const itemLeft = item.offsetLeft
      const itemWidth = item.offsetWidth
      const containerWidth = container.offsetWidth

      const targetScrollLeft = itemLeft - containerWidth / 2 + itemWidth / 2

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth',
      })
    }
  }, [activeSlug])

  return (
    <nav aria-label={t.sections.categories}>
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
              to={hrefFor(null)}
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
                to={hrefFor(category.slug)}
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
