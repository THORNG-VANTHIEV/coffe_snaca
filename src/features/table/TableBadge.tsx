import { Armchair } from 'lucide-react'
import type { Table } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/cn'

/**
 * The scanned table (spec §7.2).
 *
 * On narrow phones only the icon and number are shown so the sticky header
 * stays one row tall; the full label comes back from `sm` up. Either way the
 * accessible name spells it out, so nothing is lost when the word is hidden.
 */
export function TableBadge({ table, className }: { table: Table; className?: string }) {
  const { t } = useLanguage()
  const label = `${t.header.table} ${table.number}`

  return (
    <span
      className={cn(
        'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-2.5 text-sm font-medium text-text sm:px-3',
        className,
      )}
      aria-label={label}
      title={label}
    >
      <Armchair className="size-4 text-accent" aria-hidden="true" />
      <span className="hidden sm:inline" aria-hidden="true">
        {t.header.table}
      </span>
      <span className="tabular-nums" aria-hidden="true">
        {table.number}
      </span>
    </span>
  )
}
