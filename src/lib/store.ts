// Prototype persistence: this browser only. Swap for a real backend later.
import { useEffect, useState } from 'react'

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

export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback))
  useEffect(() => { save(key, value) }, [key, value])
  return [value, setValue] as const
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
