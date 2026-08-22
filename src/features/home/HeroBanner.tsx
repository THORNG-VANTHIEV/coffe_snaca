import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/components/common/Button'
import { useLanguage } from '@/hooks/useLanguage'
import { useSettings } from '@/hooks/useMenu'
import { useTable } from '@/hooks/useTable'
import { HeroSlideshow } from './HeroSlideshow'
import { shopName, shopTagline } from '@/utils/translation'
import { resolveAssetUrl } from '@/utils/url'

/** Used only when the shop has not listed any `hero_images` in db.json. */
const FALLBACK_HERO = [resolveAssetUrl('/images/banners/hero-1.webp')]

/**
 * Promotional banner (spec §7.2). Deliberately short on phones — the menu is
 * what the customer scanned for.
 *
 * It also carries the welcome line: with a valid table it greets the table,
 * and with an unknown `?table=` value it simply greets the shop, never an
 * error (spec §21).
 */
export function HeroBanner() {
  const settings = useSettings()
  const { language, t } = useLanguage()
  const { table } = useTable()

  const name = shopName(settings, language)
  const tagline = shopTagline(settings, language)
  const slides = settings.heroImages.length > 0 ? settings.heroImages : FALLBACK_HERO

  const welcome = table
    ? `${t.header.welcome} · ${t.header.table} ${table.number}`
    : `${t.header.welcome} · ${name}`

  return (
    <section className="relative isolate overflow-hidden rounded-card shadow-card">
      <HeroSlideshow images={slides} />

      <div
        className="absolute inset-0 bg-gradient-to-r from-[var(--overlay-from)] via-[var(--overlay-from)] to-[var(--overlay-to)]"
        aria-hidden="true"
      />

      <div className="relative flex min-h-[15rem] flex-col justify-end gap-3 p-6 sm:min-h-[19rem] sm:p-9 lg:min-h-[23rem] lg:p-12">
        <p className="text-xs font-medium tracking-wide text-white/75 sm:text-sm">{welcome}</p>

        <h1 className="max-w-lg text-2xl leading-tight font-semibold text-white sm:text-4xl lg:text-[2.75rem]">
          {t.hero.titleLine1}
          <span className="block text-white">{t.hero.titleLine2}</span>
        </h1>

        <p className="max-w-md text-sm text-white/85 sm:text-base">
          {tagline || t.hero.subtitle}
        </p>

        <ButtonLink to="/menu" variant="onImage" className="mt-2 w-fit">
          {t.hero.cta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      </div>
    </section>
  )
}
