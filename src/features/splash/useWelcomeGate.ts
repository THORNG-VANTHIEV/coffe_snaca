import { useCallback, useState } from 'react'
import {
  readSessionStored,
  STORAGE_KEYS,
  writeSessionStored,
} from '@/utils/storage'

function shouldShowWelcome(): boolean {
  return readSessionStored(STORAGE_KEYS.welcomeSeen) !== '1'
}

/** Keeps the one-per-session welcome open until the customer chooses to enter. */
export function useWelcomeGate() {
  const [showWelcome, setShowWelcome] = useState(shouldShowWelcome)

  const dismissWelcome = useCallback(() => {
    writeSessionStored(STORAGE_KEYS.welcomeSeen, '1')
    setShowWelcome(false)
  }, [])

  return { showWelcome, dismissWelcome }
}
