import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface CategoryChipProps {
  to?: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  label: string
  icon: LucideIcon
  active?: boolean
}

/**
 * A category pill (spec §9). Can act as a router Link or interactive button.
 */
export function CategoryChip({ to, onClick, label, icon: Icon, active = false }: CategoryChipProps) {
  const commonClasses = cn(
    'inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 text-sm font-medium whitespace-nowrap cursor-pointer select-none',
    'transition duration-[var(--motion-fast)] ease-out',
    active
      ? 'border-primary bg-primary text-on-primary shadow-sm font-semibold'
      : 'border-border/80 bg-surface text-muted hover:border-border-strong hover:text-text',
  )

  if (to && !onClick) {
    return (
      <Link
        to={to}
        aria-current={active ? 'page' : undefined}
        className={commonClasses}
      >
        <Icon
          className={cn('size-4 shrink-0', active ? 'text-on-primary' : 'text-accent')}
          aria-hidden="true"
        />
        {label}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={commonClasses}
    >
      <Icon
        className={cn('size-4 shrink-0', active ? 'text-on-primary' : 'text-accent')}
        aria-hidden="true"
      />
      {label}
    </button>
  )
}

