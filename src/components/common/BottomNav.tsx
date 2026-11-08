import { House, Info, UtensilsCrossed } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/utils/cn'

/**
 * Home, menu and about, within a thumb's reach on a phone.
 *
 * The header's links only fit from `md` up, which left a phone with no way to
 * the about page but the footer — and the footer of the full menu is a long
 * way down. Hidden from `md`, where the header takes over, so the two never
 * show together. The inset keeps it clear of an iPhone's home indicator.
 */
export function BottomNav() {
  const { t } = useLanguage()

  const links = [
    { to: '/', label: t.nav.home, Icon: House, end: true },
    { to: '/menu', label: t.nav.menu, Icon: UtensilsCrossed, end: false },
    { to: '/about', label: t.nav.about, Icon: Info, end: false },
  ]

  return (
    <nav
      aria-label={t.nav.menu}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3 gap-1 px-3 py-1.5">
        {links.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-medium transition duration-150 active:scale-95',
                  isActive ? 'bg-surface-2 font-semibold text-text' : 'text-muted hover:text-text',
                )
              }
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
