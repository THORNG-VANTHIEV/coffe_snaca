import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * A block of product information (spec §60).
 *
 * Everything inside is deliberately non-interactive: version 1 has no
 * ordering, so options are read as a description of what is possible, not as
 * controls that pretend to do something (spec §14).
 */
export function OptionSection({
  icon: Icon,
  title,
  children,
}: {
  icon?: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-border pt-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
        {Icon && <Icon className="size-4 text-accent" aria-hidden="true" />}
        {title}
      </h2>
      {children}
    </section>
  )
}

export interface OptionItem {
  key: string
  label: string
  icon?: LucideIcon
  /** Secondary text, e.g. the surcharge on an extra. */
  hint?: string | null
}

export function OptionChips({ items }: { items: OptionItem[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item.key}
          className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-3 py-2 text-sm text-text"
        >
          {item.icon && <item.icon className="size-4 text-muted" aria-hidden="true" />}
          {item.label}
          {item.hint && <span className="text-xs text-muted">{item.hint}</span>}
        </li>
      ))}
    </ul>
  )
}
