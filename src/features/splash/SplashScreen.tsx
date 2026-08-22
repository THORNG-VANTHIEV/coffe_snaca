import { useEffect } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { Settings } from '@/models'
import { Button } from '@/components/common/Button'
import { ShopLogo } from '@/components/common/ShopLogo'
import { useLanguage } from '@/hooks/useLanguage'
import { shopName, shopTagline } from '@/utils/translation'
import { MOTION_DURATION_MS, prefersReducedMotion } from '@/utils/motion'
import { resolveAssetUrl } from '@/utils/url'
import { cn } from '@/utils/cn'

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
  exiting = false,
  onExitComplete,
}: {
  settings?: Settings
  onContinue?: () => void
  exiting?: boolean
  onExitComplete?: () => void
}) {
  const { language, t } = useLanguage()
  const ready = settings !== undefined && onContinue !== undefined
  const name = settings ? shopName(settings, language) : ''
  const tagline = settings ? shopTagline(settings, language) : ''
  // Loaded settings are already mapped to a base-aware URL; only the static
  // loading fallback still needs resolving here.
  const logo = settings?.logo || resolveAssetUrl('/images/logo/logo.png')

  // Animation events are the normal completion path. The timer is a safety
  // net for browsers or user styles that suppress them entirely.
  useEffect(() => {
    if (!exiting || !onExitComplete) return

    const delay = prefersReducedMotion() ? 0 : MOTION_DURATION_MS.standard + 80
    const timeout = window.setTimeout(onExitComplete, delay)
    return () => window.clearTimeout(timeout)
  }, [exiting, onExitComplete])

  return (
    <section
      aria-labelledby={ready ? 'welcome-title' : undefined}
      onAnimationEnd={(event) => {
        if (
          exiting &&
          event.target === event.currentTarget &&
          event.animationName === 'welcome-exit'
        ) {
          onExitComplete?.()
        }
      }}
      className={cn(
        'relative isolate grid min-h-dvh place-items-center overflow-hidden bg-bg/65 backdrop-blur-md px-5 py-10 transition-colors duration-300',
        ready && 'fixed inset-0 z-50',
        exiting && 'pointer-events-none animate-welcome-exit',
      )}
    >
      {/* Dynamic ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span className="absolute -top-40 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px] transition-all duration-700" />
        <span className="absolute -bottom-40 -left-20 size-80 rounded-full bg-accent/15 blur-[90px]" />
        <span className="absolute -top-20 -right-20 size-80 rounded-full bg-surface-3/20 blur-[80px]" />
      </div>

      {/* Glassmorphic Card Container */}
      <div className="animate-fade-rise relative flex w-[calc(100vw-2.5rem)] min-w-0 max-w-sm flex-col items-center rounded-[2.25rem] border border-border/80 bg-surface/85 px-7 py-9 text-center shadow-raised backdrop-blur-xl sm:px-10 sm:py-11">
        {/* Top accent gradient line */}
        <span
          className="absolute inset-x-10 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          aria-hidden="true"
        />

        {/* Clean, un-bordered logo display */}
        <div className="flex items-center justify-center py-2 transition-transform duration-300 hover:scale-105">
          <ShopLogo
            src={logo}
            name=""
            className="h-14 sm:h-18 object-contain drop-shadow-sm"
          />
        </div>

        {ready ? (
          <>
            {/* The logo above already spells out the shop name, so the
                heading stays for its accessible name without repeating it
                on screen. */}
            <h1 id="welcome-title" className="sr-only">
              {name || t.common.appName}
            </h1>

            {/* Welcome Eyebrow Badge */}
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-pill border border-border/60 bg-surface-2/60 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted shadow-xs">
              <Sparkles className="size-3 text-accent" aria-hidden="true" />
              <span>{t.welcome.eyebrow}</span>
            </div>

            {tagline ? (
              <p className="mt-3.5 max-w-xs text-sm font-medium leading-relaxed text-text/90 sm:text-base">
                {tagline}
              </p>
            ) : null}

            <Button
              onClick={onContinue}
              disabled={exiting}
              className="group mt-8 w-full shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span>{t.welcome.cta}</span>
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Button>

            <p className="mt-3 text-xs text-muted/80 font-normal">
              {t.welcome.continueHint}
            </p>
          </>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-3 py-4" role="status" aria-live="polite">
            <span
              className="block size-9 animate-spin rounded-pill border-[3px] border-primary/20 border-t-primary"
              aria-hidden="true"
            />
            <span className="sr-only">{t.states.loading}</span>
          </div>
        )}
      </div>
    </section>
  )
}
