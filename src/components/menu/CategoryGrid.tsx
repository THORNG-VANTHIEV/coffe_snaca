import { Link } from 'react-router-dom'
import type { Category } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { resolveCategoryIcon } from '@/utils/icons'
import { categoryName } from '@/utils/translation'

/**
 * The richer category presentation the spec allows on wider screens
 * (spec §9) — photo tiles instead of pills.
 */
export function CategoryGrid({
  categories,
  countFor,
}: {
  categories: Category[]
  countFor: (category: Category) => number
}) {
  const { language, t } = useLanguage()

  return (
    <ul className="motion-stagger grid grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-6">
      {categories.map((category) => {
        const Icon = resolveCategoryIcon(category.icon)
        const name = categoryName(category, language)
        const count = countFor(category)

        return (
          <li key={category.id}>
            <Link
              to={`/category/${category.slug}`}
              className="group block overflow-hidden rounded-card border border-border/70 bg-surface shadow-card transition duration-[var(--motion-standard)] ease-out hover:-translate-y-1 hover:border-border-strong hover:shadow-raised"
            >
              <div className="relative">
                <ImageWithFallback
                  src={category.image}
                  alt=""
                  sizes="220px"
                  className="aspect-[4/3] w-full"
                  imageClassName="group-hover:scale-[1.05]"
                />
                <span className="absolute top-2.5 left-2.5 grid size-8 place-items-center rounded-pill bg-surface/90 text-accent backdrop-blur-sm">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>

              <div className="p-3">
                <p className="truncate text-sm font-semibold text-text">{name}</p>
                <p className="text-xs text-muted tabular-nums">
                  {count} {count === 1 ? t.common.item : t.common.items}
                </p>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
