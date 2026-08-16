/**
 * LocalStorage access that cannot throw.
 *
 * Safari in private mode and locked-down browsers reject `setItem`, and a
 * customer scanning a QR code must never see the menu break over a saved
 * preference. Only non-sensitive display preferences are stored (spec §46).
 *
 * Keys are prefixed because every GitHub Pages project of an account shares
 * one origin — an unprefixed "language" key would collide with a sibling site.
 */

const PREFIX = 'coffee-menu.'

export const STORAGE_KEYS = {
  language: `${PREFIX}language`,
  // Also read by the inline boot script in index.html — keep the two in step.
  theme: `${PREFIX}theme`,
  lastCategory: `${PREFIX}last_selected_category`,
  tableNumber: `${PREFIX}table_number`,
} as const

export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* Preference simply is not remembered — not worth surfacing. */
  }
}

export function removeStored(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
