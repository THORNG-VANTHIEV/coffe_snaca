import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/cn'

/**
 * Compact `ខ្មែរ` / `EN` switch (spec §18), shaped like the theme button so
 * the two header controls read as a pair.
 *
 * It shows the language you would switch *to*, written in that language's own
 * script — the dominant convention for a two-language toggle, and the same
 * "show the target" logic the theme button uses. The accessible name spells
 * the action out, also in the target language, so a Khmer reader who has
 * landed on the English menu can still recognise the way back.
 *
 * The button grows a little for the wider Khmer label rather than forcing it
 * into a fixed circle, which would clip the subscript consonant.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { language, toggleLanguage, t } = useLanguage()

  const goingEnglish = language === 'km'
  const label = goingEnglish ? t.common.switchToEnglish : t.common.switchToKhmer
  const code = goingEnglish ? 'EN' : 'ខ្មែរ'

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={label}
      title={label}
      className={cn(
        'grid min-h-11 min-w-11 shrink-0 place-items-center rounded-pill border border-border bg-surface px-2.5',
        'text-xs font-semibold text-muted',
        'transition duration-150 ease-out hover:text-text active:scale-95',
        className,
      )}
    >
      <span lang={goingEnglish ? 'en' : 'km'} aria-hidden="true">
        {code}
      </span>
    </button>
  )
}
