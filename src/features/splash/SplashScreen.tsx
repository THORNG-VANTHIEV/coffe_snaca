import { useLanguage } from '@/hooks/useLanguage'
import { ShopLogo } from '@/components/common/ShopLogo'
import { resolveAssetUrl } from '@/utils/url'

/**
 * The moment between opening the QR link and the menu being ready (spec §7.1).
 *
 * The shop name lives in `db.json`, which is exactly what is still loading, so
 * the splash shows the logo asset alone rather than hard-coding a name into
 * the React source.
 */
export function SplashScreen() {
  const { t } = useLanguage()

  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-dvh place-items-center bg-bg px-6"
    >
      <div className="animate-fade-in flex flex-col items-center gap-6">
        <ShopLogo
          src={resolveAssetUrl('/images/logo/logo.png')}
          name=""
          className="size-20 shadow-card"
        />

        <span
          className="size-8 animate-spin rounded-pill border-[3px] border-accent/25 border-t-accent"
          aria-hidden="true"
        />

        <span className="sr-only">{t.states.loading}</span>
      </div>
    </div>
  )
}
