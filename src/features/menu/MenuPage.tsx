import { useMemo } from 'react'
import { UtensilsCrossed } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { EmptyState } from '@/components/common/EmptyState'
import { CategoryList } from '@/components/menu/CategoryList'
import { ProductGrid } from '@/components/menu/ProductGrid'
import { SearchBar } from '@/features/search/SearchBar'
import { SearchResults } from '@/features/search/SearchResults'
import { useSearchQuery, useSearchResults } from '@/features/search/useSearchQuery'
import { useCategoryFilter } from './useCategoryFilter'
import { useLanguage } from '@/hooks/useLanguage'
import { useCategories, useProducts, useSettings } from '@/hooks/useMenu'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { findCategoryBySlug, getProductsByCategory } from '@/services/menuSelectors'
import { categoryName, shopName } from '@/utils/translation'

/**
 * The full menu with category filtering and search (spec §12, §27).
 *
 * Both filters live in the URL, so any view of the menu can be shared or
 * bookmarked, and they compose: searching inside a category narrows within it.
 */
export function MenuPage() {
  const settings = useSettings()
  const categories = useCategories()
  const products = useProducts()
  const { language, t } = useLanguage()

  const { slug, hrefFor } = useCategoryFilter()
  const [query, setQuery] = useSearchQuery()
  const searchResults = useSearchResults(query)
  const isSearching = query.trim().length > 0

  const activeCategory = slug ? findCategoryBySlug(categories, slug) : undefined
  const heading = activeCategory
    ? categoryName(activeCategory, language)
    : t.sections.fullMenu

  useDocumentTitle(`${heading} | ${shopName(settings, language)}`)

  const visible = useMemo(() => {
    const source = isSearching ? searchResults : products
    return activeCategory ? getProductsByCategory(source, activeCategory.id) : source
  }, [isSearching, searchResults, products, activeCategory])

  return (
    <div className="container-page flex flex-col gap-6 py-6">
      <SearchBar value={query} onChange={setQuery} />

      <CategoryList categories={categories} activeSlug={slug} hrefFor={hrefFor} />

      {isSearching ? (
        <SearchResults query={query} results={visible} />
      ) : (
        <section aria-labelledby="menu-heading">
          <SectionHeading id="menu-heading" icon={UtensilsCrossed} title={heading} />

          {visible.length > 0 ? (
            <ProductGrid
              key={activeCategory?.id ?? 'all'}
              products={visible}
              priorityCount={4}
            />
          ) : (
            <EmptyState
              icon={UtensilsCrossed}
              title={t.states.emptyCategoryTitle}
              body={t.states.emptyCategoryBody}
            />
          )}
        </section>
      )}
    </div>
  )
}
