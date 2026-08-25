import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { CategoryList } from '@/components/menu/CategoryList'
import { ProductGrid } from '@/components/menu/ProductGrid'
import { SearchBar } from '@/features/search/SearchBar'
import { SearchResults } from '@/features/search/SearchResults'
import { useSearchQuery, useSearchResults } from '@/features/search/useSearchQuery'
import { useLanguage } from '@/hooks/useLanguage'
import { useCategories, useProducts, useSettings } from '@/hooks/useMenu'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { resolveCategoryIcon } from '@/utils/icons'
import { getProductsByCategory } from '@/services/menuSelectors'
import { categoryName, shopName } from '@/utils/translation'

/** Sticky header (64px) + sticky category bar (~54px) + comfortable clearance */
const STICKY_NAV_OFFSET = 135

/** How long a deep link waits for the page to become scrollable before giving up. */
const DEEP_LINK_TIMEOUT = 10_000

/**
 * Continuous Full Menu with Sticky Category Bar and Smooth Anchor Navigation.
 *
 * All 10 official categories are stacked continuously on one single scrollable
 * page. Customers can smoothly scroll from top to bottom through all dishes, or
 * tap any category chip in the sticky bar to glide straight to that section.
 */
export function MenuPage() {
  const settings = useSettings()
  const categories = useCategories()
  const products = useProducts()
  const { language, t } = useLanguage()
  const location = useLocation()
  const [params] = useSearchParams()

  const [query, setQuery] = useSearchQuery()
  const searchResults = useSearchResults(query)
  const isSearching = query.trim().length > 0

  // Initial category from URL query or hash computed once on mount
  const [initialCategory] = useState<string | null>(() => {
    const fromParam = params.get('category')
    if (fromParam) return fromParam
    const hash = location.hash.replace(/^#category-/, '')
    if (hash) return hash
    return null
  })

  const [activeSlug, setActiveSlug] = useState<string | null>(initialCategory)

  /** The chip the customer tapped, held until its smooth scroll settles. */
  const clickLockRef = useRef<{ slug: string | null } | null>(null)
  const settleRafRef = useRef<number | null>(null)
  const settleTimeoutRef = useRef<number | null>(null)
  const hasInitialScrolledRef = useRef(false)
  const pendingSearchExitRef = useRef<{ slug: string | null } | null>(null)
  const categoryBarRef = useRef<HTMLDivElement>(null)

  useDocumentTitle(`${t.sections.fullMenu} | ${shopName(settings, language)}`)

  // Group products into 10 continuous category sections
  const categorySections = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        items: getProductsByCategory(products, category.id),
      }))
      .filter((section) => section.items.length > 0)
  }, [categories, products])

  // A chip for a category with no products would light up and lead nowhere,
  // because the section it points at is never rendered.
  const navigableCategories = useMemo(
    () => categorySections.map((section) => section.category),
    [categorySections],
  )

  const releaseClickLock = useCallback(() => {
    clickLockRef.current = null
    if (settleRafRef.current !== null) {
      window.cancelAnimationFrame(settleRafRef.current)
      settleRafRef.current = null
    }
    if (settleTimeoutRef.current !== null) {
      window.clearTimeout(settleTimeoutRef.current)
      settleTimeoutRef.current = null
    }
  }, [])

  /**
   * Hold the highlight until the page actually stops moving. A fixed timeout
   * cannot do this: gliding from the top of the menu to the last category is
   * several thousand pixels, and releasing mid-flight lets the scrollspy race
   * the highlight through every section on the way past.
   */
  const holdUntilScrollSettles = useCallback(() => {
    if (settleRafRef.current !== null) window.cancelAnimationFrame(settleRafRef.current)
    if (settleTimeoutRef.current !== null) window.clearTimeout(settleTimeoutRef.current)

    const startedAt = performance.now()
    let lastY = window.scrollY
    let stillFrames = 0

    const step = () => {
      const y = window.scrollY
      if (Math.abs(y - lastY) < 1) {
        stillFrames += 1
      } else {
        stillFrames = 0
        lastY = y
      }

      // The floor covers the frames before the browser starts animating; the
      // ceiling makes sure a scroll that never lands cannot wedge the lock.
      const elapsed = performance.now() - startedAt
      if ((stillFrames >= 4 && elapsed > 200) || elapsed > 4000) {
        settleRafRef.current = null
        clickLockRef.current = null
        return
      }

      settleRafRef.current = window.requestAnimationFrame(step)
    }

    settleRafRef.current = window.requestAnimationFrame(step)

    // Animation frames stop entirely while the tab is in the background, which
    // would otherwise leave the highlight pinned when the customer comes back.
    // Timers keep running, so they make the backstop.
    settleTimeoutRef.current = window.setTimeout(() => {
      settleTimeoutRef.current = null
      if (settleRafRef.current !== null) {
        window.cancelAnimationFrame(settleRafRef.current)
        settleRafRef.current = null
      }
      clickLockRef.current = null
    }, 5000)
  }, [])

  /** Smooth scroll to a category section. Returns false if it could not run. */
  const scrollToCategory = useCallback(
    (slug: string | null) => {
      const el = slug ? document.getElementById(`category-${slug}`) : null
      // Leave the highlight where it is rather than pointing at a section that
      // is not on the page.
      if (slug && !el) return false

      clickLockRef.current = { slug }
      setActiveSlug(slug)

      const top = el ? el.getBoundingClientRect().top + window.scrollY - STICKY_NAV_OFFSET : 0
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })

      try {
        window.history.replaceState(
          null,
          '',
          slug ? `?category=${slug}#category-${slug}` : window.location.pathname,
        )
      } catch {
        // Safe fallback
      }

      holdUntilScrollSettles()
      return true
    },
    [holdUntilScrollSettles],
  )

  // A tap inside the search results has no section to scroll to, so clear the
  // search first and glide once the menu is back on screen.
  const handleSelectCategory = useCallback(
    (slug: string | null) => {
      if (isSearching) {
        pendingSearchExitRef.current = { slug }
        setActiveSlug(slug)
        setQuery('')
        return
      }
      scrollToCategory(slug)
    },
    [isSearching, scrollToCategory, setQuery],
  )

  useEffect(() => {
    if (isSearching) return
    const pending = pendingSearchExitRef.current
    if (!pending) return
    pendingSearchExitRef.current = null
    scrollToCategory(pending.slug)
  }, [isSearching, scrollToCategory])

  // When user physically touches screen or wheels to scroll, release click lock so manual scroll takes over
  useEffect(() => {
    const handleUserGesture = (event: Event) => {
      if (!clickLockRef.current) return
      // Tapping a chip fires `pointerdown` *before* its click, so a gesture
      // inside the bar would release the lock the tap is about to take.
      const target = event.target
      if (target instanceof Node && categoryBarRef.current?.contains(target)) return
      releaseClickLock()
    }

    window.addEventListener('touchstart', handleUserGesture, { passive: true })
    window.addEventListener('wheel', handleUserGesture, { passive: true })
    window.addEventListener('pointerdown', handleUserGesture, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleUserGesture)
      window.removeEventListener('wheel', handleUserGesture)
      window.removeEventListener('pointerdown', handleUserGesture)
      releaseClickLock()
    }
  }, [releaseClickLock])

  // Auto-scroll on initial mount if category specified in URL
  useEffect(() => {
    if (hasInitialScrolledRef.current || !initialCategory) return

    if (!categorySections.some((section) => section.category.slug === initialCategory)) {
      hasInitialScrolledRef.current = true
      setActiveSlug(null)
      return
    }

    let timer = 0
    const startedAt = performance.now()

    const attempt = () => {
      // The welcome splash pins the layout with `fixed inset-0 overflow-hidden`,
      // so scrolling before the customer dismisses it silently does nothing —
      // and strands them at the top of the menu with the wrong chip lit up.
      const scrollable =
        document.documentElement.scrollHeight > window.innerHeight + STICKY_NAV_OFFSET

      if ((scrollable && scrollToCategory(initialCategory)) ||
          performance.now() - startedAt > DEEP_LINK_TIMEOUT) {
        hasInitialScrolledRef.current = true
        window.clearInterval(timer)
      }
    }

    timer = window.setInterval(attempt, 100)
    return () => window.clearInterval(timer)
  }, [initialCategory, categorySections, scrollToCategory])

  // Scrollspy: update active category chip accurately as customer scrolls
  useEffect(() => {
    if (isSearching) return

    let rafId: number | null = null

    const checkActiveSection = () => {
      // If customer clicked a category, stay strictly locked on it — including
      // "All", whose null slug used to fall straight through this guard.
      const lock = clickLockRef.current
      if (lock) {
        setActiveSlug(lock.slug)
        return
      }

      const scrollY = window.scrollY
      // If customer is near the top of the page, highlight "All"
      if (scrollY < 80) {
        setActiveSlug((prev) => (prev !== null ? null : prev))
        return
      }

      // Check if user has scrolled to the bottom of the page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        const lastSection = categorySections[categorySections.length - 1]
        if (lastSection) {
          setActiveSlug(lastSection.category.slug)
          return
        }
      }

      // Threshold line just below the sticky navigation bar
      const threshold = STICKY_NAV_OFFSET + 30
      let detectedSlug: string | null = categorySections[0]?.category.slug ?? null

      for (const section of categorySections) {
        const el = document.getElementById(`category-${section.category.slug}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= threshold) {
            detectedSlug = section.category.slug
          } else {
            // Once a section is below the threshold line, the previous section remains active
            break
          }
        }
      }

      if (detectedSlug !== null) {
        setActiveSlug((prev) => (prev !== detectedSlug ? detectedSlug : prev))
      }
    }

    const handleScroll = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        checkActiveSection()
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
    }
  }, [categorySections, isSearching])

  return (
    <div className="container-page flex flex-col gap-6 py-6">
      <SearchBar value={query} onChange={setQuery} />

      {/* Sticky Category Bar */}
      <div
        ref={categoryBarRef}
        className="sticky top-16 z-30 -mx-4 border-b border-border/60 bg-bg/90 px-4 py-2.5 backdrop-blur-md transition-colors sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        <CategoryList
          categories={navigableCategories}
          activeSlug={activeSlug}
          onSelectCategory={handleSelectCategory}
          showAll
        />
      </div>

      {isSearching ? (
        <SearchResults query={query} results={searchResults} />
      ) : (
        <div className="flex flex-col gap-12 pb-72">
          {categorySections.map(({ category, items }, index) => {
            const Icon = resolveCategoryIcon(category.icon)
            const name = categoryName(category, language)

            return (
              <section
                key={category.id}
                id={`category-${category.slug}`}
                className="scroll-mt-36 flex flex-col gap-4"
                aria-labelledby={`heading-${category.slug}`}
              >
                {/* Category Section Header */}
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-pill bg-surface-2 text-accent shadow-xs">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2
                        id={`heading-${category.slug}`}
                        className="text-lg font-bold text-text sm:text-xl"
                      >
                        {name}
                      </h2>
                      <p className="text-xs text-muted">
                        <span className="font-semibold tabular-nums">{items.length}</span>{' '}
                        {items.length === 1 ? t.common.item : t.common.items}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products in this category */}
                <ProductGrid
                  products={items}
                  priorityCount={index === 0 ? 4 : 0}
                />
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
