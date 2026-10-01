import { Link } from 'react-router-dom'
import { Logo, Win } from '../components/ui'
import { Sticky } from '../components/Stickies'
import type { Crit } from '../data/days'

const STACK: Crit[] = [
  { id: 'h1', name: 'Marta', level: 'Senior', tag: '', agrees: 0, color: 'sun', text: 'The drop-off is the story.' },
  { id: 'h2', name: 'Jon', level: 'Mid', tag: '', agrees: 0, color: 'mint', text: '38% of what? Add units.' },
  { id: 'h3', name: 'Priya', level: 'Senior', tag: '', agrees: 0, color: 'pink', text: 'Two CTAs fight. Pick one.' },
]

const HOW = [
  { t: 'Crit it', d: "Every day there's a new design from a 30-day UI challenge. Stick a note on what's off and why.", bg: 'bg-sun' },
  { t: 'Remix it', d: 'Grab the Figma file or the code. Fix what the crits found, in your own tool.', bg: 'bg-mint' },
  { t: 'Post it', d: 'Share your before/after on LinkedIn. Caption with credit is ready to copy.', bg: 'bg-pink' },
]

export default function Home() {
  return (
    <div className="grid gap-20 pb-10">
      {/* Hero */}
      <section className="grid items-center gap-12 pt-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="grid gap-5">
          <Logo size={72} />
          <p className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Critique it. Remix it. Make it pop.</p>
          <p className="max-w-[52ch] text-[18px]">A daily design gym for mid-level and senior product designers who are job-hunting. Sharpen your eye on a real design every day, with people who get it.</p>
        </div>
        <div className="grid justify-items-center gap-10">
          <div className="relative h-[370px] w-[330px]" role="img" aria-label="Three example crit stickies stacked on top of each other">
            {STACK.map((c, i) => (
              <Sticky key={c.id} crit={c} i={i} big className="absolute min-h-[180px] w-[280px] content-between p-5 pt-6" style={{ left: [0, 48, 14][i], top: [0, 88, 176][i], zIndex: i + 1 }} />
            ))}
          </div>
          <Link to="/today" className="btn px-7 py-4 text-lg">Give it a try →</Link>
        </div>
      </section>

      {/* Why */}
      <section className="grid max-w-[68ch] gap-4" aria-labelledby="why-h">
        <p className="font-pixel text-[12px]">WHY</p>
        <h2 id="why-h" className="text-4xl">The market only pays for top-level work. Getting there alone is hard.</h2>
        <p className="text-[17px]">Hundreds of applicants per role, design tests, ghosting. Practising on your own gives you reps, but nobody tells you what's off. And the search itself wears you down.</p>
        <p className="text-[17px]">Make It Pop gives you a shared design to work on every day, honest crits from other designers, and a place to let off steam.</p>
      </section>

      {/* What */}
      <section className="grid gap-6" aria-labelledby="what-h">
        <p className="font-pixel text-[12px]">WHAT YOU DO HERE</p>
        <h2 id="what-h" className="text-4xl">Three steps, once a day</h2>
        <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
          {HOW.map((s, i) => (
            <li key={s.t} className={`note ${s.bg} shadow-[4px_4px_0_#161616]`}>
              <span className="font-pixel text-[12px]">STEP {i + 1}</span>
              <h3 className="text-2xl">{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
        <Win title="steam room" className="max-w-xl" bodyClass="p-5 grid gap-3">
          <h3 className="text-2xl">And when the search gets heavy</h3>
          <p>Ghosted again? Rejected after round 3? Break stuff, rant anonymously, get a "same" from people who get it. Then back to work.</p>
          <div><Link to="/steam-room" className="btn btn-ghost">Enter the steam room</Link></div>
        </Win>
      </section>

      {/* Who */}
      <section className="grid max-w-[68ch] gap-4" aria-labelledby="who-h">
        <p className="font-pixel text-[12px]">WHO</p>
        <h2 id="who-h" className="text-4xl">Built by a designer who's job-hunting too</h2>
        <p className="text-[17px]">I'm Tamara Sary, a product designer. I started a 30-day UI challenge to keep sharp during my own search and wanted people to tear it apart with me. Make It Pop is that, for everyone in the same boat.</p>
        <p className="text-[17px]">Every design is free to remix. Just credit Make It Pop when you post. The code is open source on <a className="font-semibold text-ink" href="https://github.com/tamara-sary/makeitpop" target="_blank" rel="noreferrer">GitHub</a>.</p>
      </section>

      <section className="grid justify-items-start gap-4">
        <h2 className="text-4xl">Today's design is waiting.</h2>
        <Link to="/today" className="btn px-7 py-4 text-lg">Give it a try →</Link>
      </section>
    </div>
  )
}
