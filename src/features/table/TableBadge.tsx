import { Armchair } from 'lucide-react'
import type { Table } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/cn'

/**
 * The scanned table (spec §7.2). The header gives it a full row on phones and
 * an inline slot from `sm` up, so the label always has room to spell itself
 * out.
 */
export function TableBadge({ table, className }: { table: Table; className?: string }) {
  const { t } = useLanguage()

  return (
    <span
      className={cn(
        'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-3 text-sm font-medium text-text',
        className,
      )}
    >
      <Armchair className="size-4 text-accent" aria-hidden="true" />
      {t.header.table}
      <span className="tabular-nums">{table.number}</span>
    </span>
  )
}
