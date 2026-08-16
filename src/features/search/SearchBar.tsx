import { Search, X } from 'lucide-react'
import { useId } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/cn'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Live menu search (spec §8). Submitting is a no-op — results are already on
 * screen — but the form element keeps the on-screen keyboard's "search" key
 * from reloading the page.
 */
export function SearchBar({ value, onChange, className }: SearchBarProps) {
  const { t } = useLanguage()
  const inputId = useId()

  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className={cn('relative', className)}
    >
      <label htmlFor={inputId} className="sr-only">
        {t.search.label}
      </label>

      <Search
        className="pointer-events-none absolute top-1/2 start-4 size-4.5 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />

      <input
        id={inputId}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        placeholder={t.search.placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-12 w-full rounded-pill border border-border-interactive bg-surface ps-11 pe-11 text-[15px] text-text shadow-card',
          'placeholder:text-muted focus:border-accent-strong focus:outline-none',
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t.search.clear}
          className="absolute top-1/2 end-2 grid size-9 -translate-y-1/2 place-items-center rounded-pill text-muted transition duration-150 hover:bg-surface-2 hover:text-text"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </form>
  )
}
