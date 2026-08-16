import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { MenuData } from '@/models'
import { getMenuData } from '@/services/menuService'
import { MenuContext, type MenuStatus } from './menuContext'

/**
 * Loads the menu once and holds it for the whole session.
 *
 * The provider is the only component that talks to the service layer; every
 * page below it reads plain models and has no idea a network request was
 * ever involved (spec §73).
 */
export function MenuProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MenuData | null>(null)
  const [status, setStatus] = useState<MenuStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setStatus('loading')

    getMenuData()
      .then((menu) => {
        if (!active) return
        setData(menu)
        setStatus('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        // Logged for the developer; the customer sees a friendly panel (spec §41).
        console.error('[menu] failed to load', error)
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [attempt])

  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  const value = useMemo(() => ({ status, data, reload }), [status, data, reload])

  return <MenuContext value={value}>{children}</MenuContext>
}
