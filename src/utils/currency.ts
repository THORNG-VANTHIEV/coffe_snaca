import type { Price, Settings } from '@/models'

/**
 * Dual-currency formatting (spec §17).
 *
 * Both numbers are authored by hand in `db.json`; nothing here converts
 * between them and no exchange-rate API is ever called.
 */

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const khrFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

/** Khmer riel sign. */
export const RIEL = '៛'

export function formatUsd(amount: number): string {
  return usdFormatter.format(amount)
}

export function formatKhr(amount: number): string {
  return `${khrFormatter.format(amount)}${RIEL}`
}

export interface FormattedPrice {
  usd: string | null
  khr: string | null
}

/** Formats a price, honouring the currencies the shop has switched on. */
export function formatPrice(price: Price, settings: Settings): FormattedPrice {
  return {
    usd: settings.currencyUsd ? formatUsd(price.usd) : null,
    khr: settings.currencyKhr ? formatKhr(price.khr) : null,
  }
}

/** Add-on pricing, rendered as a surcharge: `+$0.50 / +2,000៛` (spec §14). */
export function formatPriceDelta(price: Price, settings: Settings): string | null {
  if (price.usd === 0 && price.khr === 0) return null

  const parts: string[] = []
  if (settings.currencyUsd) parts.push(`+${formatUsd(price.usd)}`)
  if (settings.currencyKhr) parts.push(`+${formatKhr(price.khr)}`)

  return parts.length > 0 ? parts.join(' / ') : null
}
