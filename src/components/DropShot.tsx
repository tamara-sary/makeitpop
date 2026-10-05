import { useEffect, useRef, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { save, useStored } from '../lib/store'
import { shotKey, toShot, type Shot } from '../lib/profile'
import { useToast } from './ui'

// "Your remix" frame: drop your shot in (or pick / paste it). Same frame as in the Figma kit,
// so the empty state says where your version goes, and the filled state sits right next to the original.
export function DropShot({ n }: { n: number }) {
  const [shot] = useStored<Shot | null>(shotKey(n), null)
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const toast = useToast()

  const take = async (file?: File | null) => {
    if (!file) return
    setBusy(true)
    try {
      const s = await toShot(file)
      if (!save(shotKey(n), s)) toast('Your browser is out of space for images. Remove an older shot from your profile.')
      else toast('Shot added. It\'s on your profile too.')
    } catch {
      toast('That file isn\'t an image. Drop a PNG, JPG or WebP.')
    } finally {
      setBusy(false)
    }
  }

  // A file dropped anywhere else on the page would make the browser open it and leave the site.
  useEffect(() => {
    const stop = (e: globalThis.DragEvent) => { if (e.dataTransfer?.types.includes('Files')) e.preventDefault() }
    window.addEventListener('dragover', stop)
    window.addEventListener('drop', stop)
    return () => { window.removeEventListener('dragover', stop); window.removeEventListener('drop', stop) }
  }, [])

  // Paste a screenshot (⌘V) while the frame has focus
  useEffect(() => {
    const el = box.current
    if (!el) return
    const onPaste = (e: ClipboardEvent) => {
      const f = [...(e.clipboardData?.files ?? [])].find((x) => x.type.startsWith('image/'))
      if (f) { e.preventDefault(); take(f) }
    }
    el.addEventListener('paste', onPaste)
    return () => el.removeEventListener('paste', onPaste)
  })

  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    take(e.dataTransfer.files[0])
  }
  const dragProps = {
    onDragOver: (e: DragEvent) => { e.preventDefault(); setOver(true) },
    onDragLeave: () => setOver(false),
    onDrop: drop,
  }

  const picker = <input ref={input} type="file" accept="image/*" className="sr-only" onChange={(e) => { take(e.target.files?.[0]); e.target.value = '' }} />

  if (shot) {
    return (
      <div className="grid gap-3">
        <div {...dragProps} className={'relative border-2 border-ink bg-paper ' + (over ? 'outline-4 outline-offset-2 outline-pink' : '')}>
          <img src={shot.src} alt={`Your remix of Day ${n}`} className="block h-auto w-full" draggable={false} />
          {over && <div className="absolute inset-0 grid place-items-center bg-pink/80 font-display text-[22px] font-extrabold">Drop to replace</div>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => input.current?.click()}>Replace shot</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { save(shotKey(n), null); toast('Shot removed') }}>Remove</button>
          <Link to="/me" className="ml-auto text-[14px] font-semibold text-ink">See it on your profile →</Link>
        </div>
        <p className="text-[13px] text-muted">Only you can see this (saved in this browser). Post it on LinkedIn to show it.</p>
        {picker}
      </div>
    )
  }

  return (
    <div ref={box} tabIndex={0} role="group" aria-label="Your remix: drop your shot here"
      {...dragProps}
      className={'grid aspect-[16/10] place-items-center border-2 border-dashed p-6 text-center transition-colors ' + (over ? 'border-ink bg-sun' : 'border-ink/40 bg-paper/60')}>
      <div className="grid justify-items-center gap-2">
        <span className="font-pixel text-[12px]">YOUR REMIX</span>
        <p className="font-display text-[24px] font-extrabold">{busy ? 'Adding your shot…' : over ? 'Drop it!' : 'Drop your shot here'}</p>
        <p className="text-[14px] text-muted">Build it in the Figma file or the code kit, then drop a screenshot here or paste it (⌘V).</p>
        <button type="button" className="btn btn-sm mt-1" onClick={() => input.current?.click()}>Choose image</button>
      </div>
      {picker}
    </div>
  )
}
