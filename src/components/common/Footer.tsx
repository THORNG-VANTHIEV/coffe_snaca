import { Clock, MapPin, Phone } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { useSettings } from '@/hooks/useMenu'
import { FacebookIcon, TelegramIcon } from './BrandIcons'
import { ShopLogo } from './ShopLogo'
import { shopAddress, shopName, shopOpeningHours, shopTagline } from '@/utils/translation'

/** Shop details and social links (spec §62). */
export function Footer() {
  const settings = useSettings()
  const { language, t } = useLanguage()

  const name = shopName(settings, language)
  const address = shopAddress(settings, language)
  const hours = shopOpeningHours(settings, language)
  const tagline = shopTagline(settings, language)

  const socials = [
    { href: settings.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: settings.telegram, label: 'Telegram', Icon: TelegramIcon },
  ].filter((social) => social.href !== '')

  return (
    <footer className="mt-16 border-t border-border bg-surface-2/70">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-3">
          <ShopLogo src={settings.logo} name={name} className="h-9" />
          {tagline && <p className="text-sm text-muted">{tagline}</p>}
        </div>

        <dl className="flex flex-col gap-3 text-sm">
          {address && (
            <div className="flex gap-2.5">
              <dt className="pt-0.5">
                <MapPin className="size-4 text-accent" aria-hidden="true" />
                <span className="sr-only">{t.footer.address}</span>
              </dt>
              <dd className="text-muted">{address}</dd>
            </div>
          )}

          {settings.phone && (
            <div className="flex gap-2.5">
              <dt className="pt-0.5">
                <Phone className="size-4 text-accent" aria-hidden="true" />
                <span className="sr-only">{t.footer.phone}</span>
              </dt>
              <dd>
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="text-muted underline-offset-4 hover:text-text hover:underline"
                >
                  {settings.phone}
                </a>
              </dd>
            </div>
          )}

          {hours && (
            <div className="flex gap-2.5">
              <dt className="pt-0.5">
                <Clock className="size-4 text-accent" aria-hidden="true" />
                <span className="sr-only">{t.footer.hours}</span>
              </dt>
              <dd className="text-muted">
                <span className="block">{t.footer.hours}</span>
                <span className="block tabular-nums">{hours}</span>
              </dd>
            </div>
          )}
        </dl>

        {socials.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-text">{t.footer.follow}</p>
            <ul className="flex gap-2.5">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-pill border border-border bg-surface text-muted transition duration-150 hover:text-accent-strong"
                  >
                    <Icon className="size-4.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-border/70">
        <p className="container-page py-5 text-center text-xs text-muted">
          © {new Date().getFullYear()} {name}. {t.footer.rights}
        </p>
      </div>
    </footer>
  )
}
