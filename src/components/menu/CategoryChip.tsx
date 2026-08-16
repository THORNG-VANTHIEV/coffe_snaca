import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface CategoryChipProps {
  to: string
  label: string
  icon: LucideIcon
  active?: boolean
}

/**
 * A category pill (spec §9). Chips are links, not buttons, so every category
 * has a shareable URL and the browser's back button behaves.
 */
export function CategoryChip({ to, label, icon: Icon, active = false }: CategoryChipProps) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 text-sm font-medium whitespace-nowrap',
        'transition duration-150 ease-out',
        active
          ? 'border-primary bg-primary text-on-primary shadow-card'
          : 'border-border bg-surface text-muted hover:border-border-strong hover:text-text',
      )}
    >
      <Icon
        className={cn('size-4 shrink-0', active ? 'text-on-primary' : 'text-accent')}
        aria-hidden="true"
      />
      {label}
    </Link>
  )
}
