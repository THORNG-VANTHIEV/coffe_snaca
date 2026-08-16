import { Moon, Sun, type LucideIcon } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { useTheme } from '@/hooks/useTheme'
import type { Theme } from './themeContext'
import { cn } from '@/utils/cn'

const OPTIONS: { value: Theme; icon: LucideIcon }[] = [
  { value: 'dark', icon: Moon },
  { value: 'light', icon: Sun },
]

/**
 * Segmented dark/light switch, built like the language toggle so the two
 * controls read as one pair in the header.
 *
 * Both states stay visible rather than showing a single "switch to…" button,
 * which leaves no doubt about which theme is currently on.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t.theme.label}
      className={cn(
        'flex items-center rounded-pill border border-border bg-surface p-0.5',
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = option.value === theme
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={t.theme[option.value]}
            title={t.theme[option.value]}
            onClick={() => setTheme(option.value)}
            className={cn(
              'grid min-h-10 w-9 place-items-center rounded-pill transition duration-150 sm:min-h-11 sm:w-10',
              active ? 'bg-primary text-on-primary shadow-sm' : 'text-muted hover:text-text',
            )}
          >
            <option.icon className="size-4" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
