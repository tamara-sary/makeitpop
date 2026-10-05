import { Link } from 'react-router-dom'
import { DAYS, TODAY, WEEKS } from '../data/days'

export default function Archive() {
  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <h1 className="text-4xl sm:text-5xl">The 30-day challenge</h1>
        <p className="max-w-[60ch] text-[17px]">One design a day, four themes. Missed one? Every past day stays open for stickies and remixes.</p>
      </header>
      {WEEKS.map((w, wi) => (
        <section key={w} className="grid gap-3" aria-labelledby={`wk-${wi}`}>
          <h2 id={`wk-${wi}`} className="text-2xl">Week {wi + 1} · {w}</h2>
          <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-4 lg:grid-cols-7">
            {DAYS.filter((d) => d.week === wi).map((d) => {
              const open = d.n <= TODAY
              const today = d.n === TODAY
              const inner = (
                <>
                  <span className="font-pixel text-[12px]">DAY {String(d.n).padStart(2, '0')}</span>
                  <span className="text-[14px] font-semibold leading-snug">{open ? d.title : 'Locked'}</span>
                  {!open && <span className="text-[12px] text-muted">Opens in {d.n - TODAY} day{d.n - TODAY > 1 ? 's' : ''}</span>}
                  {today && <span className="chip w-fit bg-pink">Today</span>}
                </>
              )
              const base = 'grid h-full min-h-32 content-start gap-2 border-2 border-ink p-3 no-underline text-ink'
              return (
                <li key={d.n}>
                  {open ? (
                    <Link to={today ? '/today' : `/day/${d.n}`} className={`${base} ${today ? 'bg-sun' : 'bg-paper'} shadow-[4px_4px_0_#161616] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5`}>{inner}</Link>
                  ) : (
                    <div className={`${base} border-dashed bg-cream/60`} aria-disabled="true">{inner}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
