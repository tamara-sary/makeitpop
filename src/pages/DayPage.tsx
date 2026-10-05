import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { DesignPreview } from '../components/DesignPreview'
import { RemixSteps, ShareStep } from '../components/RemixKit'
import { Canvas, type CanvasSection, type Focus, type View } from '../components/Canvas'
import { useWide } from '../components/Desk'
import { StickyBoard } from '../components/Stickies'
import { Comments } from '../components/Comments'
import { TitleBar, useToast } from '../components/ui'
import { SAMPLE_COMMENTS, SAMPLE_CRITS, TODAY, WEEKS, dayByN, type Comment, type Crit, type Day } from '../data/days'
import { useStored } from '../lib/store'
import { useProfile } from '../lib/profile'

const DESIGN_W = 1392 // Day 1 export width; the original section is sized to show it at 100%
const STEAM_CARD = { w: 300, h: 92 } // minimised steam room card, pinned bottom-right of the canvas

export default function DayPage() {
  const params = useParams()
  const n = params.n ? Number(params.n) : TODAY
  const day = dayByN(n)
  const wide = useWide()
  const navigate = useNavigate()
  const toast = useToast()
  const [hiddenPref, setHidden] = useState(false)
  const [profile] = useProfile()
  const [adding, setAdding] = useState(false)

  const [mine, setMine] = useStored<Crit[]>(`crits:${n}`, [])
  const [agrees, setAgrees] = useStored<Record<string, number>>(`agrees:${n}`, {})
  const [positions, setPositions] = useStored<Record<string, { x: number; y: number }>>(`sticky-pos:${n}`, {})
  const [myComments, setMyComments] = useStored<Comment[]>(`comments:${n}`, [])
  const [myReplies, setMyReplies] = useStored<Record<string, Comment[]>>(`replies:${n}`, {})
  const [liked, setLiked] = useStored<string[]>(`liked:${n}`, [])
  const [checked, setChecked] = useStored<number[]>(`audit:${n}`, [])
  // First visit to a day opens on the brief; after "Start the audit" it opens straight on the design.
  const [briefSeen, setBriefSeen] = useStored<boolean>(`brief-seen:${n}`, false)
  const [focus, setFocus] = useState<Focus>({ view: briefSeen ? 'original' : 'brief', n: 0 })
  const view = focus.view
  const [steamOpen, setSteamOpen] = useStored<boolean>('steam-open', true)
  // Steam room card floats over the canvas: drag it by its title bar, it remembers where you left it.
  // Stored as distance from the bottom-right corner, so it stays put when the window resizes.
  const [steamPos, setSteamPos] = useStored<{ r: number; b: number } | null>('steam-pos', null)
  const steamDragRef = useRef<{ sx: number; sy: number; r: number; b: number; maxR: number; maxB: number } | null>(null)
  const steamDrag = {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      const card = e.currentTarget.parentElement!.parentElement! // title bar → section → positioned wrapper
      const box = card.offsetParent as HTMLElement
      const pos = steamPos ?? { r: 16, b: 16 }
      steamDragRef.current = { sx: e.clientX, sy: e.clientY, ...pos, maxR: box.clientWidth - card.offsetWidth, maxB: box.clientHeight - card.offsetHeight }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = steamDragRef.current
      if (!d) return
      setSteamPos({ r: Math.min(Math.max(d.r - (e.clientX - d.sx), 0), d.maxR), b: Math.min(Math.max(d.b - (e.clientY - d.sy), 0), d.maxB) })
    },
    onPointerUp: () => { steamDragRef.current = null },
  }

  // Blind audit: other people's crits stay hidden until you've added your own, so they can't anchor you.
  const locked = mine.length === 0
  const hidden = locked || hiddenPref

  const crits = useMemo(
    () => [...(SAMPLE_CRITS[n] ?? []), ...mine].map((c) => ({ ...c, agrees: c.agrees + (agrees[c.id] ?? 0) })),
    [mine, agrees, n],
  )
  const visibleCrits = locked ? [] : crits
  const othersCount = (SAMPLE_CRITS[n] ?? []).length
  const topCrit = useMemo(() => [...crits].sort((a, b) => b.agrees - a.agrees)[0], [crits])
  const comments = useMemo(
    () => [...myComments, ...(SAMPLE_COMMENTS[n] ?? [])].map((c) => ({ ...c, replies: [...c.replies, ...(myReplies[c.id] ?? [])] })),
    [myComments, myReplies, n],
  )

  if (!day || n > TODAY) return <Navigate to="/archive" replace />
  const isToday = n === TODAY
  const me = (text: string): Comment => ({ id: 'u' + Date.now(), name: profile?.name ?? 'You', level: profile?.level ?? 'Mid', text, at: Date.now(), likes: 0, replies: [] })
  const setView = (v: View) => {
    if (v !== 'brief') setBriefSeen(true)
    setFocus((f) => ({ view: v, n: f.n + 1 }))
  }

  const stickies = (
    <StickyBoard
      crits={visibleCrits}
      wide={wide}
      hidden={hidden}
      hideDraft={hiddenPref}
      adding={adding}
      setAdding={setAdding}
      positions={positions}
      onMove={(id, x, y) => setPositions((p) => ({ ...p, [id]: { x, y } }))}
      onAgree={(id) => setAgrees((a) => ({ ...a, [id]: (a[id] ?? 0) + 1 }))}
      onAdd={(text, color, x, y) => {
        setMine((m) => [...m, { id: 'u' + Date.now(), name: profile?.name ?? 'You', level: profile?.level ?? 'Mid', tag: 'Other', text, agrees: 0, color, x, y }])
        toast(locked ? `Stuck! ${othersCount} stickies unlocked. Did they see what you saw?` : 'Stuck! Drag it to the right spot.')
      }}
    >
      <DesignPreview day={day} live={wide} />
    </StickyBoard>
  )

  const brief = (
    <Brief day={day} isToday={isToday} checked={checked}
      onCheck={(i) => setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))}
      onStart={() => { setView('original'); if (!wide) document.getElementById('challenge-m')?.scrollIntoView({ behavior: 'smooth' }) }} started={briefSeen} />
  )
  const remix = <RemixSteps day={day} topCrit={topCrit} locked={locked} />
  const share = <ShareStep day={day} />

  const steam = (
    <section className="win w-[300px]" aria-label="Steam room">
      <TitleBar title="steam room" onClose={() => setSteamOpen(false)} {...(wide ? steamDrag : {})} className={wide ? 'drag' : ''} />
      <div className="flex items-center gap-3 p-3">
        <span className="grid h-9 w-9 flex-none place-items-center border-2 border-ink bg-sun font-display text-xl font-extrabold" aria-hidden="true">!</span>
        <strong className="flex-1 whitespace-nowrap font-display text-[17px] leading-tight">Ghosted again?</strong>
        <button type="button" className="btn btn-sm" onClick={() => navigate('/steam-room')}>Break stuff</button>
      </div>
    </section>
  )

  // Comments discuss the crits, so they follow the same blind-audit rule.
  const commentsBlock = locked ? (
    <div className="grid justify-items-start gap-2 border-2 border-dashed border-ink/40 p-6">
      <h2 className="text-[24px]">Discussion</h2>
      <p className="text-muted">{comments.length} comments, hidden until you add your sticky. Audit first, so you see the design with fresh eyes.</p>
    </div>
  ) : (
    <Comments
      comments={comments}
      likedIds={liked}
      onLike={(id) => setLiked((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]))}
      onAdd={(t) => setMyComments((c) => [me(t), ...c])}
      onReply={(pid, t) => setMyReplies((r) => ({ ...r, [pid]: [...(r[pid] ?? []), me(t)] }))}
    />
  )

  // Phones: no canvas. Brief, design, remix and share stack in reading order.
  if (!wide) {
    return (
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 px-4 py-6">
        <div className="border-2 border-ink bg-cream p-5">{brief}</div>
        <section id="challenge-m" aria-label={`The challenge: Day ${n} design`} className="grid scroll-mt-20 gap-3">
          <CritLock locked={locked} count={othersCount} hidden={hiddenPref} setHidden={setHidden} onAdd={() => setAdding(true)} hasDraft={adding} />
          {stickies}
        </section>
        <div className="border-2 border-ink bg-cream p-5">{remix}</div>
        <div className="border-2 border-ink bg-cream p-5">{share}</div>
        {steamOpen && steam}
        {commentsBlock}
      </div>
    )
  }

  const sections: CanvasSection[] = [
    { id: 'brief', n: String(n), name: 'The brief', width: 560, children: brief },
    {
      id: 'original', n: `${n}a`, name: 'Original · as posted', width: DESIGN_W + 52, tone: 'neutral', children: stickies,
      // Option D: the brief's one-line job rides on the design's tab, so it's never more than a glance away
      tabExtra: day.handoff && (
        <button type="button" onClick={() => setView('brief')} title="Open the brief"
          className="max-w-[60vw] cursor-pointer truncate border-0 bg-transparent p-0 text-left text-[13px] font-semibold text-[#5e5850] underline decoration-dotted underline-offset-2 hover:text-ink">
          {day.handoff.job}
        </button>
      ),
    },
    { id: 'remix', n: `${n}b`, name: 'Your remix', width: 620, children: remix },
    { id: 'share', n: `${n}c`, name: 'Share', width: 520, children: share },
  ]

  return (
    <div className="grid min-w-0 gap-10">
      <section id="challenge" aria-label={`The challenge: Day ${n} design`}
        className="flex h-[calc(100dvh-49px)] min-h-[560px] min-w-0 flex-col border-b border-[#e4ded4] bg-[#f3eee6]">
        <CanvasBar day={day} view={view} setView={setView} locked={locked} count={othersCount} hidden={hiddenPref} setHidden={setHidden}
          adding={adding} setAdding={(v) => { if (v && view !== 'original') setView('original'); setAdding(v) }} steamOpen={steamOpen} setSteamOpen={setSteamOpen} />
        <Canvas focus={focus} onFocus={setView} sections={sections} avoid={steamOpen && !steamPos ? STEAM_CARD : undefined}>
          {steamOpen && <div className="absolute z-30" style={{ right: steamPos?.r ?? 16, bottom: steamPos?.b ?? 16 }}>{steam}</div>}
        </Canvas>
      </section>
      <div id="discussion" className="mx-auto w-full max-w-7xl scroll-mt-16 px-4">{commentsBlock}</div>
    </div>
  )

}

