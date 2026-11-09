import type { Product, Promotion } from '@/models'
import type { Strings } from '@/i18n/strings'
import { promotionDaysLeft } from '@/services/promotion'

/** Where the pop-up's "see all offers" lands on the home page. */
export const PROMO_SECTION_ID = 'home-promo'

/**
 * "Last day", "Ends tomorrow", "3 days left" — or null for an offer with no
 * end date, which has nothing honest to count down to.
 *
 * Shared by the pop-up and the home-page section so the two can never
 * disagree about how long is left.
 */
export function countdownLabel(
  promotion: Promotion,
  strings: Strings['promo'],
  now: Date = new Date(),
): string | null {
  const daysLeft = promotionDaysLeft(promotion, now)

  if (daysLeft === null) return null
  if (daysLeft === 0) return strings.endsToday
  if (daysLeft === 1) return strings.endsTomorrow

  return strings.daysLeft.replace('{count}', String(daysLeft))
}

/** Whether the offer has more than one discount, which is when "up to" is true. */
export function hasVariedDiscounts(products: Pick<Product, 'promoPercent'>[]): boolean {
  return new Set(products.map((product) => product.promoPercent)).size > 1
}

/** The deepest discount among the products on offer, or 0 for none. */
export function deepestDiscount(products: Pick<Product, 'promoPercent'>[]): number {
  return products.reduce((deepest, product) => Math.max(deepest, product.promoPercent), 0)
}
