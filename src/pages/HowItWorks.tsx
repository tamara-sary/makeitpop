import { Link } from 'react-router-dom'
import { Win } from '../components/ui'

const STEPS = [
  { t: 'Open today\'s design', d: 'A new design from the 30-day UI challenge every day. Dashboards, landing pages, flows, case studies.', bg: 'bg-sun' },
  { t: 'Crit it', d: 'Say what\'s off and why. Agree with the crits you\'d fix first. The best ones rise to the top.', bg: 'bg-mint' },
  { t: 'Remix it', d: 'Grab the Figma file or the code. Claude Code, Cursor, any AI tool. Fix what the crits found.', bg: 'bg-pink' },
  { t: 'Post it on LinkedIn', d: 'Before/after template and caption with credit are ready. Your remix, your portfolio, your reach.', bg: 'bg-paper' },
]

export default function HowItWorks() {
  return (
    <div className="grid gap-10">
      <header className="grid max-w-[64ch] gap-3">
        <h1 className="text-4xl sm:text-5xl">A daily design gym for designers between jobs</h1>
        <p className="text-[17px]">For mid-level and senior product designers who are job-hunting. Practising alone gets lonely and nobody tells you what's off. Here, a few hundred sharp eyes do.</p>
      </header>
      <ol className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <li key={s.t} className={`note ${s.bg}`}>
            <span className="font-pixel text-[12px]">STEP {i + 1}</span>
            <h2 className="text-2xl">{s.t}</h2>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
      <Win title="steam room" bodyClass="p-5 grid gap-3">
        <h2 className="text-2xl">And when the search gets heavy</h2>
        <p className="max-w-[60ch]">Break stuff, rant anonymously, get a "same" from people who get it. Then back to work.</p>
        <div><Link to="/steam-room" className="btn">Enter the steam room</Link></div>
      </Win>
      <section className="grid gap-2">
        <h2 className="text-2xl">Remixing rules</h2>
        <ul className="m-0 grid gap-1 pl-5">
          <li>Every design is free to remix under CC BY 4.0. Credit Make It Pop when you post.</li>
          <li>Crit the work, not the person.</li>
          <li>Punch at the process, never at people.</li>
        </ul>
      </section>
    </div>
  )
}