/* ---------- the brief, written like a design handoff ---------- */

function Brief({ day, isToday, checked, onCheck, onStart, started }: {
  day: Day; isToday: boolean; checked: number[]; onCheck: (i: number) => void; onStart: () => void; started: boolean
}) {
  const h = day.handoff
  const person = h?.who.split(',')[0]
  const row = (label: string, text: string) => (
    <div className="grid grid-cols-[72px_1fr] gap-3">
      <span className="pt-1 font-pixel text-[12px]">{label}</span>
      <p className="text-[18px] leading-snug">{text}</p>
    </div>
  )
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="chip bg-sun">DAY {day.n} / 30</span>
        <span className="chip">Week {day.week + 1} · {WEEKS[day.week]}</span>
        {isToday ? <span className="chip bg-pink">Today</span> : <Link to="/today" className="chip no-underline text-ink hover:bg-sun">← Today</Link>}
      </div>
      <h1 className="text-[34px] leading-tight">{day.title}</h1>
      {h ? (
        <>
          <div className="grid gap-3">
            {row('WHO', h.who)}
            {row('WHEN', h.when)}
          </div>
          <fieldset className="m-0 grid gap-2 border-2 border-ink bg-paper p-4">
            <legend className="bg-ink px-2 py-0.5 font-pixel text-[12px] text-cream">AUDIT IT</legend>
            <p className="text-[16px] font-semibold">Can {person} answer each one in 5 seconds?</p>
            {h.questions.map((q, i) => (
              <label key={q} className="flex cursor-pointer items-center gap-3 text-[18px]">
                <input type="checkbox" className="h-5 w-5 accent-[#161616]" checked={checked.includes(i)} onChange={() => onCheck(i)} />
                {q}
              </label>
            ))}
          </fieldset>
          {row('FAILS IF', h.failsIf)}
          <div className="flex flex-wrap gap-1.5">{h.notes.map((t) => <span key={t} className="chip">{t}</span>)}</div>
        </>
      ) : (
        <p className="text-[18px]">{day.brief}</p>
      )}
      <div>
        <button type="button" className="btn" onClick={onStart}>{started ? 'Back to the design →' : 'Start the audit →'}</button>
      </div>
    </div>
  )
}

