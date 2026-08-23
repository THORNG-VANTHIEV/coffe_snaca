#!/usr/bin/env node
/**
 * Generates placeholder menu photography for every image path in db.json.
 *
 *   npm run images          # only creates files that are missing
 *   npm run images -- --force   # regenerates everything
 *
 * The point is that no path in db.json ever 404s: the shop replaces each file
 * with a real photo of the same name and nothing else has to change. Existing
 * files are left alone by default, so running this after adding real photos
 * cannot destroy them.
 *
 * Requires `cwebp` (brew install webp). Without it the script writes PNGs and
 * says so, rather than failing.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import {
  createCanvas,
  disc,
  encodePng,
  fillGradient,
  grain,
  hashString,
  hex,
  mix,
  radialGlow,
  ring,
  roundedRect,
  vignette,
} from './lib/canvas.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const force = process.argv.includes('--force')

/**
 * One warm palette per category. Everything stays inside the coffee/caramel
 * family so a page full of cards reads as one set (spec §30).
 */
const PALETTES = {
  'matcha-serie': { from: '#4E7348', to: '#1F381B', vessel: '#EEF5ED', fill: '#6C9A63', accent: '#8BBF80' },
  edition: { from: '#8B5A2B', to: '#38200F', vessel: '#F8F0E5', fill: '#5C3317', accent: '#D49A6A' },
  'cold-drinks': { from: '#5A7D8F', to: '#223844', vessel: '#EBF4F7', fill: '#8FB4C4', accent: '#B4D6E5' },
  'hot-drinks': { from: '#7A5638', to: '#31200F', vessel: '#F2E7D8', fill: '#4A2C16', accent: '#C68B59' },
  'tea-soda': { from: '#7E8A5C', to: '#333A20', vessel: '#F3EEE0', fill: '#B4BE7C', accent: '#CBD79A' },
  'frappe-smoothie': { from: '#CF9A57', to: '#6B3F1C', vessel: '#F8F0E3', fill: '#EFAD52', accent: '#FFD08A' },
  'noodle-soup': { from: '#BE8F5C', to: '#543619', vessel: '#F6EDDD', fill: '#E6BE85', accent: '#FAD9A6' },
  'chicken-rice': { from: '#C5AC7E', to: '#5B4A2E', vessel: '#F9F3E6', fill: '#F0E4C8', accent: '#E4CFA2' },
  'chicken-porridge': { from: '#D4B886', to: '#614E2B', vessel: '#FAF6ED', fill: '#E8D5B0', accent: '#F5E6CB' },
  breakfast: { from: '#C79355', to: '#5D3A19', vessel: '#F7EEDE', fill: '#EFC178', accent: '#FFDCA1' },
  'american-breakfast': { from: '#B8724D', to: '#4F2A18', vessel: '#F7EDE6', fill: '#DE8B5F', accent: '#F2AC85' },
  lunch: { from: '#AE6A42', to: '#4D2A16', vessel: '#F5EADB', fill: '#D2854A', accent: '#F0AC6C' },
  snack: { from: '#C88B4A', to: '#593516', vessel: '#F7EFE1', fill: '#EFB264', accent: '#FFCE86' },
  'extra-choice': { from: '#8A7A68', to: '#3D352B', vessel: '#F5F1EB', fill: '#B8A896', accent: '#D6C8B8' },
  coffee: { from: '#7A5638', to: '#31200F', vessel: '#F2E7D8', fill: '#4A2C16', accent: '#C68B59' },
  'non-coffee': { from: '#B08A5E', to: '#493220', vessel: '#F7F1E7', fill: '#E4D4BB', accent: '#D9B98C' },
  tea: { from: '#7E8A5C', to: '#333A20', vessel: '#F3EEE0', fill: '#B4BE7C', accent: '#CBD79A' },
  smoothies: { from: '#CF9A57', to: '#6B3F1C', vessel: '#F8F0E3', fill: '#EFAD52', accent: '#FFD08A' },
  frappe: { from: '#A08768', to: '#3D2D1F', vessel: '#F7F1E7', fill: '#DDC9AC', accent: '#EBD9BF' },
  'soft-drinks': { from: '#6E8E9B', to: '#2B3E48', vessel: '#EEF5F7', fill: '#BADDE8', accent: '#D6ECF2' },
  rice: { from: '#C5AC7E', to: '#5B4A2E', vessel: '#F9F3E6', fill: '#F0E4C8', accent: '#E4CFA2' },
  noodles: { from: '#BE8F5C', to: '#543619', vessel: '#F6EDDD', fill: '#E6BE85', accent: '#FAD9A6' },
  snacks: { from: '#C88B4A', to: '#593516', vessel: '#F7EFE1', fill: '#EFB264', accent: '#FFCE86' },
  desserts: { from: '#B87F72', to: '#4B2921', vessel: '#F9F0EC', fill: '#EFC9B8', accent: '#F6D8CB' },
}

