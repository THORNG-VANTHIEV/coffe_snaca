import { Flame, Snowflake, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import type { Temperature } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/cn'

interface TemperatureFilterProps {
  /** The chosen temperature, or null for the whole menu. */
  value: Temperature | null
  onChange: (value: Temperature | null) => void
  className?: string
}

const CHOICES: { value: Temperature | null; key: 'all' | Temperature; icon: LucideIcon }[] = [
  { value: null, key: 'all', icon: UtensilsCrossed },
  { value: 'hot', key: 'hot', icon: Flame },
  { value: 'iced', key: 'iced', icon: Snowflake },
]

/**
 * All / Hot / Iced, as one segmented control.
 *
 * Categories group drinks by flavour — matcha with matcha, tea with tea — so
 * a customer who just wants something hot would otherwise read every section
 * to find them. This cuts across the categories instead.
 */
export function TemperatureFilter({ value, onChange, className }: TemperatureFilterProps) {
  const { t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t.temperatureFilter.label}
      className={cn(
        'grid grid-cols-3 gap-1 rounded-pill border border-border/80 bg-surface p-1 shadow-xs sm:max-w-sm',
        className,
      )}
    >
      {CHOICES.map(({ value: choice, key, icon: Icon }) => {
        const active = choice === value

        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(choice)}
            className={cn(
              'inline-flex min-h-10 cursor-pointer select-none items-center justify-center gap-2 rounded-pill px-3 text-sm whitespace-nowrap',
              'transition duration-[var(--motion-fast)] ease-out',
              active
                ? 'bg-primary font-semibold text-on-primary shadow-sm'
                : 'font-medium text-muted hover:bg-surface-2 hover:text-text',
            )}
          >
            <Icon
              className={cn('size-4 shrink-0', active ? 'text-on-primary' : 'text-accent')}
              aria-hidden="true"
            />
            {t.temperatureFilter[key]}
          </button>
        )
      })}
    </div>
  )
}