/* ---------- crit lock: blind audit ---------- */

function LockIcon() {
  return <svg width="12" height="13" viewBox="0 0 12 14" aria-hidden="true"><rect x="1" y="6" width="10" height="7" fill="currentColor" /><path d="M3 6V4a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
}

function CritLock({ locked, count, hidden, setHidden, onAdd, hasDraft }: { locked: boolean; count: number; hidden: boolean; setHidden: (v: boolean) => void; onAdd: () => void; hasDraft: boolean }) {
  const toast = useToast()
  const toggle = () => {
    // Only nothing-to-hide when the screen really is empty: no unlocked stickies and no sticky you're still writing
    if (locked && !hasDraft) toast(`Nothing to hide yet: the ${count} stickies stay hidden until you add yours.`)
    setHidden(!hidden)
  }
  // Shift+C toggles stickies, so you can flip between "clean screen" and "what others saw" while zoomed in
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.shiftKey && e.code === 'KeyC' && !/^(INPUT|TEXTAREA)$/.test(t.tagName)) { e.preventDefault(); toggle() }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })
  // Hide is always in the same place; the lock is a separate, clearly-labelled way to unlock (it starts a sticky).
  return (
    <>
      <button type="button" aria-pressed={hidden} onClick={toggle} title="Show / hide all stickies (Shift C)"
        className={'flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border-0 px-2.5 py-1.5 text-[13px] font-semibold ' + (hidden ? 'bg-[#3b6ef5] text-white' : 'bg-transparent text-[#2b2b2b] hover:bg-black/5')}>
        <EyeIcon off={!hidden} />{hidden ? 'Show stickies' : 'Hide stickies'}
      </button>
      {locked && (
        <button type="button" onClick={onAdd} title="Other people's stickies stay hidden until you add your own, so they don't bias your audit"
          className="flex w-fit cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border-0 bg-transparent px-2.5 py-1.5 text-[13px] font-semibold text-[#5e5850] hover:bg-black/5">
          <LockIcon />Add yours to unlock {count}
        </button>
      )}
    </>
  )
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 8s2.6-5 7-5 7 5 7 5-2.6 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2.2" />
      {off && <path d="M2 14L14 2" />}
    </svg>
  )
}

