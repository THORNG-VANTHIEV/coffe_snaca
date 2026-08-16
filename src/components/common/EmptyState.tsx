import type { LucideIcon } from 'lucide-react'
import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  body?: string
  action?: ReactNode
}

/** Shown when a category or a search comes back with nothing (spec §40). */
export function EmptyState({ icon: Icon = SearchX, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border-strong bg-surface-2/60 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-pill bg-surface text-muted shadow-card">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      {body && <p className="max-w-sm text-sm text-muted">{body}</p>}
      {action}
    </div>
  )
}