const FALLBACK_PALETTE = PALETTES.coffee

function paletteFor(slug) {
  return PALETTES[slug] ?? FALLBACK_PALETTE
}

/** Deterministic 0..1 stream derived from a slug, so art is stable per product. */
function variations(seed) {
  let state = hashString(seed) || 1
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 0xffffffff
  }
}

function paintBackdrop(canvas, palette, next) {
  const { width, height } = canvas
  fillGradient(canvas, hex(palette.from), hex(palette.to), 1.05 + next() * 0.5)
  radialGlow(
    canvas,
    width * (0.18 + next() * 0.28),
    height * (0.1 + next() * 0.2),
    Math.max(width, height) * 0.75,
    hex(palette.accent),
    0.3,
  )
}

/** Top-down cup: saucer, rim, liquid, crema highlight. */
function paintDrink(canvas, palette, next) {
  const { width, height } = canvas
  const unit = Math.min(width, height)
  const cx = width * (0.5 + (next() - 0.5) * 0.06)
  const cy = height * (0.52 + (next() - 0.5) * 0.06)

  const vessel = hex(palette.vessel)
  const fill = hex(palette.fill)

  disc(canvas, cx, cy, unit * 0.44, mix(vessel, hex(palette.to), 0.55), 0.55)
  disc(canvas, cx, cy, unit * 0.355, vessel)
  ring(canvas, cx, cy, unit * 0.33, unit * 0.012, mix(vessel, hex(palette.to), 0.35), 0.7)
  disc(canvas, cx, cy, unit * 0.295, fill)

  // Crema / milk swirl, nudged off-centre so it reads as liquid.
  disc(
    canvas,
    cx - unit * (0.05 + next() * 0.04),
    cy - unit * (0.05 + next() * 0.04),
    unit * (0.14 + next() * 0.05),
    mix(fill, vessel, 0.45),
    0.55,
  )
  ring(canvas, cx, cy, unit * 0.255, unit * 0.014, [1, 1, 1], 0.12)
}

/** Top-down plate: rim, a mound of food, a few garnish points. */
function paintDish(canvas, palette, next) {
  const { width, height } = canvas
  const unit = Math.min(width, height)
  const cx = width * (0.5 + (next() - 0.5) * 0.06)
  const cy = height * (0.52 + (next() - 0.5) * 0.06)

  const vessel = hex(palette.vessel)
  const fill = hex(palette.fill)
  const accent = hex(palette.accent)

  disc(canvas, cx, cy, unit * 0.45, mix(vessel, hex(palette.to), 0.5), 0.5)
  disc(canvas, cx, cy, unit * 0.4, vessel)
  ring(canvas, cx, cy, unit * 0.335, unit * 0.01, mix(vessel, hex(palette.to), 0.3), 0.6)
  disc(canvas, cx, cy, unit * 0.26, fill)
  disc(
    canvas,
    cx + unit * 0.05,
    cy - unit * 0.05,
    unit * 0.13,
    mix(fill, vessel, 0.35),
    0.45,
  )

  const garnishCount = 4 + Math.floor(next() * 3)
  const start = next() * Math.PI * 2
  for (let i = 0; i < garnishCount; i++) {
    const angle = start + (i / garnishCount) * Math.PI * 2
    const distance = unit * (0.17 + next() * 0.07)
    disc(
      canvas,
      cx + Math.cos(angle) * distance,
      cy + Math.sin(angle) * distance,
      unit * (0.018 + next() * 0.018),
      accent,
      0.85,
    )
  }
}

