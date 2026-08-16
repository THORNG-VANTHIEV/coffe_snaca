import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCategories } from '@/hooks/useMenu'
import { readStored, STORAGE_KEYS, writeStored } from '@/utils/storage'

/** Sentinel written to storage when the customer explicitly picked "All". */
const ALL = 'all'

/**
 * Remembers the category the customer was last browsing (spec §46).
 *
 * Called from the category page, which owns its slug through the route.
 */
export function useRememberCategory(slug: string | null): void {
  useEffect(() => {
    writeStored(STORAGE_KEYS.lastCategory, slug ?? ALL)
  }, [slug])
}

export interface CategoryFilter {
  /** Active category slug, or null for "All". */
  slug: string | null
  /** Builds a URL for a chip, preserving `?q=` and `?table=`. */
  hrefFor: (slug: string | null) => string
}

/**
 * Category filtering on `/menu`, driven by `?category=`.
 *
 * Arriving without a parameter restores the last category the customer
 * chose. The active chip stays visible with "All" right beside it, so the
 * filter is never a mystery.
 */
export function useCategoryFilter(): CategoryFilter {
  const [params, setParams] = useSearchParams()
  const categories = useCategories()
  const restored = useRef(false)

  const slug = params.get('category')

  useEffect(() => {
    if (restored.current) return
    restored.current = true
    if (slug !== null) return

    const remembered = readStored(STORAGE_KEYS.lastCategory)
    if (!remembered || remembered === ALL) return
    if (!categories.some((category) => category.slug === remembered)) return

    setParams(
      (previous) => {
        const updated = new URLSearchParams(previous)
        updated.set('category', remembered)
        return updated
      },
      { replace: true },
    )
  }, [slug, categories, setParams])

  useEffect(() => {
    writeStored(STORAGE_KEYS.lastCategory, slug ?? ALL)
  }, [slug])

  const hrefFor = useCallback(
    (next: string | null) => {
      const updated = new URLSearchParams(params)
      if (next) updated.set('category', next)
      else updated.delete('category')
      const search = updated.toString()
      return search ? `/menu?${search}` : '/menu'
    },
    [params],
  )

  return { slug, hrefFor }
}
