// Prototype persistence: this browser only. Swap for a real backend later.
import { useCallback, useEffect, useState } from 'react'

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem('mip:' + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem('mip:' + key, JSON.stringify(value))
  } catch {
    /* storage blocked: keep working in memory */
  }
}

// Keeps value + key together so switching keys (e.g. day 1 → day 4) never writes one key's data into another.
export function useStored<T>(key: string, fallback: T) {
  const [state, setState] = useState(() => ({ key, value: load(key, fallback) }))
  const current = state.key === key ? state.value : load(key, fallback)
  if (state.key !== key) setState({ key, value: current })
  useEffect(() => { if (state.key === key) save(key, state.value) }, [key, state])
  const setValue = useCallback(
    (v: T | ((prev: T) => T)) =>
      setState((s) => ({ key: s.key, value: typeof v === 'function' ? (v as (p: T) => T)(s.value) : v })),
    [],
  )
  return [current, setValue] as const
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
