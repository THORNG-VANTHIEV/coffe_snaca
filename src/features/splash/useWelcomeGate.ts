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
  const [isLeaving, setIsLeaving] = useState(false)

  const dismissWelcome = useCallback(() => {
    writeSessionStored(STORAGE_KEYS.welcomeSeen, '1')
    setIsLeaving(true)
  }, [])

  const completeWelcome = useCallback(() => {
    setShowWelcome(false)
    setIsLeaving(false)
  }, [])

  return { showWelcome, isLeaving, dismissWelcome, completeWelcome }
}
