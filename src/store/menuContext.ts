import { createContext } from 'react'
import type { MenuData } from '@/models'

export type MenuStatus = 'loading' | 'ready' | 'error'

export interface MenuState {
  status: MenuStatus
  data: MenuData | null
  reload: () => void
}

export const MenuContext = createContext<MenuState | null>(null)
