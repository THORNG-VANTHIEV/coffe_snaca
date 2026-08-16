import { CircleAlert, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from './Button'

/**
 * The friendly face of a failed load. Raw JavaScript errors go to the console
 * for the developer and never to the customer (spec §41).
 */
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useLanguage()

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-card border border-border bg-surface px-6 py-14 text-center shadow-card"
    >
      <span className="grid size-12 place-items-center rounded-pill bg-danger-soft text-danger">
        <CircleAlert className="size-6" aria-hidden="true" />
      </span>

      <h2 className="text-lg font-semibold text-text">{t.states.errorTitle}</h2>
      <p className="text-sm text-muted">{t.states.errorBody}</p>

      {onRetry && (
        <Button onClick={onRetry} className="mt-2">
          <RefreshCw className="size-4" aria-hidden="true" />
          {t.states.retry}
        </Button>
      )}
    </div>
  )
}
