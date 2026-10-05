import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from 'react'

// v5 day page: a design-tool canvas laid out like a real Figma file.
// The brief and the remix steps are *places* on the canvas (sections next to the design),
// not windows on top of it.
// Navigation follows Figma, because that's what designers' hands already do:
//   pinch / ⌘-or-Ctrl + scroll = zoom around the cursor · scroll / two-finger = pan (Shift = sideways)
//   Space + drag, middle-drag or drag on empty canvas = pan
//   ⌘/Ctrl + = / − = zoom · Shift+0 = 100% · Shift+1 = fit all · Shift+2 = fit the current section

export type SectionId = 'brief' | 'original' | 'remix' | 'share'
export type View = SectionId | 'all'
export type Focus = { view: View; n: number } // n bumps on every request, so asking for the same view again re-fits

export type CanvasSection = {
  id: SectionId
  n: string // section number, e.g. "1a"
  name: string
  width: number // world px
  tabExtra?: ReactNode // shown next to the tab, e.g. the brief's one-line job on the design
  tone?: 'brand' | 'neutral' // neutral = the work under review, so it reads as "not our UI"
  children: ReactNode
}

type Cam = { x: number; y: number; s: number }
type Rect = { x: number; y: number; w: number; h: number }

const GAP = 140 // world px between sections
const MIN_S = 0.05, MAX_S = 8 // Figma goes further; this is plenty to inspect a 1px border
const clampS = (s: number) => Math.min(MAX_S, Math.max(MIN_S, s))

// Fit a rect into the viewport. Extra top margin leaves room for the section tab.
// "left" keeps the next section peeking in from the right (used for the brief, so the design is visible behind it).
function fit(r: Rect, vw: number, vh: number, align: 'left' | 'center', mb = 20): Cam {
  const mx = 32, mt = 52
  const s = Math.min((vw - 2 * mx) / r.w, (vh - mt - mb) / r.h, 1)
  const x = align === 'left' ? mx + 24 - r.x * s : (vw - r.w * s) / 2 - r.x * s
  const y = mt + (vh - mt - mb - r.h * s) / 2 - r.y * s
  return { x, y, s }
}

// Fit, but if a screen-space card (bottom-right corner) would land on the section, shrink until it doesn't.
function fitAvoiding(r: Rect, vw: number, vh: number, align: 'left' | 'center', corner?: { w: number; h: number }): Cam {
  const cam = fit(r, vw, vh, align)
  if (!corner || align === 'left') return cam // the brief view only has the design peeking on the right; covering that is fine
  const right = cam.x + (r.x + r.w) * cam.s, bottom = cam.y + (r.y + r.h) * cam.s
  const overlaps = right > vw - corner.w - 16 && bottom > vh - corner.h - 16
  return overlaps ? fit(r, vw, vh, align, corner.h + 28) : cam
}

const union = (rs: Rect[]): Rect => {
  const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y))
  return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y }
}

const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))

