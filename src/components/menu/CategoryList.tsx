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

  return (
    <nav aria-label={t.sections.categories}>
      <ul className="scroll-row scrollbar-none -mx-4 px-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
        {showAll && (
          <li className="scroll-item">
            <CategoryChip
              to={hrefFor(null)}
              label={t.common.all}
              icon={LayoutGrid}
              active={activeSlug === null}
            />
          </li>
        )}

        {categories.map((category) => (
          <li key={category.id} className="scroll-item">
            <CategoryChip
              to={hrefFor(category.slug)}
              label={categoryName(category, language)}
              icon={resolveCategoryIcon(category.icon)}
              active={activeSlug === category.slug}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
