/**
 * A physical table with its own QR code. In version 1 the table number is
 * informational only — it exists so version 2 can attach orders to it
 * (spec §20).
 */
export interface Table {
  id: number
  /** Zero-padded as printed on the QR sticker, e.g. "05". */
  number: string
  name: string
  active: boolean
}