export function Canvas({ focus, onFocus, sections, avoid, children }: {
  focus: Focus
  onFocus: (v: View) => void
  sections: CanvasSection[]
  avoid?: { w: number; h: number } // a card pinned bottom-right that "fit" keeps the section clear of
  children?: ReactNode // screen-space overlays (e.g. the steam room card)
}) {
  const vp = useRef<HTMLDivElement>(null)
  const refs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({})
  const [cam, setCamState] = useState<Cam | null>(null)
  const camRef = useRef<Cam | null>(null)
  const [animate, setAnimate] = useState(false)
  const [spaceDown, setSpaceDown] = useState(false)
  const [panning, setPanning] = useState(false)
  const pan = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const latest = useRef({ sections, avoid })
  latest.current = { sections, avoid }

  const setCam = (c: Cam, smooth = false) => { camRef.current = c; setAnimate(smooth); setCamState(c) }

  const rectOf = (v: View): Rect => {
    const rects = latest.current.sections.map((sec) => {
      const e = refs.current[sec.id]
      return e ? { x: e.offsetLeft, y: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight } : { x: 0, y: 0, w: 1, h: 1 }
    })
    return v === 'all' ? union(rects) : rects[Math.max(0, latest.current.sections.findIndex((s) => s.id === v))]
  }
  const fitTo = (v: View, smooth: boolean) => {
    const el = vp.current
    if (!el) return
    setCam(fitAvoiding(rectOf(v), el.clientWidth, el.clientHeight, v === 'brief' ? 'left' : 'center', latest.current.avoid), smooth)
  }
  // Zoom keeping the world point under (px, py) fixed on screen, the way Figma zooms to the cursor.
  const zoomAt = (px: number, py: number, next: number, smooth = false) => {
    const c = camRef.current
    if (!c) return
    const s = clampS(next)
    const wx = (px - c.x) / c.s, wy = (py - c.y) / c.s
    setCam({ x: px - wx * s, y: py - wy * s, s }, smooth)
  }
  const zoomCenter = (factor: number) => {
    const el = vp.current
    if (el && camRef.current) zoomAt(el.clientWidth / 2, el.clientHeight / 2, camRef.current.s * factor, true)
  }

  // First paint: fit without animation. Later focus requests glide.
  const first = useRef(true)
  useLayoutEffect(() => {
    fitTo(focus.view, !first.current)
    first.current = false
  }, [focus.n]) // eslint-disable-line react-hooks/exhaustive-deps

  // Wheel + pinch. Native listener because React's wheel handler is passive and can't stop the browser's page zoom.
  useEffect(() => {
    const el = vp.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      const c = camRef.current
      if (!c) return
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1
      const r = el.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        // trackpad pinch arrives as ctrl+wheel with small deltas; a mouse wheel notch is ~100
        zoomAt(e.clientX - r.left, e.clientY - r.top, c.s * Math.exp(-e.deltaY * unit * 0.0075))
      } else {
        const dx = (e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX) * unit
        const dy = (e.shiftKey && !e.deltaX ? 0 : e.deltaY) * unit
        setCam({ ...c, x: c.x - dx, y: c.y - dy })
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Keyboard: Space to pan, Figma zoom shortcuts.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (typing(e.target)) return
      if (e.code === 'Space' && !e.repeat) { setSpaceDown(true); e.preventDefault() }
      const mod = e.metaKey || e.ctrlKey
      if (mod && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomCenter(2) }
      else if (mod && e.key === '-') { e.preventDefault(); zoomCenter(0.5) }
      else if (e.shiftKey && e.code === 'Digit0') { e.preventDefault(); zoomCenter(1 / (camRef.current?.s ?? 1)) }
      else if (e.shiftKey && e.code === 'Digit1') { e.preventDefault(); onFocus('all') }
      else if (e.shiftKey && e.code === 'Digit2') { e.preventDefault(); fitTo(focus.view, true) }
    }
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceDown(false) }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }) // re-binds each render so shortcuts see the current focus

  // Pan: Space+drag or middle button anywhere; plain drag only on empty canvas (not on sections or stickies).
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (pan.current) return
    const t = e.target as HTMLElement
    const empty = t === e.currentTarget || t.dataset.world !== undefined
    if (!(spaceDown || e.button === 1 || (e.button === 0 && empty)) || !camRef.current) return
    e.preventDefault()
    pan.current = { sx: e.clientX, sy: e.clientY, ox: camRef.current.x, oy: camRef.current.y }
    setPanning(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const p = pan.current, c = camRef.current
    if (!p || !c) return
    setCam({ ...c, x: p.ox + e.clientX - p.sx, y: p.oy + e.clientY - p.sy })
  }
  const onUp = () => { pan.current = null; setPanning(false) }

  const s = cam?.s ?? 1
  const worldStyle = {
    transform: cam ? `translate(${cam.x}px, ${cam.y}px) scale(${s})` : undefined,
    transformOrigin: '0 0',
    transition: animate ? 'transform 600ms cubic-bezier(.2,.75,.2,1)' : 'none',
    visibility: cam ? 'visible' : 'hidden',
    gap: GAP,
    '--inv': 1 / s, // section tabs divide by the zoom so they keep their screen size, like Figma's section names
  } as CSSProperties

  return (
    <div ref={vp} className="relative min-h-0 flex-1 touch-none overflow-hidden select-none"
      onPointerDownCapture={(e) => { if (spaceDown || e.button === 1) onDown(e) }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      style={{
        cursor: panning ? 'grabbing' : spaceDown ? 'grab' : undefined,
        backgroundColor: '#f3eee6',
        backgroundImage: 'radial-gradient(#d8cfc1 1px, transparent 1px)',
        backgroundSize: `${22 * s}px ${22 * s}px`,
        backgroundPosition: cam ? `${cam.x}px ${cam.y}px` : undefined,
      }}>
      <div data-world="" className="absolute left-0 top-0 flex items-start p-16" style={worldStyle} onTransitionEnd={() => setAnimate(false)}>
        {sections.map((sec) => {
          const active = focus.view === sec.id
          return (
            <section key={sec.id} ref={(e) => { refs.current[sec.id] = e }} aria-label={`${sec.n} ${sec.name}`}
              className={'relative shrink-0 select-text border-2 ' + (sec.tone === 'neutral' ? 'border-[#cfc6b8] bg-[#ebe5db] p-6' : 'border-ink bg-cream p-10')}
              style={{ width: sec.width, pointerEvents: spaceDown || panning ? 'none' : undefined }}>
              {/* Section tab: our trade dress (ink, pixel font), Figma's idea of a named section. Click = zoom to it. */}
              <div className="absolute bottom-full left-[-2px] flex items-center gap-2 pb-2" style={{ transform: 'scale(var(--inv))', transformOrigin: '0 100%', whiteSpace: 'nowrap' }}>
                <button type="button" onClick={() => onFocus(sec.id)} aria-pressed={active}
                  className={'cursor-pointer border-2 border-ink px-2 py-1 font-pixel text-[12px] uppercase ' + (active ? 'bg-pink text-ink' : 'bg-ink text-cream hover:bg-sun hover:text-ink')}>
                  {sec.n} · {sec.name}
                </button>
                {active && sec.tabExtra}
              </div>
              {sec.children}
            </section>
          )
        })}
      </div>

      {/* Zoom control, bottom-left like a design tool's status bar */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center rounded-lg border border-[#e4ded4] bg-white p-0.5 text-[13px] font-semibold text-[#2b2b2b] shadow-sm" role="group" aria-label="Zoom">
        <button type="button" className="h-7 w-7 cursor-pointer rounded-md border-0 bg-transparent hover:bg-black/5" onClick={() => zoomCenter(1 / 1.5)} aria-label="Zoom out" title="Zoom out (⌘ −)">−</button>
        <button type="button" className="h-7 min-w-14 cursor-pointer rounded-md border-0 bg-transparent px-1 tabular-nums hover:bg-black/5" onClick={() => zoomCenter(1 / s)} title="Zoom to 100% (Shift 0)">
          {Math.round(s * 100)}%
        </button>
        <button type="button" className="h-7 w-7 cursor-pointer rounded-md border-0 bg-transparent hover:bg-black/5" onClick={() => zoomCenter(1.5)} aria-label="Zoom in" title="Zoom in (⌘ +)">+</button>
      </div>
      {children}
    </div>
  )
}
