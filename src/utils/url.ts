/**
 * The app is served from a sub-path on GitHub Pages (`/coffee-menu/`), so
 * nothing may assume it runs at the domain root (spec §53).
 */

const ABSOLUTE_URL = /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i

/**
 * Turns a root-relative path from `db.json` (`/images/products/x.webp`) into
 * a URL that works under the deployed base path. Absolute URLs and data URIs
 * are passed through untouched.
 */
export function resolveAssetUrl(path: string): string {
  const trimmed = path.trim()
  if (!trimmed) return ''
  if (ABSOLUTE_URL.test(trimmed)) return trimmed

  const base = import.meta.env.BASE_URL
  return `${base.replace(/\/$/, '')}/${trimmed.replace(/^\//, '')}`
}

/**
 * Reads the table number from the QR link (`?table=05`).
 *
 * `?table=5` is accepted as well and normalised to the zero-padded form the
 * stickers use, so a hand-typed link still finds its table.
 */
export function readTableParam(search: string): string | null {
  const raw = new URLSearchParams(search).get('table')
  if (raw === null) return null

  const trimmed = raw.trim()
  if (!trimmed) return null

  return /^\d+$/.test(trimmed) ? trimmed.padStart(2, '0') : trimmed
}

/**
 * Keeps `?table=05` attached while navigating so a customer who opens a
 * product still sees their table on the way back.
 */
export function withTableParam(path: string, tableNumber: string | null): string {
  if (!tableNumber) return path
  const [pathname, existing = ''] = path.split('?')
  const params = new URLSearchParams(existing)
  params.set('table', tableNumber)
  return `${pathname}?${params.toString()}`
}
