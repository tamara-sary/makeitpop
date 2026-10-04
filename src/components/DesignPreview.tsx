import type { Day } from '../data/days'

// Shows the day's design. Uses a real screenshot when one exists in /public/days,
// a built-in mock for day 4, and a placeholder otherwise.
export function DesignPreview({ day }: { day: Day }) {
  if (day.preview) {
    return <img src={day.preview} alt={`Day ${day.n} design: ${day.title}`} className="block w-full drop-shadow-[0_12px_30px_rgba(60,40,10,0.14)]" draggable={false} />
  }
  if (day.n === 4) return <FunnelMock />
  return (
    <div className="grid aspect-[16/9] place-items-center border-2 border-dashed border-ink/40 bg-white p-6 text-center">
      <div className="grid gap-2">
        <span className="font-pixel text-[12px]">FRAME_{String(day.n).padStart(3, '0')}</span>
        <p className="font-display text-2xl font-extrabold">Preview drops with the kit</p>
        <p className="text-muted">Add a screenshot at /public/days/day-{String(day.n).padStart(2, '0')}.png</p>
      </div>
    </div>
  )
}

// Day 4 sample: a deliberately "fine but flat" dashboard, so there's something to critique.
function FunnelMock() {
  const steps = [
    { label: 'Visited', v: 12400 },
    { label: 'Started signup', v: 4100 },
    { label: 'Verified email', v: 2650 },
    { label: 'Created project', v: 1032 },
    { label: 'Invited team', v: 610 },
    { label: 'Active wk 1', v: 392 },
  ]
  const max = steps[0].v
  return (
    <div className="grid aspect-[16/9] grid-rows-[auto_auto_1fr] gap-[2.2%] bg-[#f7f7f9] p-[3%] text-[#2b2b33]" role="img" aria-label="Sample analytics dashboard with a signup funnel and three KPI cards">
      <div className="flex items-center justify-between text-[13px]">
        <strong className="text-[15px]">Growth overview</strong>
        <span className="rounded bg-white px-2 py-1 shadow-sm">Last 30 days ▾</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[['Visitors', '12.4k'], ['Signups', '1,032'], ['Retained', '38%']].map(([k, v]) => (
          <div key={k} className="rounded bg-white p-3 shadow-sm">
            <div className="text-[12px] text-[#6b6b78]">{k}</div>
            <div className="text-xl font-bold">{v}</div>
          </div>
        ))}
      </div>
      <div className="flex min-h-0 flex-col rounded bg-white p-3 shadow-sm">
        <div className="mb-2 text-[12px] text-[#6b6b78]">Signup funnel</div>
        <div className="flex min-h-0 flex-1 items-end gap-3">
          {steps.map((s, i) => (
            <div key={s.label} className="flex h-full flex-1 flex-col justify-end">
              <div className="w-full rounded-t" style={{ height: `${(s.v / max) * 100}%`, background: i === 3 ? '#7b8cff' : '#c9cdf5' }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-2 text-[10px] text-[#6b6b78]">
          {steps.map((s) => <span key={s.label} className="flex-1 truncate text-center">{s.label}</span>)}
        </div>
      </div>
    </div>
  )
}
