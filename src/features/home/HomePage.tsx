import { useMemo } from 'react'
import { ArrowRight, Flame, LayoutGrid, Sparkles, UtensilsCrossed } from 'lucide-react'
import { ButtonLink } from '@/components/common/Button'
import { SectionHeading } from '@/components/common/SectionHeading'
import { CategoryGrid } from '@/components/menu/CategoryGrid'
import { CategoryList } from '@/components/menu/CategoryList'
import { ProductGrid } from '@/components/menu/ProductGrid'
import { ProductRail } from '@/components/menu/ProductRail'
import { SearchBar } from '@/features/search/SearchBar'
import { SearchResults } from '@/features/search/SearchResults'
import { useSearchQuery, useSearchResults } from '@/features/search/useSearchQuery'
import { HeroBanner } from './HeroBanner'
import { useLanguage } from '@/hooks/useLanguage'
import { useCategories, useProducts, useSettings } from '@/hooks/useMenu'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/useMediaQuery'
import { getBestSellers, getRecommended } from '@/services/menuSelectors'
import { shopName } from '@/utils/translation'

const RAIL_LIMIT = 8
const PREVIEW_LIMIT = 8

/** The main customer experience (spec §7.2, §59). */
export function HomePage() {
  const settings = useSettings()
  const categories = useCategories()
  const products = useProducts()
  const { language, t } = useLanguage()

  const [query, setQuery] = useSearchQuery()
  const results = useSearchResults(query)
  const isSearching = query.trim().length > 0

  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  useDocumentTitle(`${shopName(settings, language)} | ${t.common.appName}`)

  const bestSellers = useMemo(
    () => getBestSellers(products).slice(0, RAIL_LIMIT),
    [products],
  )
  const recommended = useMemo(
    () => getRecommended(products).slice(0, RAIL_LIMIT),
    [products],
  )
  const preview = useMemo(() => products.slice(0, PREVIEW_LIMIT), [products])

  const countByCategory = useMemo(() => {
    const counts = new Map<number, number>()
    for (const product of products) {
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1)
    }
    return counts
  }, [products])

  return (
    <div className="container-page flex flex-col gap-9 py-5 sm:gap-12 sm:py-7">
      <HeroBanner />

      <SearchBar value={query} onChange={setQuery} className="-mt-4 sm:-mt-6" />

      {isSearching ? (
        <SearchResults query={query} results={results} />
      ) : (
        <>
          <section aria-labelledby="home-categories">
            <SectionHeading
              id="home-categories"
              icon={LayoutGrid}
              title={t.sections.categories}
            />
            {isDesktop ? (
              <CategoryGrid
                categories={categories}
                countFor={(category) => countByCategory.get(category.id) ?? 0}
              />
            ) : (
              <CategoryList
                categories={categories}
                showAll={false}
                hrefFor={(slug) =>
                  slug ? `/menu?category=${slug}#category-${slug}` : '/menu'
                }
              />
            )}
          </section>

          {bestSellers.length > 0 && (
            <section aria-labelledby="home-best-sellers">
              <SectionHeading
                id="home-best-sellers"
                icon={Flame}
                title={t.sections.bestSellers}
              />
              <ProductRail products={bestSellers} priority />
            </section>
          )}

          {recommended.length > 0 && (
            <section aria-labelledby="home-recommended">
              <SectionHeading
                id="home-recommended"
                icon={Sparkles}
                title={t.sections.recommended}
              />
              <ProductRail products={recommended} />
            </section>
          )}

          <section aria-labelledby="home-menu">
            <SectionHeading
              id="home-menu"
              icon={UtensilsCrossed}
              title={t.sections.fullMenu}
              action={
                <ButtonLink to="/menu" variant="ghost" size="sm">
                  {t.common.viewAll}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
              }
            />
            <ProductGrid products={preview} />

            <div className="mt-6 flex justify-center">
              <ButtonLink to="/menu" variant="outline">
                {t.common.viewAll}
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