function finish(canvas, seed) {
  vignette(canvas, 0.32)
  grain(canvas, 0.018, hashString(seed))
}

function makeArtwork({ width, height, categorySlug, kind, seed }) {
  const canvas = createCanvas(width, height)
  const palette = paletteFor(categorySlug)
  const next = variations(seed)

  paintBackdrop(canvas, palette, next)
  if (kind === 'food') paintDish(canvas, palette, next)
  else paintDrink(canvas, palette, next)
  finish(canvas, seed)

  return canvas
}

/**
 * Wide banner slides.
 *
 * The subject always sits on the right: the hero's headline occupies the left
 * half under the dark end of the overlay gradient, so anything placed there
 * would be hidden behind text.
 */
const HERO_SLIDES = [
  { seed: 'hero-1', palette: 'coffee', dish: false, radius: 268, steam: true, dark: '#231409' },
  { seed: 'hero-2', palette: 'tea', dish: false, radius: 244, steam: true, dark: '#1C2411' },
  { seed: 'hero-3', palette: 'lunch', dish: true, radius: 288, steam: false, dark: '#2A1509' },
  { seed: 'hero-4', palette: 'smoothies', dish: false, radius: 252, steam: false, dark: '#2B1608' },
]

function makeHero({ seed, palette: paletteKey, dish, radius, steam, dark }) {
  const canvas = createCanvas(1600, 900)
  const palette = paletteFor(paletteKey)
  const next = variations(seed)

  const ground = hex(dark)
  fillGradient(canvas, hex(palette.from), ground, 0.9)
  radialGlow(canvas, 1180, 300, 900, hex(palette.accent), 0.45)

  const cx = 1150
  const cy = 500
  const vessel = hex(palette.vessel)
  const fill = hex(palette.fill)

  disc(canvas, cx, cy, radius * 1.23, mix(vessel, ground, 0.6), 0.5)
  disc(canvas, cx, cy, radius, vessel)
  ring(canvas, cx, cy, radius * 0.93, 10, mix(vessel, ground, 0.3), 0.65)
  disc(canvas, cx, cy, radius * (dish ? 0.66 : 0.83), fill)
  disc(canvas, cx - 60, cy - 60, radius * 0.41, mix(fill, vessel, 0.4), 0.5)
  ring(canvas, cx, cy, radius * 0.71, 12, [1, 1, 1], 0.1)

  if (dish) {
    const garnish = hex(palette.accent)
    for (let i = 0; i < 6; i++) {
      const angle = next() * Math.PI * 2
      const distance = radius * (0.28 + next() * 0.22)
      disc(
        canvas,
        cx + Math.cos(angle) * distance,
        cy + Math.sin(angle) * distance,
        radius * (0.035 + next() * 0.03),
        garnish,
        0.85,
      )
    }
  }

  if (steam) {
    for (let i = 0; i < 3; i++) {
      const x = cx - 90 + i * 90
      roundedRect(canvas, x, 90 + i * 26, 22, 150 - i * 22, 11, [1, 1, 1], 0.08 + next() * 0.04)
    }
  }

  vignette(canvas, 0.38)
  grain(canvas, 0.016, hashString(seed))
  return canvas
}

/** Square mark: espresso ground with a cream coffee bean. */
function makeLogo() {
  const canvas = createCanvas(512, 512)
  fillGradient(canvas, hex('#6F4E37'), hex('#2A1810'), 1.2)
  radialGlow(canvas, 170, 150, 420, hex('#C68B59'), 0.55)

  const cream = hex('#FAF3E8')
  disc(canvas, 256, 256, 130, cream, 0.96)

  // The bean's crease, stamped along a quadratic curve so it bows like the
  // favicon rather than sitting as a straight bar.
  const crease = hex('#6F4E37')
  for (let i = 0; i <= 200; i++) {
    const t = i / 200
    const inverse = 1 - t
    const x = inverse * inverse * 256 + 2 * inverse * t * 186 + t * t * 256
    const y = inverse * inverse * 138 + 2 * inverse * t * 256 + t * t * 374
    disc(canvas, x, y, 11, crease, 0.95)
  }

  ring(canvas, 256, 256, 130, 8, hex('#C68B59'), 0.35)

  vignette(canvas, 0.25)
  return canvas
}

