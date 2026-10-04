import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { DesignPreview } from '../components/DesignPreview'
import { RemixSteps } from '../components/RemixKit'
import { Desk, FloatWin, useWide, type DeskApi } from '../components/Desk'
import { StickyBoard } from '../components/Stickies'
import { Comments } from '../components/Comments'
import { useToast } from '../components/ui'
import { SAMPLE_COMMENTS, SAMPLE_CRITS, TODAY, WEEKS, dayByN, type Comment, type Crit, type Day } from '../data/days'
import { useStored } from '../lib/store'

export default function DayPage() {
  const params = useParams()
  const n = params.n ? Number(params.n) : TODAY
  const day = dayByN(n)
  const wide = useWide()
  const navigate = useNavigate()
  const toast = useToast()
  const [hidden, setHidden] = useState(false)
  const [adding, setAdding] = useState(false)

  const [mine, setMine] = useStored<Crit[]>(`crits:${n}`, [])
  const [agrees, setAgrees] = useStored<Record<string, number>>(`agrees:${n}`, {})
  const [positions, setPositions] = useStored<Record<string, { x: number; y: number }>>(`sticky-pos:${n}`, {})
  const [myComments, setMyComments] = useStored<Comment[]>(`comments:${n}`, [])
  const [myReplies, setMyReplies] = useStored<Record<string, Comment[]>>(`replies:${n}`, {})
  const [liked, setLiked] = useStored<string[]>(`liked:${n}`, [])

  const crits = useMemo(
    () => [...(SAMPLE_CRITS[n] ?? []), ...mine].map((c) => ({ ...c, agrees: c.agrees + (agrees[c.id] ?? 0) })),
    [mine, agrees, n],
  )
  const topCrit = useMemo(() => [...crits].sort((a, b) => b.agrees - a.agrees)[0], [crits])
  const comments = useMemo(
    () => [...myComments, ...(SAMPLE_COMMENTS[n] ?? [])].map((c) => ({ ...c, replies: [...c.replies, ...(myReplies[c.id] ?? [])] })),
    [myComments, myReplies, n],
  )

  if (!day || n > TODAY) return <Navigate to="/archive" replace />
  const isToday = n === TODAY
  const me = (text: string): Comment => ({ id: 'u' + Date.now(), name: 'You', level: 'Mid', text, at: Date.now(), likes: 0, replies: [] })

  const brief = (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="chip bg-sun">DAY {n} / 30</span>
        <span className="chip">Week {day.week + 1} · {WEEKS[day.week]}</span>
        {isToday ? <span className="chip bg-pink">Today</span> : <Link to="/today" className="chip no-underline text-ink hover:bg-sun">← Today</Link>}
      </div>
      <h1 className="text-[24px] leading-tight">{day.title}</h1>
      <p className="text-[15px]">{day.brief}</p>
    </div>
  )

  const stickies = (
    <StickyBoard
      crits={crits}
      wide={wide}
      hidden={hidden}
      adding={adding}
      setAdding={setAdding}
      positions={positions}
      onMove={(id, x, y) => setPositions((p) => ({ ...p, [id]: { x, y } }))}
      onAgree={(id) => setAgrees((a) => ({ ...a, [id]: (a[id] ?? 0) + 1 }))}
      onAdd={(text, color, x, y) => {
        setMine((m) => [...m, { id: 'u' + Date.now(), name: 'You', level: 'Mid', tag: 'Other', text, agrees: 0, color, x, y }])
        toast('Stuck! Drag it to the right spot.')
      }}
    >
      <DesignPreview day={day} />
    </StickyBoard>
  )

  return (
    <div className="grid min-w-0 gap-10">
      {/* Phones: brief as plain text above the challenge */}
      {!wide && <header className="px-4 pt-6">{brief}</header>}

      {/* The editor: takes the whole screen. Brief, Remix it and Steam room float as draggable windows around the challenge. */}
      <section id="challenge" aria-label={`The challenge: Day ${n} design`}
        className={'flex min-w-0 flex-col bg-[#f6f1ea] ' + (wide ? 'h-[calc(100dvh-49px)] min-h-[560px] border-b border-[#e4ded4]' : '')}>
        <Desk
          toolbar={(api) => <CanvasBar day={day} api={api} hidden={hidden} setHidden={setHidden} adding={adding} setAdding={setAdding} wide={wide} />}
          stage={wide ? <Stage n={n}>{stickies}</Stage> : <div className="grid gap-3 px-4 py-6">{stickies}</div>}
        >
          {wide && (
            <FloatWin id="brief" title="the brief" width={WIN_W} maxH="calc(100dvh - 360px)">
              {brief}
            </FloatWin>
          )}
          <FloatWin id="remix" title="remix it" width={WIN_W}>
            <RemixSteps day={day} topCrit={topCrit} onSeeCrits={() => setHidden(false)} />
          </FloatWin>
          <FloatWin id="steam" title="steam room" width={WIN_W} bodyClass="p-4 grid gap-3">
            <div className="grid grid-cols-[auto_1fr] items-start gap-3">
              <span className="grid h-11 w-11 place-items-center border-2 border-ink bg-sun font-display text-2xl font-extrabold" aria-hidden="true">!</span>
              <div>
                <h3 className="text-[20px]">Ghosted again?</h3>
                <p className="text-[14px]">Rejected after round 3? Smash something.</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" className="btn" onClick={() => navigate('/steam-room')}>Break stuff</button>
            </div>
          </FloatWin>
        </Desk>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4">
        <Comments
          comments={comments}
          likedIds={liked}
          onLike={(id) => setLiked((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]))}
          onAdd={(t) => setMyComments((c) => [me(t), ...c])}
          onReply={(pid, t) => setMyReplies((r) => ({ ...r, [pid]: [...(r[pid] ?? []), me(t)] }))}
        />
      </div>
    </div>
  )
}

