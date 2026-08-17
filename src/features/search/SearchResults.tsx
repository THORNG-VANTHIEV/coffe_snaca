import { SearchX } from 'lucide-react'
import type { Product } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { EmptyState } from '@/components/common/EmptyState'
import { ProductGrid } from '@/components/menu/ProductGrid'

/** Live results panel shared by the home and menu views (spec §8, §43). */
export function SearchResults({ query, results }: { query: string; results: Product[] }) {
  const { t } = useLanguage()
  const motionKey = `${query.trim().toLocaleLowerCase()}:${results.map((product) => product.id).join(',')}`

  if (results.length === 0) {
    return (
      <div key={motionKey} className="animate-results-enter">
        <EmptyState
          icon={SearchX}
          title={t.search.noResultsTitle}
          body={t.search.noResultsBody}
        />
      </div>
    )
  }

  return (
    <section key={motionKey} className="animate-results-enter" aria-live="polite">
      <p className="mb-4 text-sm text-muted">
        <span className="font-medium text-text tabular-nums">{results.length}</span>{' '}
        {results.length === 1 ? t.search.countOne : t.search.countOther}
        {' · '}
        {t.search.resultsFor} “{query.trim()}”
      </p>

      <ProductGrid products={results} priorityCount={2} />
    </section>
  )
}
