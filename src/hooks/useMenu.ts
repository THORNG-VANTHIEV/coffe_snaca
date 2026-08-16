import { useContext, useMemo } from 'react'
import type { Category, MenuData, Product, Settings } from '@/models'
import { MenuContext, type MenuState } from '@/store/menuContext'
import { getActiveCategories, getVisibleProducts } from '@/services/menuSelectors'

/** Raw load state — only the layout gate and the splash screen need this. */
export function useMenuState(): MenuState {
  const state = useContext(MenuContext)
  if (!state) throw new Error('useMenuState must be used inside <MenuProvider>')
  return state
}

/**
 * The loaded menu. Safe to call from any page: routes render below the
 * layout gate, which only mounts them once the data is ready.
 */
export function useMenu(): MenuData {
  const { data } = useMenuState()
  if (!data) throw new Error('useMenu was called before the menu finished loading')
  return data
}

export function useSettings(): Settings {
  return useMenu().settings
}

/** Active categories, in display order. */
export function useCategories(): Category[] {
  const menu = useMenu()
  return useMemo(() => getActiveCategories(menu), [menu])
}

/** Every product a customer may see, sold-out ones last. */
export function useProducts(): Product[] {
  const menu = useMenu()
  return useMemo(() => getVisibleProducts(menu), [menu])
}
