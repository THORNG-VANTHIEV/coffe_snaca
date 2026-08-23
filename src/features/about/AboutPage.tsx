import { Clock, Info, MapPin, Phone } from 'lucide-react'
import { FacebookIcon, TelegramIcon } from '@/components/common/BrandIcons'
import { ShopLogo } from '@/components/common/ShopLogo'
import { useLanguage } from '@/hooks/useLanguage'
import { useSettings } from '@/hooks/useMenu'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  shopAddress,
  shopName,
  shopOpeningHours,
  shopTagline,
} from '@/utils/translation'

/** Shop information (spec §27, §62). */
export function AboutPage() {
  const settings = useSettings()
  const { language, t } = useLanguage()

  const name = shopName(settings, language)
  const tagline = shopTagline(settings, language)
  const address = shopAddress(settings, language)
  const hours = shopOpeningHours(settings, language)

  useDocumentTitle(`${t.about.title} | ${name}`)

  const details = [
    { icon: MapPin, label: t.about.visit, value: address },
    { icon: Phone, label: t.about.contact, value: settings.phone, href: `tel:${settings.phone.replace(/\s+/g, '')}` },
    { icon: Clock, label: t.about.hours, value: hours },
  ].filter((detail) => detail.value !== '')

  const socials = [
    settings.facebook ? { href: settings.facebook, label: 'Facebook', Icon: FacebookIcon, external: true } : null,
    settings.telegram ? { href: settings.telegram, label: 'Telegram', Icon: TelegramIcon, external: true } : null,
    settings.phone ? { href: `tel:${settings.phone.replace(/\s+/g, '')}`, label: settings.phone, Icon: Phone, external: false } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null)

  return (
    // Narrows the column by overriding the container's own custom property.
    // Stacking `max-w-3xl` on top of `container-page` would instead depend on
    // which of the two Tailwind happens to emit last.
    <div className="container-page [--container-page:64rem] py-8 md:py-12">
      <header className="flex flex-col items-center text-center rounded-card border border-border/70 bg-surface/50 p-8 shadow-card backdrop-blur-sm sm:p-12">
        <ShopLogo src={settings.logo} name={name} className="h-16 shadow-card sm:h-20" />
        <h1 className="sr-only">{name}</h1>
        {tagline && (
          <p className="mt-4 text-base font-medium text-text sm:text-lg">{tagline}</p>
        )}
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{t.about.intro}</p>
      </header>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
        {details.map(({ icon: Icon, label, value, href }) => (
          <div
            key={label}
            className="flex flex-col gap-2.5 rounded-card border border-border/70 bg-surface p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-raised"
          >
            <dt className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted uppercase">
              <Icon className="size-4 text-accent" aria-hidden="true" />
              {label}
            </dt>
            <dd className="text-sm font-medium text-text">
              {href ? (
                <a href={href} className="transition duration-150 hover:text-accent-strong hover:underline">
                  {value}
                </a>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>

      {socials.length > 0 && (
        <section className="mt-10 rounded-card border border-border/70 bg-surface/50 p-6 text-center shadow-card backdrop-blur-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text/90">{t.about.follow}</h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-3">
            {socials.map(({ href, label, Icon, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                  aria-label={label}
                  className="flex items-center gap-2.5 rounded-pill border border-border bg-surface px-4 py-2.5 text-xs font-medium text-muted shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:text-text hover:shadow-raised"
                >
                  <Icon className="size-4 text-accent" />
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 flex items-start justify-center gap-2.5 rounded-card border border-border/60 bg-surface-2/60 p-4 text-center text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        {t.about.menuNote}
      </p>
    </div>
  )
}
