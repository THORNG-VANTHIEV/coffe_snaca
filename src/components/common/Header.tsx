import { Link, NavLink } from 'react-router-dom'
import { useLanguage } from '@/hooks/useLanguage'
import { useSettings } from '@/hooks/useMenu'
import { useTable } from '@/hooks/useTable'
import { LanguageToggle } from '@/features/language/LanguageToggle'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { TableBadge } from '@/features/table/TableBadge'
import { ShopLogo } from './ShopLogo'
import { shopName } from '@/utils/translation'
import { cn } from '@/utils/cn'

/**
 * Sticky top header (spec §7.2, §37): who you are, which table you are at,
 * what language you read, and how the menu looks. Nothing else — a menu does
 * not need a navigation system.
 *
 * All three controls fit one row again now that the language and theme
 * switches are single buttons rather than segmented pairs, which keeps the
 * sticky header short on the phone this is mostly read on.
 */
export function Header() {
  const settings = useSettings()
  const { language, t } = useLanguage()
  const { table } = useTable()

  const name = shopName(settings, language)

  const links = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/menu', label: t.nav.menu, end: false },
    { to: '/about', label: t.nav.about, end: false },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-2 sm:gap-4">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 rounded-pill"
          aria-label={name}
        >
          <ShopLogo src={settings.logo} name={name} className="h-9" />
        </Link>

        <nav aria-label={t.nav.menu} className="ms-4 hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-pill px-3 py-2 text-sm font-medium transition duration-150',
                  isActive ? 'bg-surface-2 text-text' : 'text-muted hover:text-text',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          {table && <TableBadge table={table} />}
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  )
}