// Floating windows narrow on smaller laptops so the challenge keeps the middle of the screen.
const WIN_W = 'clamp(240px, 19vw, 300px)'
const DESIGN_RATIO = 1392 / 988 // Day 1 preview; good enough for other days until they get their own

// The challenge, scaled to fit the space between the windows: never wider or taller than the screen.
function Stage({ n, children }: { n: number; children: ReactNode }) {
  const area = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = area.current
    if (!el) return
    const fit = () => setW(Math.floor(Math.min(el.clientWidth, el.clientHeight * DESIGN_RATIO)))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 py-4" style={{ paddingInline: `calc(${WIN_W} + 32px)` }}>
      <div className="mx-auto flex w-full items-center justify-between gap-3" style={{ maxWidth: w || undefined }}>
        <SectionLabel n={`${n}a`} text="Desktop · as posted" small />
        <span className="hidden truncate text-[12px] text-[#6f675c] xl:inline">Drag stickies onto the spot. +1 what you'd fix first.</span>
      </div>
      <div ref={area} className="flex min-h-0 flex-1 items-start justify-center">
        <div style={{ width: w || '100%' }}>{children}</div>
      </div>
    </div>
  )
}

/* ---------- canvas pieces (design-tool look, neutral so the challenge reads as "not our UI") ---------- */

function CanvasBar({ day, api, hidden, setHidden, adding, setAdding, wide }: {
  day: Day; api: DeskApi; hidden: boolean; setHidden: (v: boolean) => void; adding: boolean; setAdding: (v: boolean) => void; wide: boolean
}) {
  const seg = (on: boolean) =>
    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-semibold cursor-pointer border-0 ' + (on ? 'bg-[#3b6ef5] text-white' : 'bg-transparent text-[#2b2b2b] hover:bg-black/5')
  return (
    <div className="relative z-30 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-t-xl border-b border-[#e4ded4] bg-white px-3 py-2 text-[#2b2b2b] sm:px-4">
      <strong className="mr-auto truncate text-[14px]">Day {day.n} · {day.title}</strong>
      <span className="hidden text-[13px] text-[#6f675c] sm:inline">100%</span>
      <div className="flex rounded-lg border border-[#e4ded4] bg-[#f7f5f2] p-0.5" role="group" aria-label="Canvas tools">
        <button type="button" className={seg(!adding)} aria-pressed={!adding} onClick={() => setAdding(false)}>
          <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 1l5 13 2-5 5-2z" fill="currentColor" /></svg>Move
        </button>
        <button type="button" className={seg(adding)} aria-pressed={adding} onClick={() => { setHidden(false); setAdding(true) }}>
          <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2h12v8l-4 4H2z" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>Add sticky
        </button>
        <button type="button" className={seg(hidden)} aria-pressed={hidden} onClick={() => setHidden(!hidden)}>
          {hidden ? 'Show stickies' : 'Hide stickies'}
        </button>
      </div>
      {wide && (
        <button type="button" className={seg(api.isOpen('steam'))} aria-pressed={api.isOpen('steam')} onClick={() => api.toggle('steam')}>Steam room</button>
      )}
      {wide && (
        <button type="button" onClick={() => api.toggle('remix')} aria-pressed={api.isOpen('remix')}
          className="cursor-pointer rounded-md border-0 bg-[#1f1f1f] px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-black">
          {api.isOpen('remix') ? 'Hide remix' : 'Remix it'}
        </button>
      )}
    </div>
  )
}

function SectionLabel({ n, text, small }: { n: string; text: string; small?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[#2b2b2b]">
      <span className={(small ? 'bg-[#ebe4d9] text-[#2b2b2b]' : 'bg-[#1f1f1f] text-white') + ' rounded px-1.5 py-0.5 text-[12px] font-bold'}>{n}</span>
      <span className={small ? 'text-[13px] text-[#6f675c]' : 'text-[15px] font-semibold'}>{text}</span>
    </div>
  )
}
