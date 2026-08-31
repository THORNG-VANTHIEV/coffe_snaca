#!/usr/bin/env node
/**
 * Checks `public/data/db.json` before it can be deployed (spec §58).
 *
 *   npm run validate
 *
 * It runs as part of `npm run build`, so a typo in the menu fails locally and
 * in CI rather than showing up as a blank card on a customer's phone.
 *
 * Errors block the build. Warnings are printed and allowed through — they
 * cover things the app already degrades gracefully around (an unknown icon
 * name, a missing translation that falls back to the other language).
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const dbPath = join(publicDir, 'data/db.json')

/** The shop's fixed exchange rate. Prices in riel are derived from USD. */
const KHR_PER_USD = 4100

const errors = []
const warnings = []

const fail = (where, message) => errors.push(`${where}: ${message}`)
const warn = (where, message) => warnings.push(`${where}: ${message}`)

/** Reads the icon allow-list straight from the app so the two cannot drift. */
function knownIconNames() {
  try {
    const source = readFileSync(join(root, 'src/utils/icons.ts'), 'utf8')
    const block = source.split('const CATEGORY_ICONS')[1]?.split('}')[0] ?? ''
    const names = [...block.matchAll(/^\s*'?([a-z][a-z-]*)'?\s*:/gm)].map((match) => match[1])
    return names.length > 0 ? new Set(names) : null
  } catch {
    return null
  }
}

let db
try {
  db = JSON.parse(readFileSync(dbPath, 'utf8'))
} catch (error) {
  console.error(`✖ Could not read ${dbPath}\n  ${error.message}`)
  process.exit(1)
}

