import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { ButtonLink } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { CategoryList } from '@/components/menu/CategoryList'
import { ProductGrid } from '@/components/menu/ProductGrid'
import { useRememberCategory } from '@/features/menu/useCategoryFilter'
import { useLanguage } from '@/hooks/useLanguage'
import { useCategories, useProducts, useSettings } from '@/hooks/useMenu'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { resolveCategoryIcon } from '@/utils/icons'
import { findCategoryBySlug, getProductsByCategory } from '@/services/menuSelectors'
import { categoryDescription, categoryName, shopName } from '@/utils/translation'

/** Products of one category (spec §27). */
export function CategoryPage() {
  const { slug = '' } = useParams()
  const settings = useSettings()
  const categories = useCategories()
  const products = useProducts()
  const { language, t } = useLanguage()

  const category = findCategoryBySlug(categories, slug)
  const name = category ? categoryName(category, language) : t.states.notFoundTitle

  useRememberCategory(category?.slug ?? null)
  useDocumentTitle(`${name} | ${shopName(settings, language)}`)

  const items = useMemo(
    () => (category ? getProductsByCategory(products, category.id) : []),
    [products, category],
  )

  if (!category) {
    return (
      <div className="container-page py-10">
        <EmptyState
          icon={UtensilsCrossed}
          title={t.states.notFoundTitle}
          body={t.states.notFoundBody}
          action={
            <ButtonLink to="/menu" className="mt-2">
              {t.states.backToMenu}
            </ButtonLink>
          }
        />
      </div>
    )
  }

  const Icon = resolveCategoryIcon(category.icon)
  const description = categoryDescription(category, language)

  return (
    <div className="container-page flex flex-col gap-6 py-6">
      <CategoryList
        categories={categories}
        activeSlug={category.slug}
        hrefFor={(next) => (next ? `/category/${next}` : '/menu')}
      />

      <header className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-pill bg-surface-2 text-accent">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-text sm:text-2xl">{name}</h1>
          <p className="text-sm text-muted">
            {description ? `${description} · ` : ''}
            <span className="tabular-nums">{items.length}</span>{' '}
            {items.length === 1 ? t.common.item : t.common.items}
          </p>
        </div>
      </header>

      {items.length > 0 ? (
        <ProductGrid products={items} priorityCount={4} />
      ) : (
        <EmptyState
          icon={Icon}
          title={t.states.emptyCategoryTitle}
          body={t.states.emptyCategoryBody}
          action={
            <ButtonLink to="/menu" variant="outline" className="mt-2">
              {t.states.backToMenu}
            </ButtonLink>
          }
        />
      )}
    </div>
  )
}
