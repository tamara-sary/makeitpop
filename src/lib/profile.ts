// Prototype accounts: a profile + your shots, kept in this browser only.
// Swap for real auth + storage (e.g. Supabase) once visibility rules are decided.
import { useStored } from './store'

export type Profile = { name: string; level: 'Mid' | 'Senior'; linkedin?: string; joined: number }
export type Shot = { src: string; at: number; w: number; h: number; name: string } // src = downscaled data URL

export const useProfile = () => useStored<Profile | null>('profile', null)
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
