import { useMemo, useState, type ReactNode } from 'react'
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

  return (
    <div className="grid gap-10 pb-16">
      {/* Brief: plain text */}
      <header className="grid max-w-[68ch] gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-sun">DAY {n} / 30</span>
          <span className="chip">Week {day.week + 1} · {WEEKS[day.week]}</span>
          {isToday ? <span className="chip bg-pink">Today</span> : <Link to="/today" className="chip no-underline text-ink hover:bg-sun">← Back to today</Link>}
        </div>
        <h1 className="text-4xl sm:text-5xl">{day.title}</h1>
        <p className="text-[17px]">{day.brief}</p>
      </header>

      {/* The challenge: a design-tool canvas, full width */}
      <section id="challenge" className="scroll-mt-16" aria-label={`The challenge: Day ${n} design`}>
        <div className="relative rounded-xl border border-[#e4ded4] bg-[#f6f1ea] lg:min-h-[860px]">
          <Desk toolbar={(api) => <CanvasBar day={day} api={api} hidden={hidden} setHidden={setHidden} adding={adding} setAdding={setAdding} wide={wide} />}>
            <FloatWin id="remix" title="remix it" width="380px">
              <RemixSteps day={day} topCrit={topCrit} onSeeCrits={() => setHidden(false)} />
            </FloatWin>
            <FloatWin id="steam" title="steam room" width="330px" bodyClass="p-4 grid gap-3">
              <div className="grid grid-cols-[auto_1fr] items-start gap-3">
                <span className="grid h-11 w-11 place-items-center border-2 border-ink bg-sun font-display text-2xl font-extrabold" aria-hidden="true">!</span>
                <div>
                  <h3 className="text-[22px]">Ghosted again?</h3>
                  <p className="text-[15px]">Rejected after round 3? Smash something.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" className="btn" onClick={() => navigate('/steam-room')}>Break stuff</button>
              </div>
            </FloatWin>
          </Desk>

          <div className="grid gap-4 px-4 pb-10 pt-6 sm:px-8 lg:pr-[420px]">
            <SectionLabel n={String(n)} text={day.title} />
            <SectionLabel n={`${n}a`} text="Desktop · as posted" small />
            <BrowserFrame>
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
            </BrowserFrame>
            <p className="text-[13px] text-[#6f675c]">Drag stickies to the spot they're about. +1 the ones you'd fix first.</p>
          </div>
        </div>
      </section>

      <Comments
        comments={comments}
        likedIds={liked}
        onLike={(id) => setLiked((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]))}
        onAdd={(t) => setMyComments((c) => [me(t), ...c])}
        onReply={(pid, t) => setMyReplies((r) => ({ ...r, [pid]: [...(r[pid] ?? []), me(t)] }))}
      />
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

function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-visible rounded-xl bg-white shadow-[0_12px_40px_rgba(60,40,10,0.12)]">
      <div className="flex items-center gap-1.5 rounded-t-xl border-b border-[#eee] bg-[#f3f3f3] px-3 py-2.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#d6d6d6]" /><span className="h-2.5 w-2.5 rounded-full bg-[#d6d6d6]" /><span className="h-2.5 w-2.5 rounded-full bg-[#d6d6d6]" />
      </div>
      <div className="overflow-visible rounded-b-xl">{children}</div>
    </div>
  )
}