/* ---------- canvas top bar (design-tool look, neutral so the challenge reads as "not our UI") ---------- */

const SECTION_TABS: { id: View; label: string }[] = [
  { id: 'brief', label: 'Brief' },
  { id: 'original', label: 'Original' },
  { id: 'remix', label: 'Remix' },
  { id: 'share', label: 'Share' },
  { id: 'all', label: 'Fit all' },
]

function CanvasBar({ day, view, setView, locked, count, hidden, setHidden, adding, setAdding, steamOpen, setSteamOpen }: {
  day: Day; view: View; setView: (v: View) => void; locked: boolean; count: number; hidden: boolean; setHidden: (v: boolean) => void
  adding: boolean; setAdding: (v: boolean) => void; steamOpen: boolean; setSteamOpen: (v: boolean) => void
}) {
  const seg = (on: boolean) =>
    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-semibold cursor-pointer border-0 whitespace-nowrap ' + (on ? 'bg-[#3b6ef5] text-white' : 'bg-transparent text-[#2b2b2b] hover:bg-black/5')
  const group = 'flex rounded-lg border border-[#e4ded4] bg-[#f7f5f2] p-0.5'
  return (
    <div className="relative z-30 flex items-center gap-3 border-b border-[#e4ded4] bg-white px-4 py-2 text-[#2b2b2b]">
      <strong className="min-w-0 flex-1 truncate text-[14px]">Day {day.n} · {day.title}</strong>
      <nav className={group} aria-label="Canvas sections">
        {SECTION_TABS.map((t) => (
          <button key={t.id} type="button" className={seg(view === t.id)} aria-pressed={view === t.id} onClick={() => setView(t.id)}>{t.label}</button>
        ))}
      </nav>
      <div className={group} role="group" aria-label="Canvas tools">
        <button type="button" className={seg(!adding)} aria-pressed={!adding} onClick={() => setAdding(false)}>
          <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 1l5 13 2-5 5-2z" fill="currentColor" /></svg>Move
        </button>
        <button type="button" className={seg(adding)} aria-pressed={adding} onClick={() => { setHidden(false); setAdding(true) }}>
          <span className="grid h-4 w-4 place-items-center rounded-full rounded-tl-none border-[1.5px] border-current text-[12px] font-extrabold leading-none" aria-hidden="true">+</span>Add sticky
        </button>
        <CritLock locked={locked} count={count} hidden={hidden} setHidden={setHidden} onAdd={() => setAdding(true)} hasDraft={adding} />
      </div>
      {!steamOpen && (
        <button type="button" className={seg(false)} onClick={() => setSteamOpen(true)}>Steam room</button>
      )}
      {/* Scrolling over the canvas pans it (Figma behaviour), so the discussion below needs its own way in */}
      <button type="button" className={seg(false)} onClick={() => document.getElementById('discussion')?.scrollIntoView({ behavior: 'smooth' })}>Discussion ↓</button>
    </div>
  )
}
