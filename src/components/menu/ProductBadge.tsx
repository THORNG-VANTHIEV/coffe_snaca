import { Flame, Sparkles, Star } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/cn'

export type BadgeKind = 'bestSeller' | 'recommended' | 'featured'

/**
 * Warm brand tones only — red is reserved for "unavailable", so it never
 * doubles as a promotional colour.
 */
const STYLES: Record<BadgeKind, string> = {
  bestSeller: 'bg-accent text-on-accent',
  recommended: 'bg-primary text-on-primary',
  // `text-on-secondary` rather than white: in the dark theme the secondary
  // tone is a light tan, and white on it falls to 2.4:1.
  featured: 'bg-secondary text-on-secondary',
}

const ICONS = { bestSeller: Flame, recommended: Sparkles, featured: Star } as const

/** Best seller / recommended markers (spec §10, §11, §12). */
export function ProductBadge({ kind, className }: { kind: BadgeKind; className?: string }) {
  const { t } = useLanguage()
  const Icon = ICONS[kind]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2 py-1 text-[11px] leading-none font-semibold shadow-sm',
        STYLES[kind],
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {t.badges[kind]}
    </span>
  )
}
