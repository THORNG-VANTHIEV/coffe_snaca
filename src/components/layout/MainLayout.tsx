import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLanguage } from '@/hooks/useLanguage'
import { useMenuState } from '@/hooks/useMenu'
import { ErrorState } from '@/components/common/ErrorState'
import { Footer } from '@/components/common/Footer'
import { Header } from '@/components/common/Header'
import { PromoModal } from '@/features/promo/PromoModal'
import { usePromoGate } from '@/features/promo/usePromoGate'
import { getDiscountedProducts } from '@/services/promotion'
import { SplashScreen } from '@/features/splash/SplashScreen'
import { useWelcomeGate } from '@/features/splash/useWelcomeGate'
import { cn } from '@/utils/cn'

/**
 * The single gate between "menu data exists" and "it does not".
 *
 * Pages render only once the data is ready, so none of them needs a null
 * check or a loading branch of its own.
 */
export function MainLayout() {
  const { status, data, reload } = useMenuState()
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const { showWelcome, isLeaving, dismissWelcome, completeWelcome } = useWelcomeGate()
  const welcomeWasVisible = useRef(showWelcome)

  // Only once the welcome is out of the way: two overlays on a freshly
  // scanned QR code is one too many, and the offer would be counted as seen
  // while the splash covered it.
  const promo = usePromoGate(data?.settings, Boolean(data) && !showWelcome)

  // Restore keyboard/screen-reader position only after React has removed
  // `inert` from the menu underneath the departing welcome.
  useEffect(() => {
    if (welcomeWasVisible.current && !showWelcome) {
      mainRef.current?.focus({ preventScroll: true })
    }
    welcomeWasVisible.current = showWelcome
  }, [showWelcome])

  if (status === 'loading') return <SplashScreen />

  if (status === 'error') {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-4 py-16">
        <ErrorState onRetry={reload} />
      </div>
    )
  }

  return (
    <>
      <div
        className={cn(
          'flex min-h-dvh flex-col bg-bg',
          showWelcome && 'fixed inset-0 overflow-hidden',
        )}
        aria-hidden={showWelcome || undefined}
        inert={showWelcome || undefined}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-on-primary"
        >
          {t.common.skipToContent}
        </a>

        <Header />

        <main ref={mainRef} id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <div key={pathname} className="animate-page-enter">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>

      {showWelcome && data ? (
        <SplashScreen
          settings={data.settings}
          onContinue={dismissWelcome}
          exiting={isLeaving}
          onExitComplete={completeWelcome}
        />
      ) : null}

      {promo.promotion ? (
        <PromoModal
          promotion={promo.promotion}
          products={data ? getDiscountedProducts(data.products, data.settings) : []}
          onClose={promo.close}
          onHold={promo.hold}
        />
      ) : null}
    </>
  )
}
