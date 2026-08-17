import { ArrowRight } from 'lucide-react'
import type { Settings } from '@/models'
import { Button } from '@/components/common/Button'
import { ShopLogo } from '@/components/common/ShopLogo'
import { useLanguage } from '@/hooks/useLanguage'
import { shopName, shopTagline } from '@/utils/translation'
import { resolveAssetUrl } from '@/utils/url'

/**
 * The short, branded moment between scanning the QR code and viewing the menu
 * (spec §7.1).
 *
 * While db.json is loading it remains a plain status screen. Once the data is
 * ready, MainLayout supplies the real shop identity and an immediate escape
 * hatch. The customer decides when to continue.
 */
export function SplashScreen({
  settings,
  onContinue,
}: {
  settings?: Settings
  onContinue?: () => void
}) {
  const { language, t } = useLanguage()
  const ready = settings !== undefined && onContinue !== undefined
  const name = settings ? shopName(settings, language) : ''
  const tagline = settings ? shopTagline(settings, language) : ''
  // Loaded settings are already mapped to a base-aware URL; only the static
  // loading fallback still needs resolving here.
  const logo = settings?.logo || resolveAssetUrl('/images/logo/logo.png')

  return (
    <section
      aria-labelledby={ready ? 'welcome-title' : undefined}
      className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-bg px-5 py-10"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span className="absolute -top-36 left-1/2 size-96 -translate-x-1/2 rounded-pill bg-accent/[0.12] blur-3xl" />
        <span className="absolute -right-28 -bottom-36 size-80 rounded-pill bg-primary/[0.08] blur-3xl" />
      </div>

      <div className="animate-fade-rise relative flex w-[calc(100vw-2.5rem)] min-w-0 max-w-sm flex-col items-center rounded-[2rem] border border-border bg-surface/90 px-6 py-9 text-center shadow-raised backdrop-blur-md sm:px-9 sm:py-11">
        <span
          className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
          aria-hidden="true"
        />

        <ShopLogo
          src={logo}
          name=""
          className="size-24 border-4 border-surface shadow-raised ring-1 ring-border-strong sm:size-28"
        />

        {ready ? (
          <>
            <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-accent-strong uppercase">
              {t.welcome.eyebrow}
            </p>

            <h1 id="welcome-title" className="mt-2 text-3xl leading-tight text-text sm:text-4xl">
              {name || t.common.appName}
            </h1>

            {tagline ? <p className="mt-3 max-w-xs text-sm text-muted sm:text-base">{tagline}</p> : null}

            <Button onClick={onContinue} className="mt-8 w-full">
              {t.welcome.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>

            <p className="mt-3 text-xs text-muted">
              {t.welcome.continueHint}
            </p>
          </>
        ) : (
          <div className="mt-7" role="status" aria-live="polite">
            <span
              className="mx-auto block size-8 animate-spin rounded-pill border-[3px] border-accent/25 border-t-accent"
              aria-hidden="true"
            />

            <span className="sr-only">{t.states.loading}</span>
          </div>
        )}
      </div>
    </section>
  )
}
