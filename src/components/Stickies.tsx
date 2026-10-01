import { useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from 'react'
import type { Crit, StickyColor } from '../data/days'

// Crit stickies pinned on the challenge screen. Drag to move, +1 to agree.
// Our own sticky style (ink border, tape strip, hard shadow, tilt): a sticky note is a generic
// idea, so we keep the concept but never FigJam's exact look.

export const STICKY_BG: Record<StickyColor, string> = {
  sun: '#ffe14d',
  mint: '#8fe3c1',
  pink: '#ff9fd4',
  sky: '#a9d8ff',
}
const TILT = [-2.5, 1.8, -1, 2.4, -1.8, 1]

export function Sticky({ crit, i, onAgree, style, className = '', children, onPointerDown, big = false }: {
  crit: Crit; i: number; big?: boolean; onAgree?: () => void; style?: CSSProperties; className?: string; children?: ReactNode
  onPointerDown?: (e: RPointerEvent<HTMLDivElement>) => void
}) {
  return (
    <div
      className={(className.includes('absolute') ? '' : 'relative ') + 'grid gap-2 border-2 border-ink p-3 pt-4 text-ink shadow-[4px_4px_0_#161616] ' + (className.includes('w-[') ? '' : 'w-[200px] ') + className}
      style={{ background: STICKY_BG[crit.color ?? 'sun'], transform: `rotate(${TILT[i % TILT.length]}deg)`, ...style }}
      onPointerDown={onPointerDown}
    >
      <span className="absolute -top-2.5 left-1/2 h-4 w-14 -translate-x-1/2 -rotate-2 border border-ink/30 bg-white/70" aria-hidden="true" />
      {children ?? (
        <>
          <p className={(big ? 'font-display text-[21px] font-extrabold leading-tight' : 'text-[14px] font-medium leading-snug')}>{crit.text}</p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-pixel text-[10px] leading-tight uppercase">{crit.name} · {crit.level}{crit.sample ? ' · sample' : ''}</span>
            {onAgree && (
              <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={onAgree} className="chip cursor-pointer whitespace-nowrap px-1.5 py-1 hover:bg-paper" aria-label={`Agree with ${crit.name}, ${crit.agrees} agree`}>
                +1 · {crit.agrees}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

type Pos = Record<string, { x: number; y: number }>

export function StickyBoard({ crits, positions, onMove, onAgree, onAdd, wide, children }: {
  crits: Crit[]
  positions: Pos
  onMove: (id: string, x: number, y: number) => void
  onAgree: (id: string) => void
  onAdd: (text: string, color: StickyColor, x: number, y: number) => void
  wide: boolean
  children: ReactNode // the challenge screen
}) {
  const board = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null)
  const [draft, setDraft] = useState<{ color: StickyColor; text: string } | null>(null)
  const [hidden, setHidden] = useState(false)

  const posOf = (c: Crit, i: number) => positions[c.id] ?? { x: c.x ?? 8 + (i % 4) * 22, y: c.y ?? 10 + Math.floor(i / 4) * 30 }

  const down = (id: string, e: RPointerEvent<HTMLDivElement>, x: number, y: number) => {
    if ((e.target as HTMLElement).closest('button, textarea')) return
    drag.current = { id, sx: e.clientX, sy: e.clientY, ox: x, oy: y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current || !board.current) return
    const r = board.current.getBoundingClientRect()
    const nx = drag.current.ox + ((e.clientX - drag.current.sx) / r.width) * 100
    const ny = drag.current.oy + ((e.clientY - drag.current.sy) / r.height) * 100
    onMove(drag.current.id, Math.min(Math.max(nx, -4), 90), Math.min(Math.max(ny, -4), 92))
  }
  const up = () => { drag.current = null }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-pixel text-[11px]">ADD A STICKY</span>
      {(Object.keys(STICKY_BG) as StickyColor[]).map((c) => (
        <button key={c} type="button" aria-label={`Add ${c} sticky`} onClick={() => setDraft({ color: c, text: '' })}
          className="h-7 w-7 cursor-pointer border-2 border-ink shadow-[2px_2px_0_#161616] hover:-translate-y-0.5" style={{ background: STICKY_BG[c] }} />
      ))}
      {wide && (
        <button type="button" className="chip ml-1 cursor-pointer hover:bg-sun" aria-pressed={hidden} onClick={() => setHidden((h) => !h)}>
          {hidden ? 'Show stickies' : 'Hide stickies'}
        </button>
      )}
    </div>
  )

  const draftNote = draft && (
    <Sticky crit={{ id: 'draft', name: 'You', level: 'Mid', tag: '', text: '', agrees: 0, color: draft.color }} i={0}>
      <label className="font-pixel text-[10px]" htmlFor="sticky-draft">YOUR CRIT</label>
      <textarea id="sticky-draft" autoFocus className="min-h-20 w-full resize-none border-0 bg-transparent text-[14px] font-medium outline-none placeholder:text-ink/60"
        placeholder="What's off here, and why?" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
      <div className="flex gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDraft(null)}>Cancel</button>
        <button type="button" className="btn btn-sm bg-paper" disabled={draft.text.trim().length < 5}
          onClick={() => { onAdd(draft.text.trim(), draft.color, 40, 30); setDraft(null) }}>Stick it</button>
      </div>
    </Sticky>
  )

  if (!wide) {
    // Phones: stickies can't sit on a small screen, so they list under it.
    return (
      <div className="grid gap-4">
        {children}
        {toolbar}
        {draftNote}
        <div className="grid justify-items-center gap-5 py-2 sm:grid-cols-2">
          {crits.map((c, i) => <Sticky key={c.id} crit={c} i={i} onAgree={() => onAgree(c.id)} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {toolbar}
      <div ref={board} className="relative" onPointerMove={move} onPointerUp={up}>
        {children}
        {!hidden && crits.map((c, i) => {
          const p = posOf(c, i)
          return (
            <Sticky key={c.id} crit={c} i={i} onAgree={() => onAgree(c.id)}
              className="absolute cursor-grab touch-none select-none active:cursor-grabbing"
              style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: drag.current?.id === c.id ? 30 : 10 + i }}
              onPointerDown={(e) => down(c.id, e, p.x, p.y)} />
          )
        })}
        {draft && <div className="absolute left-[40%] top-[30%] z-40">{draftNote}</div>}
      </div>
      <p className="text-[13px] text-muted">Drag stickies to the spot they're about. +1 the ones you'd fix first.</p>
    </div>
  )
}
