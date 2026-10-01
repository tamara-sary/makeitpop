import { useMemo } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { DesignPreview } from '../components/DesignPreview'
import { CritForm, CritList } from '../components/Crits'
import { RemixKit } from '../components/RemixKit'
import { Logo, Win } from '../components/ui'
import { SAMPLE_CRITS, TODAY, WEEKS, dayByN, type Crit } from '../data/days'
import { useStored } from '../lib/store'

export default function DayPage() {
  const params = useParams()
  const n = params.n ? Number(params.n) : TODAY
  const day = dayByN(n)
  const navigate = useNavigate()

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

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <Logo size={44} />
          <p className="text-[17px] font-semibold">Critique it. Remix it. Make it pop.</p>
        </div>
        {!isToday && <Link to="/" className="btn btn-ghost btn-sm">← Back to today</Link>}
      </div>

      {/* mobile order: design → remix kit → crits; desktop: kit in the right column */}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Win className="lg:col-start-1 lg:row-start-1" title={`day-${String(n).padStart(2, '0')}.fig`} bodyClass="p-4 sm:p-5 grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip bg-sun">DAY {n} / 30</span>
              <span className="chip">Week {day.week + 1} · {WEEKS[day.week]}</span>
              {isToday && <span className="chip bg-pink">Today</span>}
            </div>
            <h1 className="text-3xl sm:text-4xl">{day.title}</h1>
            <p className="max-w-[62ch] text-[16px]">{day.brief}</p>
            <DesignPreview day={day} />
          </Win>

          <section className="grid gap-4 lg:col-start-1 lg:row-start-2" aria-labelledby="crits-h">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="crits-h" className="text-2xl">Crits <span className="font-sans text-base font-semibold text-muted">({crits.length}, most agreed first)</span></h2>
            </div>
            <CritList crits={crits} onAgree={(id) => setAgrees((a) => ({ ...a, [id]: (a[id] ?? 0) + 1 }))} />
            <CritForm onAdd={(c) => setMine((m) => [{ ...c, id: 'u' + Date.now(), agrees: 0 }, ...m])} />
          </section>

        <aside className="grid gap-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-16">
          <RemixKit day={day} topCrits={crits} />
          <Win title="Steam room" bodyClass="p-4 grid gap-3">
            <div className="grid grid-cols-[auto_1fr] items-start gap-3">
              <span className="grid h-11 w-11 place-items-center border-2 border-ink bg-sun font-display text-2xl font-extrabold" aria-hidden="true">!</span>
              <div>
                <h3 className="text-[22px]">Ghosted again?</h3>
                <p className="text-[15px]">Rejected after round 3? Smash something.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" className="btn btn-ghost" onClick={(e) => (e.currentTarget.closest('section') as HTMLElement).classList.add('opacity-40')}>Not today</button>
              <button type="button" className="btn" onClick={() => navigate('/steam-room')}>Break stuff</button>
            </div>
          </Win>
        </aside>
      </div>
    </div>
  )
}
