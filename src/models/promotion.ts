/**
 * The shop's running promotion (spec §24).
 *
 * Present in `db.json` only while the shop has one switched on, so `null` here
 * is the ordinary case rather than an error.
 *
 * Note what the document does *not* carry: discounted prices. Each product
 * carries a percentage and the prices are derived at render time, which is
 * what lets `startsAt`/`endsAt` open and close a campaign on their own day
 * without anyone republishing the file.
 */
export interface Promotion {
  titleEn: string
  titleKm: string
  textEn: string
  textKm: string
  /** Optional banner image, already resolved to a servable URL. */
  image: string
  /** Inclusive `YYYY-MM-DD` bounds. Empty means unbounded on that side. */
  startsAt: string
  endsAt: string
  /**
   * The shop's timezone, shipped rather than assumed.
   *
   * The window is a run of calendar days *in Cambodia*. A phone in another
   * timezone must not start the offer a few hours early, and a phone whose
   * clock is set to another country must not miss it entirely.
   */
  timezone: string
}
