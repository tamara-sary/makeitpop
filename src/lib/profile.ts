// Profile = one row per signed-in user in Supabase (`profiles`, see supabase/migrations).
// The 'profile' key in browser storage is a cache so the menu bar and day pages read it synchronously.
// Shots still live in this browser only.
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { load, save, useStored } from './store'
import { supabase } from './supabase'

export type Profile = { userId?: string; name: string; level: 'Mid' | 'Senior'; linkedin?: string; joined: number }
export type Shot = { src: string; at: number; w: number; h: number; name: string } // src = downscaled data URL

export const useProfile = () => useStored<Profile | null>('profile', null)
type Row = { id: string; name: string; level: Profile['level']; linkedin: string | null; created_at: string }
const fromRow = (r: Row): Profile => ({ userId: r.id, name: r.name, level: r.level, linkedin: r.linkedin ?? undefined, joined: Date.parse(r.created_at) })

// Pulls the signed-in user's profile into the cache. Returns 'ready' once we know whether they have one,
// so /me can show Join (no row) or the dashboard (row) without flashing the wrong one.
export function useProfileSync(user: User | null): 'idle' | 'loading' | 'ready' {
  const [doneFor, setDoneFor] = useState<string | null>(null)
  const uid = user?.id ?? null
  useEffect(() => {
    if (!uid || !supabase) return
    let live = true
    void supabase.from('profiles').select('*').eq('id', uid).maybeSingle().then(({ data, error }) => {
      if (!live) return
      if (error) {
        // Table missing / offline: keep a cached profile only if it is this user's
        const cached = load<Profile | null>('profile', null)
        if (cached?.userId && cached.userId !== uid) save('profile', null)
        console.warn('[profile] could not load from Supabase:', error.message)
      } else {
        save('profile', data ? fromRow(data as Row) : null)
      }
      setDoneFor(uid)
    })
    return () => { live = false }
  }, [uid])
  if (!uid) return 'idle'
  return doneFor === uid ? 'ready' : 'loading'
}

export async function saveProfile(user: User, p: Omit<Profile, 'userId' | 'joined'>): Promise<Profile> {
  const local: Profile = { ...p, userId: user.id, joined: Date.now() }
  if (supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, name: p.name, level: p.level, linkedin: p.linkedin ?? null })
      .select()
      .single()
    // Table not created yet (migration not run): keep working with the browser copy
    if (error && (error.code === 'PGRST205' || error.code === '42P01')) {
      console.warn('[profile] profiles table missing; run supabase/migrations/001_profiles.sql')
      save('profile', local)
      return local
    }
    if (error) throw error
    const saved = fromRow(data as Row)
    save('profile', saved)
    return saved
  }
  save('profile', local)
  return local
}

export const shotKey = (n: number) => `shot:${n}`

// Screenshots are big; browser storage is ~5 MB total. Downscale to 1600px wide WebP so several days fit.
export async function toShot(file: File, maxW = 1600): Promise<Shot> {
  if (!file.type.startsWith('image/')) throw new Error('not-image')
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => {
      const i = new Image()
      i.onload = () => ok(i)
      i.onerror = fail
      i.src = url
    })
    const scale = Math.min(1, maxW / img.naturalWidth)
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale)
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    c.getContext('2d')!.drawImage(img, 0, 0, w, h)
    return { src: c.toDataURL('image/webp', 0.86), at: Date.now(), w, h, name: file.name }
  } finally {
    URL.revokeObjectURL(url)
  }
}
