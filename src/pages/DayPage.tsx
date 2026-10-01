import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { DesignPreview } from '../components/DesignPreview'
import { CritForm, CritList } from '../components/Crits'
import { RemixSteps } from '../components/RemixKit'
import { Desk, FloatWin, useOpenWin } from '../components/Desk'
import { Logo, Win } from '../components/ui'
import { SAMPLE_CRITS, TODAY, WEEKS, dayByN, type Crit, type Day } from '../data/days'
import { useStored } from '../lib/store'

export default function DayPage() {
  const params = useParams()
  const n = params.n ? Number(params.n) : TODAY
  const day = dayByN(n)

  const [mine, setMine] = useStored<Crit[]>(`crits:${n}`, [])
  const [agrees, setAgrees] = useStored<Record<string, number>>(`agrees:${n}`, {})

  const crits = useMemo(
    () =>
      [...mine, ...(SAMPLE_CRITS[n] ?? [])]
        .map((c) => ({ ...c, agrees: c.agrees + (agrees[c.id] ?? 0) }))
        .sort((a, b) => b.agrees - a.agrees),
    [mine, agrees, n],
  )

  if (!day || n > TODAY) return <Navigate to="/archive" replace />
  const isToday = n === TODAY

  const main = (
    <Win title={`day-${String(n).padStart(2, '0')}.fig`} bodyClass="p-4 sm:p-6 grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip bg-sun">DAY {n} / 30</span>
        <span className="chip">Week {day.week + 1} · {WEEKS[day.week]}</span>
        {isToday && <span className="chip bg-pink">Today</span>}
      </div>
      <h1 className="text-3xl sm:text-[44px]">{day.title}</h1>
      <p className="max-w-[62ch] text-[16px]">{day.brief}</p>
      <DesignPreview day={day} />
    </Win>
  )

  return (
    <div className="grid gap-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <Logo size={44} />
          <p className="text-[17px] font-semibold">Critique it. Remix it. Make it pop.</p>
        </div>
        {!isToday && <Link to="/" className="btn btn-ghost btn-sm">← Back to today</Link>}
      </div>

      <Desk main={main}>
        <Windows
          day={day}
          crits={crits}
          onAgree={(id) => setAgrees((a) => ({ ...a, [id]: (a[id] ?? 0) + 1 }))}
          onAdd={(c) => setMine((m) => [{ ...c, id: 'u' + Date.now(), agrees: 0 }, ...m])}
        />
      </Desk>
    </div>
  )
}

// Rendered inside <Desk> so it can open/focus windows.
function Windows({ day, crits, onAgree, onAdd }: { day: Day; crits: Crit[]; onAgree: (id: string) => void; onAdd: (c: Omit<Crit, 'id' | 'agrees'>) => void }) {
  const openWin = useOpenWin()
  const navigate = useNavigate()
  const [writing, setWriting] = useState(false)

  return (
    <>
      <FloatWin id="remix" title="remix it">
        <RemixSteps day={day} topCrit={crits[0]} onSeeCrits={() => openWin('crits')} />
      </FloatWin>

      <FloatWin id="crits" title={`crits (${crits.length})`} width={620} bodyClass="p-4 grid gap-4">
        {writing ? (
          <CritForm onAdd={(c) => { onAdd(c); setWriting(false) }} />
        ) : (
          <button type="button" className="btn w-full" onClick={() => setWriting(true)}>Leave a crit</button>
        )}
        <CritList crits={crits} onAgree={onAgree} />
      </FloatWin>

      <FloatWin id="steam" title="steam room" width={340} bodyClass="p-4 grid gap-3">
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
    </>
  )
}
