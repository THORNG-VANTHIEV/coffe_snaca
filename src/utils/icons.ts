import {
  Blend,
  CakeSlice,
  Coffee,
  Cookie,
  CupSoda,
  EggFried,
  GlassWater,
  Leaf,
  Milk,
  Snowflake,
  Soup,
  Utensils,
  Wheat,
  type LucideIcon,
} from 'lucide-react'

/**
 * Categories name their icon in `db.json` (`"icon": "coffee"`), so the owner
 * can add a category without touching React.
 *
 * This is an explicit allow-list rather than a dynamic import of the whole
 * Lucide set — 2,000 icons would dwarf the rest of the bundle. Adding a new
 * category icon means adding one line here.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  blend: Blend,
  'cake-slice': CakeSlice,
  coffee: Coffee,
  cookie: Cookie,
  'cup-soda': CupSoda,
  'egg-fried': EggFried,
  'glass-water': GlassWater,
  leaf: Leaf,
  milk: Milk,
  snowflake: Snowflake,
  soup: Soup,
  utensils: Utensils,
  wheat: Wheat,
}

export function resolveCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS[name] ?? Utensils
}
