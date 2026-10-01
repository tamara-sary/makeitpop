import { useMemo } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { DesignPreview } from '../components/DesignPreview'
import { RemixSteps } from '../components/RemixKit'
import { Desk, FloatWin, useWide } from '../components/Desk'
import { StickyBoard } from '../components/Stickies'
import { Comments } from '../components/Comments'
import { useToast } from '../components/ui'
import { SAMPLE_COMMENTS, SAMPLE_CRITS, TODAY, WEEKS, dayByN, type Comment, type Crit } from '../data/days'
import { useStored } from '../lib/store'

export default function DayPage() {
  const params = useParams()
  const n = params.n ? Number(params.n) : TODAY
  const day = dayByN(n)
  const wide = useWide()
  const navigate = useNavigate()
  const toast = useToast()

  const [mine, setMine] = useStored<Crit[]>(`crits:${n}`, [])
  const [agrees, setAgrees] = useStored<Record<string, number>>(`agrees:${n}`, {})
  const [positions, setPositions] = useStored<Record<string, { x: number; y: number }>>(`sticky-pos:${n}`, {})
  const [myComments, setMyComments] = useStored<Comment[]>(`comments:${n}`, [])
  const [myReplies, setMyReplies] = useStored<Record<string, Comment[]>>(`replies:${n}`, {})
  const [liked, setLiked] = useStored<string[]>(`liked:${n}`, [])

  const crits = useMemo(
    () =>
      [...(SAMPLE_CRITS[n] ?? []), ...mine]
        .map((c) => ({ ...c, agrees: c.agrees + (agrees[c.id] ?? 0) })),
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
    <div className="grid gap-10 pb-28">
      {!isToday && <Link to="/today" className="btn btn-ghost btn-sm w-fit">← Back to today</Link>}

      {/* Zone 1: our UI, floating windows */}
      <Desk>
        <FloatWin id="brief" title={`day-${String(n).padStart(2, '0')} brief`} width="min(720px, 60%)" bodyClass="p-5 grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-sun">DAY {n} / 30</span>
            <span className="chip">Week {day.week + 1} · {WEEKS[day.week]}</span>
            {isToday && <span className="chip bg-pink">Today</span>}
          </div>
          <h1 className="text-3xl sm:text-[40px]">{day.title}</h1>
          <p className="max-w-[62ch] text-[16px]">{day.brief}</p>
        </FloatWin>

        <FloatWin id="remix" title="remix it" width="380px">
          <RemixSteps day={day} topCrit={topCrit} onSeeCrits={() => document.getElementById('challenge')?.scrollIntoView({ behavior: 'smooth' })} />
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

      {/* Zone 2: the challenge itself, just the screen */}
      <section id="challenge" className="relative left-1/2 grid w-[min(100vw-32px,1600px)] -translate-x-1/2 gap-3 scroll-mt-20" aria-label={`The challenge: Day ${n} design`}>
        <p className="font-pixel text-[12px]">THE CHALLENGE · DAY {n} DESIGN</p>
        <StickyBoard
          crits={crits}
          wide={wide}
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
      </section>

      {/* Zone 3: discussion */}
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
