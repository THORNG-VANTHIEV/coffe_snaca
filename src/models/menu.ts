import type { Category } from './category'
import type { Product } from './product'
import type { Settings } from './settings'
import type { Table } from './table'

/** The whole menu, exactly as the service layer hands it to the UI. */
export interface MenuData {
  settings: Settings
  tables: Table[]
  categories: Category[]
  products: Product[]
}
