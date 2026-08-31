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
  // Session-only: a new browser session may show the branded welcome again.
  welcomeSeen: `${PREFIX}welcome_seen`,
  // Same reasoning for the promotion pop-up: announced once a visit, not once
  // ever — the offer is still news to someone coming back tomorrow.
  promoSeen: `${PREFIX}promo_seen`,
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

/** SessionStorage variants for UI that should reset with the browser session. */
export function readSessionStored(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeSessionStored(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    /* The welcome may appear again next time; the menu still works. */
  }
}
