import type { Price, Product, Promotion, Settings } from '@/models'

/**
 * What a promotion means, in one place.
 *
 * This is the menu's half of a rule the admin also implements, in
 * `app/Support/Promotion.php`. The two must agree exactly, because the admin
 * shows the shop what a discount will look like and this decides what the
 * customer actually reads. The worked examples in the tests on both sides are
 * the same numbers.
 *
 * Two rules:
 *
 *  1. **Dollars are discounted and rounded to the cent; riel is then derived
 *     from the discounted dollars** at the shop's fixed rate, rounded up to
 *     the next 100៛ note — exactly as every undiscounted riel price in
 *     `db.json` was. Taking the percentage off the riel figure instead would
 *     produce prices that `scripts/validate-data.mjs` rejects.
 *
 *  2. **A campaign runs by calendar day in the shop's timezone**, both ends
 *     inclusive.
 */

/** The shop's fixed rate, matching KHR_PER_USD in scripts/validate-data.mjs. */
const KHR_PER_USD = 4100

const MIN_PERCENT = 1
const MAX_PERCENT = 90

export function isValidPercent(percent: number): boolean {
  return Number.isFinite(percent) && percent >= MIN_PERCENT && percent <= MAX_PERCENT
}

/**
 * Today where the shop is, as `YYYY-MM-DD`.
 *
 * `en-CA` because its short date format *is* ISO order; formatting to parts
 * and reassembling avoids depending on that, but this is the one locale where
 * the shortcut is exact and it keeps the comparison a plain string compare.
 */
export function shopToday(timezone: string, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now)
  } catch {
    // An unknown timezone must not take the menu down; fall back to the
    // device's own day, which for a customer sitting in the shop is the
    // same day anyway.
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now)
  }
}

/** Whether the campaign is inside its date window right now. */
export function isPromotionLive(
  promotion: Promotion | null,
  now: Date = new Date(),
): promotion is Promotion {
  if (!promotion) return false

  const today = shopToday(promotion.timezone, now)

  if (promotion.startsAt && today < promotion.startsAt) return false
  if (promotion.endsAt && today > promotion.endsAt) return false

  return true
}

/** The discounted price, in both currencies. */
export function discountPrice(price: Price, percent: number): Price {
  if (!isValidPercent(percent) || price.usd <= 0) return price

  // Round to the cent first: 2.25 x 0.8 is 1.8000000000000003 in binary
  // floating point, and the riel figure is derived from this number.
  const usd = Math.round(price.usd * (100 - percent)) / 100

  return {
    usd,
    khr: Math.ceil((usd * KHR_PER_USD) / 100) * 100,
  }
}

/**
 * The discount actually in force on a product, or 0.
 *
 * The campaign gates the product: a percentage left on an item after the offer
 * ended must not quietly keep discounting it. Callers can therefore treat a
 * non-zero result as "show this as reduced" without checking anything else.
 */
export function activeDiscount(
  product: Pick<Product, 'promoPercent'>,
  settings: Pick<Settings, 'promo'>,
  now: Date = new Date(),
): number {
  if (!isPromotionLive(settings.promo, now)) return 0
  return isValidPercent(product.promoPercent) ? product.promoPercent : 0
}

/**
 * The products a customer would actually save money on, deepest cut first.
 *
 * The banner announces an offer; this is the offer. Without it the pop-up can
 * only repeat whatever the shop typed as a headline — and a shop in a hurry
 * types one word.
 *
 * Sold-out items are left out even where the menu keeps them visible: a
 * discount on something nobody can buy is not an offer.
 */
export function getDiscountedProducts(
  products: Product[],
  settings: Pick<Settings, 'promo'>,
  now: Date = new Date(),
): Product[] {
  if (!isPromotionLive(settings.promo, now)) return []

  return products
    .filter((product) => product.available && isValidPercent(product.promoPercent))
    .sort((a, b) => b.promoPercent - a.promoPercent)
}

/** The promotion's headline and details in the reader's language. */
export function promotionText(promotion: Promotion, language: 'en' | 'km') {
  return language === 'km'
    ? { title: promotion.titleKm, text: promotion.textKm }
    : { title: promotion.titleEn, text: promotion.textEn }
}
