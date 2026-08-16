import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import type { Table } from '@/models'
import { findActiveTable } from '@/services/menuSelectors'
import { readStored, removeStored, STORAGE_KEYS, writeStored } from '@/utils/storage'
import { readTableParam } from '@/utils/url'
import { useMenu } from './useMenu'

export interface TableState {
  /** The validated table, or undefined when the QR link is unknown (spec §21). */
  table: Table | undefined
  /** What the URL asked for, valid or not — used to decide whether to persist. */
  requested: string | null
}

/**
 * Resolves the table behind `?table=05` (spec §20, §21).
 *
 * The URL stays the source of truth. A validated table is remembered so the
 * number survives an in-app navigation that drops the query string, but a URL
 * that asks for an unknown table clears that memory and the header quietly
 * falls back to a plain welcome — never an error.
 */
export function useTable(): TableState {
  const { search } = useLocation()
  const { tables } = useMenu()

  const state = useMemo<TableState>(() => {
    const requested = readTableParam(search)

    if (requested !== null) {
      return { table: findActiveTable(tables, requested), requested }
    }

    return { table: findActiveTable(tables, readStored(STORAGE_KEYS.tableNumber)), requested: null }
  }, [search, tables])

  useEffect(() => {
    if (state.requested === null) return
    if (state.table) writeStored(STORAGE_KEYS.tableNumber, state.table.number)
    else removeStored(STORAGE_KEYS.tableNumber)
  }, [state])

  return state
}
