import { Outlet } from 'react-router-dom'
import { useLanguage } from '@/hooks/useLanguage'
import { useMenuState } from '@/hooks/useMenu'
import { ErrorState } from '@/components/common/ErrorState'
import { Footer } from '@/components/common/Footer'
import { Header } from '@/components/common/Header'
import { SplashScreen } from '@/features/splash/SplashScreen'
import { useWelcomeGate } from '@/features/splash/useWelcomeGate'

/**
 * The single gate between "menu data exists" and "it does not".
 *
 * Pages render only once the data is ready, so none of them needs a null
 * check or a loading branch of its own.
 */
export function MainLayout() {
  const { status, data, reload } = useMenuState()
  const { t } = useLanguage()
  const { showWelcome, dismissWelcome } = useWelcomeGate()

  if (status === 'loading') return <SplashScreen />

  if (status === 'error') {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-4 py-16">
        <ErrorState onRetry={reload} />
      </div>
    )
  }

  if (showWelcome && data) {
    return <SplashScreen settings={data.settings} onContinue={dismissWelcome} />
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-on-primary"
      >
        {t.common.skipToContent}
      </a>

      <Header />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
