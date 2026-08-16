type ClassValue = string | false | null | undefined

/** Joins conditional class names. Small enough not to warrant a dependency. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
