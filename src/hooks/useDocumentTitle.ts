import { useEffect } from 'react'

/**
 * Keeps the tab title meaningful as the customer moves around, which also
 * gives shared links a readable name (spec §50).
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