function makeSocialCover() {
  const canvas = createCanvas(1200, 630)
  const palette = PALETTES.coffee
  fillGradient(canvas, hex('#8A6141'), hex('#231409'), 0.85)
  radialGlow(canvas, 880, 220, 700, hex(palette.accent), 0.45)

  const vessel = hex(palette.vessel)
  const fill = hex(palette.fill)
  disc(canvas, 860, 330, 220, mix(vessel, hex('#231409'), 0.6), 0.5)
  disc(canvas, 860, 330, 178, vessel)
  disc(canvas, 860, 330, 148, fill)
  disc(canvas, 820, 290, 74, mix(fill, vessel, 0.4), 0.5)

  vignette(canvas, 0.35)
  grain(canvas, 0.015, hashString('og-cover'))
  return canvas
}

let cwebpAvailable = true
try {
  execFileSync('cwebp', ['-version'], { stdio: 'ignore' })
} catch {
  cwebpAvailable = false
}

const stats = { written: 0, skipped: 0, bytes: 0 }

function writeImage(relativePath, canvas, quality = 78) {
  const target = join(publicDir, relativePath.replace(/^\//, ''))

  if (!force && existsSync(target)) {
    stats.skipped += 1
    return
  }

  mkdirSync(dirname(target), { recursive: true })
  const png = encodePng(canvas)

  if (!target.endsWith('.webp')) {
    writeFileSync(target, png)
  } else if (cwebpAvailable) {
    const scratch = join(tmpdir(), `coffee-menu-${process.pid}.png`)
    writeFileSync(scratch, png)
    try {
      execFileSync('cwebp', ['-quiet', '-q', String(quality), scratch, '-o', target])
    } finally {
      rmSync(scratch, { force: true })
    }
  } else {
    // Still produce a working file: a PNG renamed to .webp would be wrong, so
    // write the PNG beside the expected path and let the caller notice.
    writeFileSync(target.replace(/\.webp$/, '.png'), png)
  }

  stats.written += 1
  stats.bytes += existsSync(target) ? statSync(target).size : 0
}

const db = JSON.parse(readFileSync(join(publicDir, 'data/db.json'), 'utf8'))
const categoriesById = new Map(db.categories.map((category) => [category.id, category]))

console.log(`Generating menu artwork${force ? ' (--force)' : ''}…`)
if (!cwebpAvailable) {
  console.warn('! cwebp not found — writing .png files instead. Install with: brew install webp')
}

for (const category of db.categories) {
  writeImage(
    category.image,
    makeArtwork({
      width: 800,
      height: 600,
      categorySlug: category.slug,
      kind: category.kind,
      seed: `category-${category.slug}`,
    }),
  )
}

for (const product of db.products) {
  const category = categoriesById.get(product.category_id)
  writeImage(
    product.image,
    makeArtwork({
      width: 1200,
      height: 900,
      categorySlug: category?.slug ?? 'coffee',
      kind: category?.kind ?? 'drink',
      seed: product.slug,
    }),
  )
}

writeImage(
  '/images/default-product.webp',
  makeArtwork({
    width: 1200,
    height: 900,
    categorySlug: 'frappe',
    kind: 'drink',
    seed: 'default-product',
  }),
)

for (const [index, slide] of HERO_SLIDES.entries()) {
  writeImage(`/images/banners/hero-${index + 1}.webp`, makeHero(slide), 82)
}

writeImage('/images/banners/og-cover.webp', makeSocialCover(), 82)
writeImage('/images/logo/logo.png', makeLogo())

const megabytes = (stats.bytes / 1024 / 1024).toFixed(2)
console.log(`Done. ${stats.written} written, ${stats.skipped} kept, ${megabytes} MB.`)
if (stats.skipped > 0) console.log('Run with --force to regenerate the kept files.')
