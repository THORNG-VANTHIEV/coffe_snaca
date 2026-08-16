import type { MenuData } from '@/models'
import { mapMenuData } from './menuMapper'

/**
 * The one module that knows where menu data lives (spec §29, §73).
 *
 * Version 1 reads a static JSON document shipped with the build. Moving to a
 * REST API later means changing the fetch below and nothing else — no UI
 * component imports `db.json`, and none of them know the difference.
 */

const DEFAULT_MENU_URL = `${import.meta.env.BASE_URL}data/db.json`
const REQUEST_TIMEOUT_MS = 15_000

function getMenuUrl(): string {
  return import.meta.env.VITE_MENU_URL || DEFAULT_MENU_URL
}

/**
 * Deduplicates concurrent loads — StrictMode mounts effects twice in
 * development, and the splash screen should not fire two requests for it.
 */
let inFlight: Promise<MenuData> | null = null

async function requestMenuData(): Promise<MenuData> {
  const response = await fetch(getMenuUrl(), {
    // The menu changes whenever the owner pushes. Revalidating means a price
    // edit shows up on the next refresh instead of after the CDN TTL, while
    // an unchanged file still costs only a 304.
    cache: 'no-cache',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Unable to load menu data (HTTP ${response.status})`)
  }

  return mapMenuData(await response.json())
}

/** Loads and normalises the full menu. */
export function getMenuData(): Promise<MenuData> {
  inFlight ??= requestMenuData().finally(() => {
    inFlight = null
  })
  return inFlight
}
