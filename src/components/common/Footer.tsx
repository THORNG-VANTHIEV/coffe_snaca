import { ChevronRight, Clock, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/hooks/useLanguage'
import { useSettings } from '@/hooks/useMenu'
import { FacebookIcon, TelegramIcon } from './BrandIcons'
import { ShopLogo } from './ShopLogo'
import { shopAddress, shopName, shopOpeningHours, shopTagline } from '@/utils/translation'

/** Shop details, quick links, and social connections (spec §62). */
export function Footer() {
  const settings = useSettings()
  const { language, t } = useLanguage()

  const name = shopName(settings, language)
  const address = shopAddress(settings, language)
  const hours = shopOpeningHours(settings, language)
  const tagline = shopTagline(settings, language)

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/menu', label: t.nav.menu },
    { to: '/about', label: t.nav.about },
  ]

  const socials = [
    settings.facebook ? { href: settings.facebook, label: 'Facebook', Icon: FacebookIcon, external: true } : null,
    settings.telegram ? { href: settings.telegram, label: 'Telegram', Icon: TelegramIcon, external: true } : null,
    settings.phone ? { href: `tel:${settings.phone.replace(/\s+/g, '')}`, label: settings.phone, Icon: Phone, external: false } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null)

  return (
    <footer className="relative mt-20 border-t border-border/80 bg-surface-2/80 backdrop-blur-sm">
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Col 1: Brand & Tagline */}
          <div className="flex flex-col gap-3 sm:col-span-2 md:col-span-1">
            <ShopLogo src={settings.logo} name={name} className="h-10" />
            {tagline && (
              <p className="text-sm font-medium text-text/90 leading-relaxed mt-1">
                {tagline}
              </p>
            )}
            <p className="text-xs text-muted leading-relaxed">
              {language === 'km'
                ? 'ហាងកាហ្វេក្នុងស្រុក ដែលផ្តល់ជូនកាហ្វេលីងថ្មីៗ ភេសជ្ជៈឈ្ងុយឆ្ងាញ់ និងបរិយាកាសស្ងប់ស្ងាត់។'
                : 'A local coffee shop offering fresh roasts, delicious drinks, and a cozy atmosphere.'}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/90">
              {t.footer.quickLinks}
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-1.5 text-muted transition duration-150 hover:translate-x-1 hover:text-accent-strong"
                  >
                    <ChevronRight className="size-3.5 text-accent/70" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact & Hours */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text/90">
              {t.about.contact}
            </h3>
            <dl className="flex flex-col gap-3 text-sm">
              {address && (
                <div className="flex items-start gap-2.5">
                  <dt className="pt-0.5 shrink-0">
                    <MapPin className="size-4 text-accent" aria-hidden="true" />
                    <span className="sr-only">{t.footer.address}</span>
                  </dt>
                  <dd className="text-muted leading-snug">{address}</dd>
                </div>
              )}

              {settings.phone && (
                <div className="flex items-center gap-2.5">
                  <dt className="shrink-0">
                    <Phone className="size-4 text-accent" aria-hidden="true" />
                    <span className="sr-only">{t.footer.phone}</span>
                  </dt>
                  <dd>
                    <a
                      href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                      className="text-muted font-medium tabular-nums transition duration-150 hover:text-accent-strong"
                    >
                      {settings.phone}
                    </a>
                  </dd>
                </div>
              )}

              {hours && (
                <div className="flex items-start gap-2.5">
                  <dt className="pt-0.5 shrink-0">
                    <Clock className="size-4 text-accent" aria-hidden="true" />
                    <span className="sr-only">{t.footer.hours}</span>
                  </dt>
                  <dd className="text-muted">
                    <span className="block text-xs text-muted/80">{t.footer.hours}</span>
                    <span className="block font-medium tabular-nums text-text/90">{hours}</span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Col 4: Social Connections */}
          {socials.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text/90">
                {t.footer.follow}
              </h3>
              <p className="text-xs text-muted">
                {language === 'km' ? 'តាមដានពួកយើងនៅលើបណ្តាញសង្គម' : 'Stay connected with us'}
              </p>
              <div className="flex flex-wrap gap-2.5 mt-1">
                {socials.map(({ href, label, Icon, external }) => (
                  <a
                    key={label}
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    aria-label={label}
                    className="flex items-center gap-2 rounded-pill border border-border bg-surface px-3.5 py-2 text-xs font-medium text-muted shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:text-text hover:shadow-raised"
                  >
                    <Icon className="size-4 text-accent" />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="border-t border-border/60 bg-surface-3/30">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted sm:flex-row">
          <p className="text-center sm:text-start">
            © {new Date().getFullYear()} <span className="font-medium text-text">{name}</span>. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted/70">
            <span>{t.common.appName}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

