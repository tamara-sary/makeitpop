import { createContext, useContext, useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from 'react'
import { TitleBar } from './ui'
import { useStored } from '../lib/store'

// Poolsuite-style desk: on wide screens, windows float and can be dragged by their title bar,
// closed with ✕ and reopened from the dock. On narrow screens they stack in normal flow.

export type WinId = 'brief' | 'remix' | 'steam'
type Pos = { x: number; y: number } // x as fraction of desk width, y in px
type Layout = Record<WinId, Pos & { open: boolean }>

// x is clamped so a window never leaves the desk: x = 1 means "pinned right"
const DEFAULTS: Layout = {
  brief: { x: 0, y: 0, open: true },
  remix: { x: 1, y: 16, open: true },
  steam: { x: 0.2, y: 330, open: true },
}

type DeskCtx = {
  floating: boolean
  layout: Layout
  z: Record<WinId, number>
  front: (id: WinId) => void
  move: (id: WinId, p: Pos) => void
  setOpen: (id: WinId, open: boolean) => void
  desk: RefObject<HTMLDivElement | null>
}
const Ctx = createContext<DeskCtx | null>(null)
const useDesk = () => useContext(Ctx)!

export function useOpenWin() {
  const d = useDesk()
  return (id: WinId) => {
    d.setOpen(id, true)
    d.front(id)
    window.setTimeout(() => document.getElementById('win-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }
}

export function useWide() {
  const q = '(min-width: 1024px)'
  const [wide, setWide] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return wide
}

export function Desk({ children }: { children: ReactNode }) {
  const floating = useWide()
  const [layout, setLayout] = useStored<Layout>('desk-v5', DEFAULTS)
  const [z, setZ] = useState<Record<WinId, number>>({ remix: 3, brief: 2, steam: 1 })
  const top = useRef(3)
  const desk = useRef<HTMLDivElement>(null)

  const value: DeskCtx = {
    floating,
    layout,
    z,
    desk,
    front: (id) => setZ((s) => ({ ...s, [id]: ++top.current })),
    move: (id, p) => setLayout((l) => ({ ...l, [id]: { ...l[id], ...p } })),
    setOpen: (id, open) => setLayout((l) => ({ ...l, [id]: { ...l[id], open } })),
  }

  return (
    <Ctx.Provider value={value}>
      <div ref={desk} className={floating ? 'relative z-20 min-h-[560px]' : 'grid gap-6'}>
        {children}
      </div>
      <Dock reset={() => setLayout(DEFAULTS)} />
    </Ctx.Provider>
  )
}

export function FloatWin({ id, title, width = '380px', children, bodyClass = 'p-4' }: { id: WinId; title: string; width?: string; children: ReactNode; bodyClass?: string }) {
  const d = useDesk()
  const st = d.layout[id]
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const self = useRef<HTMLElement>(null)
  if (!st.open) return null

  if (!d.floating) {
    return (
      <section id={'win-' + id} className="win" aria-label={title}>
        <TitleBar title={title} onClose={() => d.setOpen(id, false)} />
        <div className={bodyClass}>{children}</div>
      </section>
    )
  }

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    d.front(id)
    const deskW = d.desk.current!.clientWidth
    const w = self.current!.offsetWidth
    drag.current = { sx: e.clientX, sy: e.clientY, ox: Math.min(Math.max(st.x * deskW, 0), deskW - w), oy: st.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const el = d.desk.current!
    const w = self.current!.offsetWidth
    const nx = Math.min(Math.max(drag.current.ox + e.clientX - drag.current.sx, 0), el.clientWidth - w)
    const ny = Math.min(Math.max(drag.current.oy + e.clientY - drag.current.sy, -10), 2400)
    d.move(id, { x: nx / Math.max(1, el.clientWidth - w), y: ny })
  }
  const onUp = () => { drag.current = null }

  return (
    <section
      ref={self}
      id={'win-' + id}
      className="win absolute"
      style={{ left: `calc((100% - ${width}) * ${Math.min(Math.max(st.x, 0), 1)})`, top: st.y, width, zIndex: 10 + d.z[id] }}
      aria-label={title}
      onPointerDownCapture={() => d.front(id)}
    >
      <TitleBar title={title} className="drag" onClose={() => d.setOpen(id, false)} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} />
      <div className={bodyClass + ' max-h-[70vh] overflow-y-auto'}>{children}</div>
    </section>
  )
}

const DOCK: { id: WinId; label: string; icon: ReactNode; bg: string }[] = [
  { id: 'brief', label: 'Brief', bg: 'bg-sun', icon: <path d="M5 4h10M5 8h10M5 12h6" fill="none" stroke="currentColor" strokeWidth="2" /> },
  { id: 'remix', label: 'Remix it', bg: 'bg-pink', icon: <path d="M4 8h11l-3-3M16 12H5l3 3" fill="none" stroke="currentColor" strokeWidth="2" /> },
  { id: 'steam', label: 'Steam room', bg: 'bg-mint', icon: <path d="M10 3v9M10 15v2" fill="none" stroke="currentColor" strokeWidth="2.5" /> },
]

function Dock({ reset }: { reset: () => void }) {
  const d = useDesk()
  return (
    <nav aria-label="Windows" className="fixed inset-x-0 z-40 flex justify-center px-4" style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex border-2 border-ink bg-paper shadow-[4px_4px_0_#161616]">
        {DOCK.map((w) => {
          const open = d.layout[w.id].open
          return (
            <button
              key={w.id}
              type="button"
              aria-pressed={open}
              onClick={() => { d.setOpen(w.id, !open); if (!open) d.front(w.id) }}
              className="grid min-w-20 cursor-pointer justify-items-center gap-1 border-0 border-r-2 border-ink bg-paper px-3 py-2 text-[12px] font-semibold text-ink hover:bg-cream"
            >
              <span className={`grid h-8 w-8 place-items-center border-2 border-ink ${w.bg}`}>
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">{w.icon}</svg>
              </span>
              <span>{w.label}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-ink' : 'bg-transparent'}`} aria-hidden="true" />
            </button>
          )
        })}
        {d.floating && (
          <button type="button" onClick={reset} className="cursor-pointer border-0 bg-paper px-3 text-[12px] font-semibold text-ink hover:bg-cream">Tidy up</button>
        )}
      </div>
    </nav>
  )
}
