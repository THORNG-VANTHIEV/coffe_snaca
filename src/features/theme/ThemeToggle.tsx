import { Moon, Sun } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'

/**
 * Compact dark/light switch.
 *
 * A single button rather than a two-segment control: with only two themes the
 * segmented version was as wide as the language switch for half the
 * information, and the header has no room to spare on a 360px phone.
 *
 * The icon shows the theme you would switch *to*, and the label says exactly
 * that, so the glyph and the accessible name never disagree.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()

  const goingDark = theme === 'light'
  const label = goingDark ? t.theme.toDark : t.theme.toLight
  const Icon = goingDark ? Moon : Sun

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'grid size-11 shrink-0 place-items-center rounded-pill border border-border bg-surface text-muted',
        'transition duration-150 ease-out hover:text-text active:scale-95',
        className,
      )}
    >
      <Icon className="size-4.5" aria-hidden="true" />
    </button>
  )
}
