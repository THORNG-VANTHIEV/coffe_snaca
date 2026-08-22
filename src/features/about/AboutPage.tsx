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
    { href: settings.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: settings.telegram, label: 'Telegram', Icon: TelegramIcon },
  ].filter((social) => social.href !== '')

  return (
    // Narrows the column by overriding the container's own custom property.
    // Stacking `max-w-3xl` on top of `container-page` would instead depend on
    // which of the two Tailwind happens to emit last.
    <div className="container-page [--container-page:48rem] py-8">
      <header className="flex flex-col items-center gap-4 text-center">
        <ShopLogo src={settings.logo} name={name} className="h-16 shadow-card sm:h-20" />
        {/* The logo already spells out the shop name, so the page heading
            stays for its accessible name without repeating it on screen. */}
        <h1 className="sr-only">{name}</h1>
        {tagline && <p className="text-sm text-muted">{tagline}</p>}
        <p className="max-w-xl text-[15px] leading-relaxed text-muted">{t.about.intro}</p>
      </header>

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        {details.map(({ icon: Icon, label, value, href }) => (
          <div
            key={label}
            className="flex flex-col gap-2 rounded-card border border-border bg-surface p-5 shadow-card"
          >
            <dt className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
              <Icon className="size-4 text-accent" aria-hidden="true" />
              {label}
            </dt>
            <dd className="text-sm text-text">
              {href ? (
                <a href={href} className="underline-offset-4 hover:underline">
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
        <section className="mt-8 text-center">
          <h2 className="text-sm font-semibold text-text">{t.about.follow}</h2>
          <ul className="mt-3 flex justify-center gap-3">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-pill border border-border bg-surface text-muted transition duration-150 hover:text-accent-strong"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 flex items-start justify-center gap-2 rounded-card bg-surface-2/70 p-4 text-center text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        {t.about.menuNote}
      </p>
    </div>
  )
}
