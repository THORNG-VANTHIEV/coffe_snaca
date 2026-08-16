import type { Language } from '@/models'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/cn'

const OPTIONS: { value: Language; label: string; lang: string }[] = [
  { value: 'km', label: 'ខ្មែរ', lang: 'km' },
  { value: 'en', label: 'EN', lang: 'en' },
]

/**
 * `ខ្មែរ | EN` segmented switch (spec §18). Each language is written in its
 * own script so it is recognisable whichever one you read.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cn(
        'flex items-center rounded-pill border border-border bg-surface p-0.5',
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = option.value === language
        return (
          <button
            key={option.value}
            type="button"
            lang={option.lang}
            aria-pressed={active}
            onClick={() => setLanguage(option.value)}
            className={cn(
              'min-h-10 rounded-pill px-2.5 text-sm leading-none font-medium transition duration-150 sm:min-h-11 sm:px-3',
              active
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-muted hover:text-text',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
