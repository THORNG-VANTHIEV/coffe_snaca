/**
 * Defensive readers for hand-edited JSON.
 *
 * The shop owner edits `db.json` by hand, so a stray typo must never take the
 * menu down with a raw JavaScript error (spec §41). Every field is read
 * through one of these, falling back to a harmless default instead of
 * throwing. `scripts/validate-data.mjs` is what actually reports the mistake,
 * before it is ever deployed.
 */

export type RawRecord = Record<string, unknown>

export function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function readRecord(source: unknown, key: string): RawRecord {
  if (!isRecord(source)) return {}
  const value = source[key]
  return isRecord(value) ? value : {}
}

export function readString(source: RawRecord, key: string, fallback = ''): string {
  const value = source[key]
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

export function readNumber(source: RawRecord, key: string, fallback = 0): number {
  const value = source[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

export function readBoolean(source: RawRecord, key: string, fallback = false): boolean {
  const value = source[key]
  return typeof value === 'boolean' ? value : fallback
}

export function readArray(source: RawRecord, key: string): unknown[] {
  const value = source[key]
  return Array.isArray(value) ? value : []
}

export function readRecordArray(source: RawRecord, key: string): RawRecord[] {
  return readArray(source, key).filter(isRecord)
}

export function readStringArray(source: RawRecord, key: string): string[] {
  return readArray(source, key)
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function readNumberArray(source: RawRecord, key: string): number[] {
  return readArray(source, key).filter(
    (entry): entry is number => typeof entry === 'number' && Number.isFinite(entry),
  )
}

/** Reads a string field constrained to a known set of values. */
export function readEnumArray<T extends string>(
  source: RawRecord,
  key: string,
  allowed: readonly T[],
): T[] {
  return readStringArray(source, key).filter((entry): entry is T =>
    (allowed as readonly string[]).includes(entry),
  )
}
