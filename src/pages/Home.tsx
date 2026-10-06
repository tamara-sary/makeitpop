import { useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { Logo, Win } from '../components/ui'
import { Sticky } from '../components/Stickies'
import type { Crit } from '../data/days'

// Fanned like a hand of cards: green in front and centre, the other two tucked behind, tilted out.
const STACK: { crit: Crit; left: string; top: number; tilt: number; z: number }[] = [
  { crit: { id: 'h3', name: 'Priya', level: 'Senior', tag: '', agrees: 0, color: 'pink', text: 'Two CTAs fight. Pick one.' }, left: '0%', top: 64, tilt: -9, z: 1 },
  { crit: { id: 'h1', name: 'Marta', level: 'Senior', tag: '', agrees: 0, color: 'sun', text: 'The drop-off is the story.' }, left: '58%', top: 72, tilt: 8, z: 2 },
  { crit: { id: 'h2', name: 'Jon', level: 'Mid', tag: '', agrees: 0, color: 'mint', text: '38% of what? Add units.' }, left: '29%', top: 0, tilt: -1.5, z: 3 },
]

// A hero sticky you can grab and throw around the page, just for fun. Hover = it lifts and leans a little.
function FunSticky({ crit, left, top, tilt, z, onGrab, front }: (typeof STACK)[number] & { onGrab: () => void; front: number }) {
  const [off, setOff] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ sx: number; sy: number; ox: number; oy: number; minX: number; maxX: number } | null>(null)
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    // keep it inside the window sideways so the page never scrolls horizontally
    start.current = { sx: e.clientX, sy: e.clientY, ox: off.x, oy: off.y, minX: off.x - r.left + 4, maxX: off.x + (window.innerWidth - r.right) - 4 }
    setDragging(true)
    onGrab()
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const s = start.current
    if (!s) return
    setOff({ x: Math.min(Math.max(s.ox + e.clientX - s.sx, s.minX), s.maxX), y: s.oy + e.clientY - s.sy })
  }
  const up = () => { start.current = null; setDragging(false) }
  return (
    <div className="absolute w-[42%] cursor-grab touch-none select-none active:cursor-grabbing" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      style={{ left, top, zIndex: front || z, transform: `translate(${off.x}px, ${off.y}px)` }}>
      <div className={'rotate-[var(--tilt)] transition-[rotate,translate] duration-200 ease-out ' + (dragging ? '' : 'hover:-translate-y-2 hover:rotate-[var(--hover-tilt)]')}
        style={{ ['--tilt' as string]: `${tilt}deg`, ['--hover-tilt' as string]: `${tilt + (tilt > 0 ? 3 : -3)}deg` }}>
        <Sticky crit={crit} i={0} big className="min-h-[170px] w-full content-between p-5 pt-6" style={{ transform: dragging ? 'scale(1.04)' : 'none' }} />
      </div>
    </div>
  )
}

function StickyFan() {
  const top = useRef(10)
  const [fronts, setFronts] = useState<Record<string, number>>({})
  return (
    <div className="relative h-[250px] w-full max-w-[620px] max-sm:[&_p]:text-[15px] sm:h-[330px]" role="img" aria-label="Three example stickies fanned out">
      {STACK.map((s) => (
        <FunSticky key={s.crit.id} {...s} front={fronts[s.crit.id] ?? 0} onGrab={() => setFronts((f) => ({ ...f, [s.crit.id]: ++top.current }))} />
      ))}
    </div>
  )
}

const HOW = [
  { t: 'Stick it', d: "Every day there's a new design from a 30-day UI challenge. Stick a note on what's off and why.", bg: 'bg-sun' },
  { t: 'Remix it', d: 'Grab the Figma file or the code. Fix what the stickies found, in your own tool.', bg: 'bg-mint' },
  { t: 'Post it', d: 'Share your before/after on LinkedIn. Caption with credit is ready to copy.', bg: 'bg-pink' },
]

export default function Home() {
  return (
    <div className="grid gap-20 pb-10">
      {/* Hero */}
      <section className="grid items-center gap-12 pt-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid justify-items-start gap-5">
          <Logo size="clamp(48px, 13vw, 72px)" animated />
          <p className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Critique it. Remix it. Make it pop.</p>
          <p className="max-w-[52ch] text-[18px]">A daily design gym for mid-level and senior product designers who are job-hunting. Sharpen your eye on a real design every day, with people who get it.</p>
          {/* Hand-drawn marker loop around the CTA, drawn on after the logo pops (like circling it on a printout) */}
          <span className="cta-scribble mt-4 ml-2">
            <svg viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
              {/* two loose, uneven loops + a flick at the end, like a marker circling it twice */}
              <path pathLength={1} d="M330 40 C 250 8, 92 16, 46 52 C 6 84, 22 158, 150 170 C 282 182, 390 150, 376 98 C 366 50, 286 30, 186 36 C 98 42, 26 66, 34 104 C 42 140, 120 164, 254 174 C 290 177, 318 182, 342 194"
                fill="none" stroke="#56633c" strokeWidth="5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Link to="/today" className="btn cta-wiggle px-7 py-4 text-lg">Give it a try <span className="arrow" aria-hidden="true">→</span></Link>
          </span>
        </div>
        <div className="grid justify-items-center">
          <StickyFan />
        </div>
      </section>

      {/* Why */}
      <section className="grid items-center gap-8 md:grid-cols-[minmax(0,68ch)_1fr]" aria-labelledby="why-h">
        <div className="grid gap-4">
          <p className="font-pixel text-[12px]">WHY</p>
          <h2 id="why-h" className="text-4xl">The market only pays for top-level work. Getting there alone is hard.</h2>
          <p className="text-[17px]">Hundreds of applicants per role, design tests, ghosting. Practising on your own gives you reps, but nobody tells you what's off. And the search itself wears you down.</p>
          <p className="text-[17px]">Make It Pop gives you a shared design to work on every day, honest stickies from other designers, and a place to let off steam.</p>
        </div>
        {/* The apple jumps; at the top of each jump its mouth opens into a surprised "O".
            The mouth is an oval laid exactly over the drawn one (same colour), so it can grow without editing the image. */}
        <div className="apple-hop relative mx-auto w-[min(260px,60vw)] -rotate-3 md:w-[300px]">
          <img src="/brand/apple.webp" alt="" width={613} height={720} className="block w-full" draggable={false} />
          <span className="apple-mouth" aria-hidden="true" />
        </div>
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
        <Link to="/today" className="btn px-7 py-4 text-lg">Give it a try <span className="arrow" aria-hidden="true">→</span></Link>
      </section>
    </div>
  )
}
