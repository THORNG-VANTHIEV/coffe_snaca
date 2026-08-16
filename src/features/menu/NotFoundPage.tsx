import { Compass } from 'lucide-react'
import { ButtonLink } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { useLanguage } from '@/hooks/useLanguage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFoundPage() {
  const { t } = useLanguage()
  useDocumentTitle(t.states.notFoundTitle)

  return (
    <div className="container-page py-16">
      <EmptyState
        icon={Compass}
        title={t.states.notFoundTitle}
        body={t.states.notFoundBody}
        action={
          <ButtonLink to="/" className="mt-2">
            {t.states.backToMenu}
          </ButtonLink>
        }
      />
    </div>
  )
}
