import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCategories, useProducts } from '@/hooks/useMenu'
import { buildSearchIndex, searchProducts, type SearchIndex } from '@/utils/search'

/**
 * The query lives in `?q=` so a search is shareable and the back button
 * undoes it. Updates replace the history entry — typing eight letters should
 * not cost eight taps of "back".
 *
 * `?table=` and any other parameter are carried through untouched.
 */
export function useSearchQuery(): [string, (next: string) => void] {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''

  const setQuery = useCallback(
    (next: string) => {
      setParams(
        (previous) => {
          const updated = new URLSearchParams(previous)
          if (next.trim()) updated.set('q', next)
          else updated.delete('q')
          return updated
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return [query, setQuery]
}

/** Pre-normalised haystack for the visible menu, rebuilt only when it changes. */
export function useSearchIndex(): SearchIndex {
  const products = useProducts()
  const categories = useCategories()
  return useMemo(() => buildSearchIndex(products, categories), [products, categories])
}

/**
 * Results for the current query. Filtering ~60 products is instant, so this
 * runs on every keystroke without a debounce (spec §8).
 */
export function useSearchResults(query: string) {
  const index = useSearchIndex()
  return useMemo(() => searchProducts(index, query), [index, query])
}
