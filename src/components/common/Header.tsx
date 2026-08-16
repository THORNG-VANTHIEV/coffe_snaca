import { Link, NavLink } from 'react-router-dom'
import { useLanguage } from '@/hooks/useLanguage'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSettings } from '@/hooks/useMenu'
import { useTable } from '@/hooks/useTable'
import { LanguageToggle } from '@/features/language/LanguageToggle'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { TableBadge } from '@/features/table/TableBadge'
import { ShopLogo } from './ShopLogo'
import { shopName } from '@/utils/translation'
import { cn } from '@/utils/cn'

/** Tailwind's `sm` — below it the header needs a second row. */
const WIDE_HEADER = '(min-width: 640px)'

/**
 * Sticky top header (spec §7.2, §37): who you are, which table you are at,
 * what language you read, and how the menu looks. Nothing else — a menu does
 * not need a navigation system.
 *
 * With three controls the row no longer fits beside the shop name on a 360px
 * phone, so the table drops to its own line there — the layout the spec draws
 * in §35. The badge is placed rather than duplicated behind `hidden`
 * utilities, so it appears once in the accessibility tree.
 */
export function Header() {
  const settings = useSettings()
  const { language, t } = useLanguage()
  const { table } = useTable()
  const isWide = useMediaQuery(WIDE_HEADER)

  const name = shopName(settings, language)
  const showTableRow = Boolean(table) && !isWide

  const links = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/menu', label: t.nav.menu, end: false },
    { to: '/about', label: t.nav.about, end: false },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/85 backdrop-blur-md">
      <div className="container-page flex h-14 items-center gap-2 sm:h-16 sm:gap-4">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 rounded-pill"
          aria-label={name}
        >
          <ShopLogo src={settings.logo} name={name} className="size-9" />
          <span className="truncate text-[15px] font-semibold text-text sm:text-base">
            {name}
          </span>
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
          {table && isWide && <TableBadge table={table} />}
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      {showTableRow && table && (
        <div className="container-page flex items-center pb-2">
          <TableBadge table={table} />
        </div>
      )}
    </header>
  )
}
