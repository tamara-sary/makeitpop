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

// Returns false when the browser refuses (blocked storage or quota full, e.g. a big image).
export function save<T>(key: string, value: T): boolean {
  try {
    const raw = JSON.stringify(value)
    if (localStorage.getItem('mip:' + key) === raw) return true
    localStorage.setItem('mip:' + key, raw)
    window.dispatchEvent(new CustomEvent('mip-store', { detail: key })) // keeps other components on the same key in sync
    return true
  } catch {
    return false /* storage blocked: keep working in memory */
  }
}

// Keeps value + key together so switching keys (e.g. day 1 → day 4) never writes one key's data into another.
export function useStored<T>(key: string, fallback: T) {
  const [state, setState] = useState(() => ({ key, value: load(key, fallback) }))
  const current = state.key === key ? state.value : load(key, fallback)
  if (state.key !== key) setState({ key, value: current })
  useEffect(() => { if (state.key === key) save(key, state.value) }, [key, state])
  // Another component (e.g. the menu bar) changed this key: pick it up
  useEffect(() => {
    const on = (e: Event) => {
      if ((e as CustomEvent).detail !== key) return
      const v = load(key, fallback)
      setState((s) => (JSON.stringify(s.value) === JSON.stringify(v) ? s : { key, value: v }))
    }
    window.addEventListener('mip-store', on)
    return () => window.removeEventListener('mip-store', on)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
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