const imageCache = new Map()
function imageExists(path) {
  if (!path) return false
  if (!imageCache.has(path)) {
    imageCache.set(path, existsSync(join(publicDir, path.replace(/^\//, ''))))
  }
  return imageCache.get(path)
}

function checkBilingual(where, record, field, { required = true } = {}) {
  const en = record[`${field}_en`]
  const km = record[`${field}_km`]

  if (required && !en && !km) {
    fail(where, `missing ${field}_en and ${field}_km`)
    return
  }
  if (en && !km) warn(where, `missing ${field}_km — Khmer readers will see the English text`)
  if (km && !en) warn(where, `missing ${field}_en — English readers will see the Khmer text`)
}

function checkPrice(where, record) {
  const usd = record.price_usd
  const khr = record.price_khr

  if (typeof usd !== 'number' || !Number.isFinite(usd) || usd < 0) {
    fail(where, `price_usd must be a number ≥ 0 (got ${JSON.stringify(usd)})`)
  }
  if (typeof khr !== 'number' || !Number.isFinite(khr) || khr < 0) {
    fail(where, `price_khr must be a number ≥ 0 (got ${JSON.stringify(khr)})`)
  }
  if (typeof usd === 'number' && typeof khr === 'number' && usd > 0 && khr === 0) {
    warn(where, 'has a USD price but no KHR price')
  }

  // The shop converts at a fixed 4,100៛ per dollar and always rounds UP to the
  // next 100៛ note, so the two currencies can never drift apart by hand.
  if (typeof usd === 'number' && typeof khr === 'number' && usd > 0) {
    const expected = Math.ceil((usd * KHR_PER_USD) / 100) * 100
    if (khr !== expected) {
      fail(where, `price_khr should be ${expected} (${usd} x ${KHR_PER_USD}, rounded up to 100៛) — got ${khr}`)
    }
  }
}

// ---------------------------------------------------------------- settings --
const settings = db.settings
if (!settings || typeof settings !== 'object') {
  fail('settings', 'missing')
} else {
  checkBilingual('settings', settings, 'shop_name')
  checkBilingual('settings', settings, 'address', { required: false })
  checkBilingual('settings', settings, 'opening_hours', { required: false })

  if (!['km', 'en'].includes(settings.default_language)) {
    fail('settings', `default_language must be "km" or "en" (got ${JSON.stringify(settings.default_language)})`)
  }
  if (settings.currency_usd === false && settings.currency_khr === false) {
    fail('settings', 'both currencies are switched off — no prices would be shown')
  }
  if (settings.logo && !imageExists(settings.logo)) {
    warn('settings', `logo not found at public${settings.logo}`)
  }

  const heroImages = Array.isArray(settings.hero_images) ? settings.hero_images : []
  if (heroImages.length === 0) {
    warn('settings', 'no hero_images — the hero falls back to the shipped default banner')
  }
  for (const image of heroImages) {
    if (typeof image !== 'string' || !image) fail('settings', 'hero_images must be paths')
    else if (!imageExists(image)) warn('settings', `hero image not found at public${image}`)
  }

  checkPromotion(settings.promo)
}

/**
 * The promotion block, present only while the shop is running one.
 *
 * A promotion is the one thing in this file that changes a price, and the
 * admin already refuses to publish a broken one — this is the second gate, for
 * a db.json edited by hand.
 */
function checkPromotion(promo) {
  if (promo === undefined || promo === null) return

  if (typeof promo !== 'object' || Array.isArray(promo)) {
    fail('promo', 'must be an object')
    return
  }

  if (!promo.title_en && !promo.title_km) {
    fail('promo', 'needs a title in at least one language, or the banner is blank')
  } else {
    checkBilingual('promo', promo, 'title', { required: false })
  }

  if (promo.image && !imageExists(promo.image)) {
    warn('promo', `banner image not found at public${promo.image}`)
  }

  const isDay = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

  for (const key of ['starts_at', 'ends_at']) {
    const value = promo[key]
    if (value === null || value === undefined || value === '') continue
    if (!isDay(value)) fail('promo', `${key} must be a YYYY-MM-DD date (got ${JSON.stringify(value)})`)
  }

  if (isDay(promo.starts_at) && isDay(promo.ends_at) && promo.ends_at < promo.starts_at) {
    fail('promo', `ends_at ${promo.ends_at} is before starts_at ${promo.starts_at}`)
  }

  // The menu reads the window in this timezone; an unknown name would send
  // every phone back to its own clock.
  if (promo.timezone) {
    try {
      new Intl.DateTimeFormat('en-CA', { timeZone: promo.timezone })
    } catch {
      fail('promo', `timezone "${promo.timezone}" is not a known IANA zone`)
    }
  } else {
    warn('promo', 'no timezone — the window falls back to each phone’s own clock')
  }
}

// ------------------------------------------------------------------ tables --
const tables = Array.isArray(db.tables) ? db.tables : []
if (tables.length === 0) warn('tables', 'no tables defined — every QR link will show a plain welcome')

const tableIds = new Set()
const tableNumbers = new Set()
for (const table of tables) {
  const where = `table ${table.number ?? table.id ?? '?'}`
  if (tableIds.has(table.id)) fail(where, `duplicate id ${table.id}`)
  tableIds.add(table.id)

  if (typeof table.number !== 'string' || table.number === '') {
    fail(where, 'number must be a non-empty string, e.g. "05"')
  } else {
    if (tableNumbers.has(table.number)) fail(where, `duplicate number "${table.number}"`)
    tableNumbers.add(table.number)
    if (/^\d$/.test(table.number)) {
      warn(where, `number "${table.number}" is not zero-padded — use "0${table.number}"`)
    }
  }
}

// -------------------------------------------------------------- categories --
const categories = Array.isArray(db.categories) ? db.categories : []
if (categories.length === 0) fail('categories', 'none defined')

const iconNames = knownIconNames()
const categoryIds = new Set()
const categorySlugs = new Set()

for (const category of categories) {
  const where = `category "${category.slug ?? category.id ?? '?'}"`

  if (categoryIds.has(category.id)) fail(where, `duplicate id ${category.id}`)
  categoryIds.add(category.id)

  if (!category.slug) fail(where, 'missing slug')
  else if (categorySlugs.has(category.slug)) fail(where, `duplicate slug "${category.slug}"`)
  else if (!/^[a-z0-9-]+$/.test(category.slug)) fail(where, 'slug must be lowercase letters, numbers and dashes')
  categorySlugs.add(category.slug)

  checkBilingual(where, category, 'name')
  checkBilingual(where, category, 'description', { required: false })

  if (typeof category.sort_order !== 'number') warn(where, 'missing sort_order')
  if (!['drink', 'food'].includes(category.kind)) {
    warn(where, `kind should be "drink" or "food" (got ${JSON.stringify(category.kind)}) — defaulting to drink`)
  }
  if (category.image && !imageExists(category.image)) {
    warn(where, `image not found at public${category.image}`)
  }
  if (iconNames && category.icon && !iconNames.has(category.icon)) {
    warn(where, `icon "${category.icon}" is not registered in src/utils/icons.ts — a default will be shown`)
  }
}

const activeCategoryIds = new Set(
  categories.filter((category) => category.active !== false).map((category) => category.id),
)

// ---------------------------------------------------------------- products --
const products = Array.isArray(db.products) ? db.products : []
if (products.length === 0) fail('products', 'none defined')

const productIds = new Set()
const productSlugs = new Set()
const TEMPERATURES = ['hot', 'iced']
const ICE_LEVELS = ['none', 'less', 'normal', 'extra']

for (const product of products) {
  const where = `product "${product.slug ?? product.id ?? '?'}"`

  if (productIds.has(product.id)) fail(where, `duplicate id ${product.id}`)
  productIds.add(product.id)

  if (!product.slug) fail(where, 'missing slug')
  else if (productSlugs.has(product.slug)) fail(where, `duplicate slug "${product.slug}"`)
  else if (!/^[a-z0-9-]+$/.test(product.slug)) fail(where, 'slug must be lowercase letters, numbers and dashes')
  productSlugs.add(product.slug)

  if (!categoryIds.has(product.category_id)) {
    fail(where, `category_id ${product.category_id} does not exist`)
  } else if (!activeCategoryIds.has(product.category_id)) {
    warn(where, 'belongs to an inactive category and will be hidden')
  }

  // Showcase categories (Signature Drinks) borrow products that already live
  // somewhere else, so the item appears twice on the menu on purpose.
  const alsoIn = product.also_in_categories
  if (alsoIn !== undefined) {
    if (!Array.isArray(alsoIn)) {
      fail(where, 'also_in_categories must be an array of category ids')
    } else {
      const seen = new Set()
      for (const id of alsoIn) {
        if (!categoryIds.has(id)) {
          fail(where, `also_in_categories references category ${id}, which does not exist`)
        } else if (id === product.category_id) {
          fail(where, `also_in_categories repeats the product's own category ${id}`)
        } else if (seen.has(id)) {
          fail(where, `also_in_categories lists category ${id} twice`)
        } else if (!activeCategoryIds.has(id)) {
          warn(where, `also_in_categories references inactive category ${id}`)
        }
        seen.add(id)
      }
    }
  }

  checkBilingual(where, product, 'name')
  checkBilingual(where, product, 'description', { required: false })

  if (!product.image) warn(where, 'has no image — the default photo will be used')
  else if (!imageExists(product.image)) warn(where, `image not found at public${product.image}`)

  const sizes = Array.isArray(product.sizes) ? product.sizes : []
  if (sizes.length === 0) fail(where, 'has no sizes, so it has no price')
  const sizeCodes = new Set()
  for (const size of sizes) {
    const sizeWhere = `${where} size "${size.name ?? '?'}"`
    if (!size.name) fail(sizeWhere, 'missing name')
    else if (sizeCodes.has(size.name)) fail(where, `duplicate size name "${size.name}"`)
    sizeCodes.add(size.name)
    checkPrice(sizeWhere, size)
  }

  for (const extra of Array.isArray(product.extras) ? product.extras : []) {
    const extraWhere = `${where} extra "${extra.name_en ?? extra.name_km ?? '?'}"`
    checkBilingual(extraWhere, extra, 'name')
    checkPrice(extraWhere, extra)
  }

  for (const group of Array.isArray(product.options) ? product.options : []) {
    const groupWhere = `${where} option "${group.key ?? group.name_en ?? '?'}"`
    checkBilingual(groupWhere, group, 'name')
    if (!Array.isArray(group.values) || group.values.length === 0) {
      fail(groupWhere, 'has no values')
    } else {
      for (const value of group.values) checkBilingual(groupWhere, value, 'name')
    }
  }

  for (const value of Array.isArray(product.temperature) ? product.temperature : []) {
    if (!TEMPERATURES.includes(value)) fail(where, `unknown temperature "${value}"`)
  }
  for (const value of Array.isArray(product.ice_levels) ? product.ice_levels : []) {
    if (!ICE_LEVELS.includes(value)) fail(where, `unknown ice level "${value}"`)
  }
  for (const value of Array.isArray(product.sugar_levels) ? product.sugar_levels : []) {
    if (typeof value !== 'number' || value < 0 || value > 100) {
      fail(where, `sugar level must be between 0 and 100 (got ${JSON.stringify(value)})`)
    }
  }

  const ingredientsEn = Array.isArray(product.ingredients_en) ? product.ingredients_en : []
  const ingredientsKm = Array.isArray(product.ingredients_km) ? product.ingredients_km : []
  if (ingredientsEn.length > 0 && ingredientsKm.length !== ingredientsEn.length) {
    warn(where, `ingredients_km has ${ingredientsKm.length} entries but ingredients_en has ${ingredientsEn.length}`)
  }

  if (typeof product.sort_order !== 'number') warn(where, 'missing sort_order')

  if (product.promo_percent !== undefined) {
    const percent = product.promo_percent

    if (typeof percent !== 'number' || !Number.isInteger(percent) || percent < 1 || percent > 90) {
      fail(where, `promo_percent must be a whole number from 1 to 90 (got ${JSON.stringify(percent)})`)
    } else if (!db.settings?.promo) {
      // Harmless — the menu gates every discount on the campaign — but it
      // means someone set a discount and no customer will ever see it.
      warn(where, `has promo_percent ${percent} but there is no promotion running`)
    }
  }
}

// ------------------------------------------------------------------ report --
const summary = `${categories.length} categories, ${products.length} products, ${tables.length} tables`

for (const message of warnings) console.warn(`⚠ ${message}`)
for (const message of errors) console.error(`✖ ${message}`)

if (errors.length > 0) {
  console.error(`\n✖ ${errors.length} error(s), ${warnings.length} warning(s) — ${summary}`)
  process.exit(1)
}

console.log(`✔ Menu data is valid — ${summary}${warnings.length ? ` (${warnings.length} warning(s))` : ''}`)
