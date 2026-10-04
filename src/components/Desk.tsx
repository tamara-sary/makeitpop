import { createContext, useContext, useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from 'react'
import { TitleBar } from './ui'
import { useStored } from '../lib/store'

// Poolsuite-style desk: on wide screens, windows float and can be dragged by their title bar,
// closed with ✕ and reopened from the dock. On narrow screens they stack in normal flow.

export type WinId = 'brief' | 'remix' | 'steam'
type Pos = { x: number; y: number } // x as fraction of desk width, y in px
type Layout = Record<WinId, Pos & { open: boolean }>

// x is clamped so a window never leaves the desk: x = 1 means "pinned right"
// Brief sits left of the challenge, Remix + Steam room on the right, so nothing covers the screen.
const DEFAULTS: Layout = {
  brief: { x: 0, y: 16, open: true },
  remix: { x: 1, y: 16, open: true },
  steam: { x: 0, y: -16, open: true }, // y < 0 = pinned that far from the bottom
}

export type DeskApi = { isOpen: (id: WinId) => boolean; toggle: (id: WinId) => void; reset: () => void }

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

// Desk = an overlay layer on top of the canvas. Windows float in it; the canvas stays clickable around them.
// `stage` (optional) = the canvas the windows float over; windows then start below the toolbar.
export function Desk({ children, toolbar, stage }: { children: ReactNode; toolbar: (api: DeskApi) => ReactNode; stage?: ReactNode }) {
  const floating = useWide()
  const [layout, setLayout] = useStored<Layout>('desk-v8', DEFAULTS)
  const [z, setZ] = useState<Record<WinId, number>>({ brief: 3, remix: 2, steam: 1 })
  const top = useRef(4)
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
      {toolbar({ isOpen: (id) => layout[id].open, toggle: (id) => { value.setOpen(id, !layout[id].open); value.front(id) }, reset: () => setLayout(DEFAULTS) })}
      {stage ? (
        <div className="relative flex min-h-0 flex-1 flex-col">
          {stage}
          <div ref={desk} className={floating ? 'pointer-events-none absolute inset-x-4 inset-y-0 z-20' : 'grid gap-6 p-4'}>
            {children}
          </div>
        </div>
      ) : (
        <div ref={desk} className={floating ? 'pointer-events-none absolute inset-0 z-20' : 'order-last grid gap-6 p-4'}>
          {children}
        </div>
      )}
    </Ctx.Provider>
  )
}

export function FloatWin({ id, title, width = '380px', children, bodyClass = 'p-4', maxH = 'calc(100dvh - 140px)' }: { id: WinId; title: string; width?: string; children: ReactNode; bodyClass?: string; maxH?: string }) {
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
    drag.current = { sx: e.clientX, sy: e.clientY, ox: Math.min(Math.max(st.x * deskW, 0), deskW - w), oy: self.current!.offsetTop }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const el = d.desk.current!
    const w = self.current!.offsetWidth
    const nx = Math.min(Math.max(drag.current.ox + e.clientX - drag.current.sx, 0), el.clientWidth - w)
    const ny = Math.min(Math.max(drag.current.oy + e.clientY - drag.current.sy, 0), el.clientHeight - 60)
    d.move(id, { x: nx / Math.max(1, el.clientWidth - w), y: ny })
  }
  const onUp = () => { drag.current = null }

  return (
    <section
      ref={self}
      id={'win-' + id}
      className="win pointer-events-auto absolute"
      style={{ left: `calc((100% - ${width}) * ${Math.min(Math.max(st.x, 0), 1)})`, ...(st.y < 0 ? { bottom: -st.y } : { top: st.y }), width, zIndex: 10 + d.z[id] }}
      aria-label={title}
      onPointerDownCapture={() => d.front(id)}
    >
      <TitleBar title={title} className="drag" onClose={() => d.setOpen(id, false)} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} />
      <div className={bodyClass + ' overflow-y-auto'} style={{ maxHeight: maxH }}>{children}</div>
    </section>
  )
}
