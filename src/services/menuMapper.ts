import type {
  Category,
  CategoryKind,
  IceLevel,
  MenuData,
  Product,
  ProductExtra,
  ProductOptionGroup,
  ProductOptionValue,
  ProductSize,
  Settings,
  Table,
  Temperature,
} from '@/models'
import { isLanguage } from '@/models'
import { resolveAssetUrl } from '@/utils/url'
import {
  isRecord,
  readArray,
  readBoolean,
  readEnumArray,
  readNumber,
  readNumberArray,
  readRecord,
  readRecordArray,
  readString,
  readStringArray,
  type RawRecord,
} from './coerce'

const TEMPERATURES: readonly Temperature[] = ['hot', 'iced']
const ICE_LEVELS: readonly IceLevel[] = ['none', 'less', 'normal', 'extra']

/** Long-form labels for the conventional size codes. */
const SIZE_LABELS: Record<string, { en: string; km: string }> = {
  R: { en: 'Regular', km: 'ធម្មតា' },
  S: { en: 'Small', km: 'តូច' },
  M: { en: 'Medium', km: 'មធ្យម' },
  L: { en: 'Large', km: 'ធំ' },
  XL: { en: 'Extra Large', km: 'ធំបំផុត' },
}

/**
 * Falls back to the English text when a Khmer field is missing (and the other
 * way round) so a half-translated product still renders something readable
 * rather than an empty line.
 */
function readBilingual(
  source: RawRecord,
  key: string,
): { en: string; km: string } {
  const en = readString(source, `${key}_en`)
  const km = readString(source, `${key}_km`)
  return { en: en || km, km: km || en }
}

function mapPrice(source: RawRecord) {
  return {
    usd: readNumber(source, 'price_usd'),
    khr: readNumber(source, 'price_khr'),
  }
}

function mapSize(source: RawRecord): ProductSize {
  const code = readString(source, 'name') || readString(source, 'code')
  const label = readBilingual(source, 'name')
  const known = SIZE_LABELS[code.toUpperCase()]

  return {
    code,
    nameEn: label.en || known?.en || code,
    nameKm: label.km || known?.km || code,
    price: mapPrice(source),
  }
}

function mapExtra(source: RawRecord): ProductExtra {
  const name = readBilingual(source, 'name')
  return { nameEn: name.en, nameKm: name.km, price: mapPrice(source) }
}

function mapOptionValue(value: unknown): ProductOptionValue | null {
  if (typeof value === 'string') return { nameEn: value, nameKm: value }
  if (!isRecord(value)) return null
  const name = readBilingual(value, 'name')
  return name.en ? { nameEn: name.en, nameKm: name.km } : null
}

function mapOptionGroup(source: RawRecord): ProductOptionGroup {
  const name = readBilingual(source, 'name')
  return {
    key: readString(source, 'key') || name.en.toLowerCase().replace(/\s+/g, '-'),
    nameEn: name.en,
    nameKm: name.km,
    values: readArray(source, 'values')
      .map(mapOptionValue)
      .filter((value): value is ProductOptionValue => value !== null),
  }
}

function mapProduct(source: RawRecord): Product {
  const name = readBilingual(source, 'name')
  const description = readBilingual(source, 'description')

  return {
    id: readNumber(source, 'id'),
    slug: readString(source, 'slug'),
    categoryId: readNumber(source, 'category_id'),
    alsoInCategoryIds: readNumberArray(source, 'also_in_categories'),

    nameEn: name.en,
    nameKm: name.km,
    descriptionEn: description.en,
    descriptionKm: description.km,

    image: resolveAssetUrl(readString(source, 'image')),

    ingredientsEn: readStringArray(source, 'ingredients_en'),
    ingredientsKm: readStringArray(source, 'ingredients_km'),

    sizes: readRecordArray(source, 'sizes').map(mapSize),

    temperature: readEnumArray(source, 'temperature', TEMPERATURES),
    sugarLevels: readNumberArray(source, 'sugar_levels'),
    iceLevels: readEnumArray(source, 'ice_levels', ICE_LEVELS),

    extras: readRecordArray(source, 'extras').map(mapExtra),
    options: readRecordArray(source, 'options').map(mapOptionGroup),

    available: readBoolean(source, 'available', true),
    bestSeller: readBoolean(source, 'best_seller'),
    recommended: readBoolean(source, 'recommended'),
    featured: readBoolean(source, 'featured'),
    sortOrder: readNumber(source, 'sort_order', Number.MAX_SAFE_INTEGER),
  }
}

function mapCategory(source: RawRecord): Category {
  const name = readBilingual(source, 'name')
  const description = readBilingual(source, 'description')
  const kind = readString(source, 'kind', 'drink')

  return {
    id: readNumber(source, 'id'),
    slug: readString(source, 'slug'),
    nameEn: name.en,
    nameKm: name.km,
    descriptionEn: description.en,
    descriptionKm: description.km,
    image: resolveAssetUrl(readString(source, 'image')),
    icon: readString(source, 'icon', 'utensils'),
    kind: (kind === 'food' ? 'food' : 'drink') satisfies CategoryKind,
    active: readBoolean(source, 'active', true),
    sortOrder: readNumber(source, 'sort_order', Number.MAX_SAFE_INTEGER),
  }
}

function mapTable(source: RawRecord): Table {
  const number = readString(source, 'number')
  return {
    id: readNumber(source, 'id'),
    number,
    name: readString(source, 'name', `Table ${number}`),
    active: readBoolean(source, 'active', true),
  }
}

function mapSettings(source: RawRecord): Settings {
  const shopName = readBilingual(source, 'shop_name')
  const tagline = readBilingual(source, 'tagline')
  const address = readBilingual(source, 'address')
  const openingHours = readBilingual(source, 'opening_hours')
  const defaultLanguage = readString(source, 'default_language', 'km')

  return {
    shopNameEn: shopName.en,
    shopNameKm: shopName.km,
    taglineEn: tagline.en,
    taglineKm: tagline.km,
    logo: resolveAssetUrl(readString(source, 'logo')),
    heroImages: readStringArray(source, 'hero_images').map(resolveAssetUrl),
    phone: readString(source, 'phone'),
    addressEn: address.en,
    addressKm: address.km,
    openingHoursEn: openingHours.en,
    openingHoursKm: openingHours.km,
    currencyUsd: readBoolean(source, 'currency_usd', true),
    currencyKhr: readBoolean(source, 'currency_khr', true),
    defaultLanguage: isLanguage(defaultLanguage) ? defaultLanguage : 'km',
    showUnavailableProducts: readBoolean(source, 'show_unavailable_products', true),
    facebook: readString(source, 'facebook'),
    telegram: readString(source, 'telegram'),
  }
}

/** `sort_order` wins; ids break ties. JSON insertion order is never trusted (spec §44). */
function bySortOrder<T extends { sortOrder: number; id: number }>(a: T, b: T): number {
  return a.sortOrder - b.sortOrder || a.id - b.id
}

/**
 * Normalises the raw `db.json` document into the camelCase models the UI
 * works with. Everything downstream can assume the data is sorted, has
 * resolved asset URLs, and has no missing fields.
 */
export function mapMenuData(raw: unknown): MenuData {
  const root = isRecord(raw) ? raw : {}

  return {
    settings: mapSettings(readRecord(root, 'settings')),
    tables: readRecordArray(root, 'tables').map(mapTable),
    categories: readRecordArray(root, 'categories').map(mapCategory).sort(bySortOrder),
    products: readRecordArray(root, 'products')
      .map(mapProduct)
      .filter((product) => product.slug !== '')
      .sort(bySortOrder),
  }
}
