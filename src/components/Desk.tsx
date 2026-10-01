import { createContext, useContext, useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from 'react'
import { TitleBar } from './ui'
import { useStored } from '../lib/store'

// Poolsuite-style desk: on wide screens, windows float and can be dragged by their title bar,
// closed with ✕ and reopened from the dock. On narrow screens they stack in normal flow.

export type WinId = 'remix' | 'crits' | 'steam'
type Pos = { x: number; y: number } // x as fraction of desk width, y in px
type Layout = Record<WinId, Pos & { open: boolean }>

const DEFAULTS: Layout = {
  remix: { x: 0.64, y: 24, open: true },
  crits: { x: 0.04, y: 730, open: true },
  steam: { x: 0.68, y: 600, open: true },
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

function useWide() {
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

export function Desk({ main, children }: { main: ReactNode; children: ReactNode }) {
  const floating = useWide()
  const [layout, setLayout] = useStored<Layout>('desk-v4', DEFAULTS)
  const [z, setZ] = useState<Record<WinId, number>>({ remix: 3, crits: 2, steam: 1 })
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
      <div ref={desk} className={floating ? 'relative min-h-[1260px]' : 'grid gap-8'}>
        <div className={floating ? 'relative z-0 w-[66%]' : ''}>{main}</div>
        {children}
      </div>
      <Dock reset={() => setLayout(DEFAULTS)} />
    </Ctx.Provider>
  )
}

export function FloatWin({ id, title, width = 380, children, bodyClass = 'p-4' }: { id: WinId; title: string; width?: number; children: ReactNode; bodyClass?: string }) {
  const d = useDesk()
  const st = d.layout[id]
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
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
    drag.current = { sx: e.clientX, sy: e.clientY, ox: st.x * deskW, oy: st.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const el = d.desk.current!
    const maxX = el.clientWidth - width
    const maxY = el.clientHeight - 40
    const nx = Math.min(Math.max(drag.current.ox + e.clientX - drag.current.sx, -width + 120), maxX + width - 120)
    const ny = Math.min(Math.max(drag.current.oy + e.clientY - drag.current.sy, -10), maxY)
    d.move(id, { x: nx / el.clientWidth, y: ny })
  }
  const onUp = () => { drag.current = null }

  return (
    <section
      id={'win-' + id}
      className="win absolute"
      style={{ left: `clamp(0px, ${st.x * 100}%, calc(100% - ${width}px))`, top: st.y, width, zIndex: 10 + d.z[id] }}
      aria-label={title}
      onPointerDownCapture={() => d.front(id)}
    >
      <TitleBar title={title} className="drag" onClose={() => d.setOpen(id, false)} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} />
      <div className={bodyClass + ' max-h-[70vh] overflow-y-auto'}>{children}</div>
    </section>
  )
}

const DOCK: { id: WinId; label: string; icon: ReactNode; bg: string }[] = [
  { id: 'remix', label: 'Remix it', bg: 'bg-pink', icon: <path d="M4 8h11l-3-3M16 12H5l3 3" fill="none" stroke="currentColor" strokeWidth="2" /> },
  { id: 'crits', label: 'Crits', bg: 'bg-sun', icon: <path d="M4 4h12v8l-4 4H4z M12 16v-4h4" fill="none" stroke="currentColor" strokeWidth="2" /> },
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
