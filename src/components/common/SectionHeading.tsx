import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  icon?: LucideIcon
  title: string
  /** Rendered on the right — usually a "View all" link. */
  action?: ReactNode
  id?: string
  className?: string
}

export function SectionHeading({
  icon: Icon,
  title,
  action,
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
      <h2 id={id} className="flex items-center gap-2 text-lg font-semibold text-text sm:text-xl">
        {Icon && <Icon className="size-5 shrink-0 text-accent" aria-hidden="true" />}
        {title}
      </h2>
      {action}
    </div>
  )
}
