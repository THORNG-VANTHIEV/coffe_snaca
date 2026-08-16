import { Check, CircleSlash } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/cn'

interface AvailabilityBadgeProps {
  available: boolean
  /** Cards use the short label; the detail page spells it out. */
  compact?: boolean
  className?: string
}

/**
 * Availability is carried by an icon and words, never by colour alone
 * (spec §16, §47).
 */
export function AvailabilityBadge({ available, compact, className }: AvailabilityBadgeProps) {
  const { t } = useLanguage()
  const Icon = available ? Check : CircleSlash

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium',
        available
          ? 'bg-success-soft text-success'
          : 'bg-danger-soft text-danger',
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {available
        ? t.availability.available
        : compact
          ? t.availability.unavailableShort
          : t.availability.unavailable}
    </span>
  )
}
