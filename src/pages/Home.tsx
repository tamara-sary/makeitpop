import { useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/ui'
import { Sticky } from '../components/Stickies'
import { DAYS, TODAY, WEEKS, type Crit } from '../data/days'

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


/* ---------- landing layout (structure inspired by LottieFiles' landing, in Make It Pop's own style) ----------
   hero + feature chips → honest facts strip → the 30 days carousel → why → how it works (tabs + product shots)
   → bento of what makes it different → the numbers that are true today → your tools → who → big final CTA */

const CHIPS = [
  { t: 'One design a day', d: '30 days, 4 themes', bg: 'bg-sun', i: '1' },
  { t: 'Your eye first', d: 'others’ stickies unlock after yours', bg: 'bg-mint', i: '◎' },
  { t: 'Figma or code', d: 'remix in your own tool', bg: 'bg-pink', i: '✦' },
  { t: 'Steam room', d: 'for the bad days', bg: 'bg-[#a9d8ff]', i: '!' },
]

const WEEK_BG = ['bg-sun', 'bg-mint', 'bg-pink', 'bg-[#a9d8ff]']

const STEPS = [
  { id: 'stick', t: 'Stick it', h: 'Pin a sticky on what’s off', d: 'Every day there’s one design from a 30-day UI challenge. Zoom in like in Figma, pin a sticky on the exact spot, and say why. Other people’s stickies unlock after you add yours, so your eye goes first.', img: '/landing/stick.webp', alt: 'The challenge canvas: a finance dashboard with sticky notes pinned on it' },
  { id: 'remix', t: 'Remix it', h: 'Fix it in your own tool', d: 'Get your copy of the Figma file or grab the code kit for Claude Code or Cursor. The top sticky tells you where to start. Drop your finished shot into the frame.', img: '/landing/remix.webp', alt: 'The remix section: get your copy in Figma or code, the top sticky, and a frame to drop your shot' },
  { id: 'post', t: 'Post it', h: 'Show it where recruiters are', d: 'Post your before/after on LinkedIn. The caption with credit is ready to copy: you add the three things you changed.', img: '/landing/post.webp', alt: 'The share section: a ready-to-copy LinkedIn caption with credit' },
]

const TOOLS = ['Figma', 'Claude Code', 'Cursor', 'VS Code', 'LinkedIn', 'any AI tool']

function HowItWorks() {
  const [on, setOn] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  // arrow keys move between tabs, like any tablist
  const key = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    const n = (on + d + STEPS.length) % STEPS.length
    setOn(n)
    tabs.current[n]?.focus()
  }
  const s = STEPS[on]
  return (
    <section className="grid gap-8 border-2 border-ink bg-ink p-6 text-cream shadow-[8px_8px_0_#ff7ac6] sm:p-10" aria-labelledby="how-h">
      <div className="grid items-end gap-4 md:grid-cols-[1.2fr_1fr]">
        <h2 id="how-h" className="text-4xl sm:text-5xl">Critique it.<br />Remix it. Make it pop.</h2>
        <p className="text-[17px] text-cream/80">Three steps, once a day. About 20 minutes, in the tools you already use.</p>
      </div>
      <div role="tablist" aria-label="How it works" className="flex w-fit flex-wrap gap-1 border-2 border-cream/30 p-1" onKeyDown={key}>
        {STEPS.map((x, i) => (
          <button key={x.id} ref={(el) => { tabs.current[i] = el }} role="tab" id={`tab-${x.id}`} aria-selected={on === i} aria-controls={`panel-${x.id}`} tabIndex={on === i ? 0 : -1}
            onClick={() => setOn(i)}
            className={'cursor-pointer border-0 px-4 py-2 font-sans text-[15px] font-bold ' + (on === i ? 'bg-cream text-ink' : 'bg-transparent text-cream hover:bg-cream/10')}>
            <span className="mr-2 font-pixel text-[11px]">{i + 1}</span>{x.t}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${s.id}`} aria-labelledby={`tab-${s.id}`} className="grid items-center gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="grid gap-3">
          <h3 className="text-3xl">{s.h}</h3>
          <p className="text-[17px] text-cream/85">{s.d}</p>
          <div><Link to="/today" className="btn btn-sun mt-2">Try it on today’s design <span className="arrow" aria-hidden="true">→</span></Link></div>
        </div>
        <img key={s.img} src={s.img} alt={s.alt} width={1600} height={946} loading="lazy" className="tab-in block w-full border-2 border-cream/20" />
      </div>
    </section>
  )
}

function DaysCarousel() {
  const row = useRef<HTMLUListElement>(null)
  const scroll = (d: number) => row.current?.scrollBy({ left: d * 300, behavior: 'smooth' })
  return (
    <section className="grid gap-5" aria-labelledby="days-h">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <p className="font-pixel text-[12px]">THE 30 DAYS</p>
          <h2 id="days-h" className="text-4xl">One design a day, four themes</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => scroll(-1)} aria-label="Scroll days left">←</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => scroll(1)} aria-label="Scroll days right">→</button>
        </div>
      </div>
      <ul ref={row} className="no-scrollbar -mx-4 flex snap-x snap-mandatory list-none gap-5 overflow-x-auto px-4 pb-4 pt-1">
        {DAYS.map((d) => {
          const open = d.n <= TODAY
          const card = (
            <div className={`grid h-full content-between gap-3 border-2 border-ink p-4 shadow-[4px_4px_0_#161616] ${WEEK_BG[d.week]}`}>
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[12px]">DAY {String(d.n).padStart(2, '0')}</span>
                <span className="chip">{WEEKS[d.week]}</span>
              </div>
              {d.preview && open ? (
                <img src={d.preview} alt="" loading="lazy" className="block aspect-[16/10] w-full border-2 border-ink object-cover object-top" />
              ) : (
                <div className="grid aspect-[16/10] place-items-center border-2 border-dashed border-ink/40 bg-paper/50 font-pixel text-[11px]">{open ? 'PREVIEW SOON' : `OPENS DAY ${d.n}`}</div>
              )}
              <p className="font-semibold leading-snug">{d.title}</p>
              {d.n === TODAY && <span className="chip w-fit bg-paper">Today →</span>}
            </div>
          )
          return (
            <li key={d.n} className="w-[260px] flex-none snap-start">
              {open ? <Link to={d.n === TODAY ? '/today' : `/day/${d.n}`} className="block h-full text-ink no-underline transition-transform hover:-translate-y-1">{card}</Link> : card}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Bento() {
  const box = 'grid content-start gap-3 border-2 border-ink p-6 shadow-[5px_5px_0_#161616]' // colour set per card
  return (
    <section className="grid gap-6" aria-labelledby="bento-h">
      <div className="grid gap-2">
        <p className="font-pixel text-[12px]">WHAT MAKES IT DIFFERENT</p>
        <h2 id="bento-h" className="text-4xl">Built for how designers actually crit</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-6">
        <div className={box + ' md:col-span-4 bg-paper'}>
          <h3 className="text-2xl">Your eye first</h3>
          <p className="max-w-[48ch] text-muted">Feedback you see first changes what you look for. Other people’s stickies stay hidden until you add your own.</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="chip gap-2 bg-paper px-3 py-2"><span aria-hidden="true">🔒</span> Add yours to unlock 4</span>
            <span className="h-16 w-24 rotate-[-4deg] border-2 border-ink bg-sun blur-[3px]" aria-hidden="true" />
            <span className="h-16 w-24 rotate-[3deg] border-2 border-ink bg-pink blur-[3px]" aria-hidden="true" />
            <span className="h-16 w-24 rotate-[-2deg] border-2 border-ink bg-mint blur-[3px]" aria-hidden="true" />
          </div>
        </div>
        <div className={box + ' md:col-span-2 bg-sun'}>
          <h3 className="text-2xl">Pin it on the spot</h3>
          <p>Click the exact pixel that bugs you. Your sticky lands right there.</p>
          <span className="mt-2 grid h-10 w-10 place-items-center rounded-full rounded-tl-none border-2 border-ink bg-pink font-display text-2xl font-extrabold shadow-[3px_3px_0_#161616]" aria-hidden="true">+</span>
        </div>
        <div className={box + ' md:col-span-3 bg-paper'}>
          <h3 className="text-2xl">Figma or code, your call</h3>
          <p className="text-muted">Get your copy of the Figma file, or pull the code kit straight into Claude Code or Cursor. The brief and stickies come with it.</p>
          <pre className="code m-0 text-[12px]">npx degit tamara-sary/makeitpop/challenges/day-01</pre>
        </div>
        <div className={box + ' md:col-span-3 bg-mint'}>
          <h3 className="text-2xl">Your stickies + remixes, in one place</h3>
          <p>Your profile keeps every sticky you pinned and every shot you dropped, so you can see your eye get sharper over 30 days.</p>
          <Link to="/me" className="w-fit font-semibold text-ink">Make your profile →</Link>
        </div>
        <div className={box + ' md:col-span-6 bg-[#a9d8ff] md:grid-cols-[1fr_auto] md:items-center'}>
          <div className="grid gap-2">
            <h3 className="text-2xl">And when the search gets heavy</h3>
            <p>Ghosted again? Rejected after round 3? Break stuff, rant anonymously, get a “same” from people who get it. Then back to work.</p>
          </div>
          <Link to="/steam-room" className="btn w-fit">Break stuff</Link>
        </div>
      </div>
    </section>
  )
}

// Numbers that are true today. No user counts or growth stats until there are real ones.
function Facts() {
  const tiles = [
    { big: '30', t: 'designs', d: 'one a day, each with a real brief' },
    { big: '4', t: 'themes', d: WEEKS.join(' · ') },
    { big: '2', t: 'ways to remix', d: 'a Figma file or a code kit' },
    { big: '€0', t: 'to join', d: 'free to remix, just credit when you post (CC BY 4.0)' },
  ]
  return (
    <section className="grid gap-8 border-2 border-ink bg-ink p-6 text-cream sm:p-10" aria-labelledby="facts-h">
      <h2 id="facts-h" className="max-w-[18ch] text-4xl sm:text-5xl">A month of reps, laid out for you</h2>
      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((x) => (
          <li key={x.t} className="grid content-start gap-1 border-2 border-cream/25 p-5">
            <span className="font-display text-6xl font-extrabold">{x.big}</span>
            <strong className="text-lg">{x.t}</strong>
            <span className="text-[14px] text-cream/75">{x.d}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Tools() {
  // Stickers float around the heading on wide screens; on phones they wrap under it
  const spots = ['left-[4%] top-[8%] -rotate-6', 'right-[6%] top-[4%] rotate-3', 'left-[12%] bottom-[10%] rotate-2', 'right-[10%] bottom-[14%] -rotate-3', 'left-[38%] top-0 rotate-1', 'right-[34%] bottom-0 -rotate-2']
  const bg = ['bg-pink', 'bg-sun', 'bg-mint', 'bg-[#a9d8ff]', 'bg-paper', 'bg-sun']
  return (
    <section className="relative grid justify-items-center gap-4 py-6 text-center md:min-h-[360px] md:content-center" aria-labelledby="tools-h">
      <h2 id="tools-h" className="max-w-[16ch] text-4xl sm:text-5xl">Remix in the tools you already use</h2>
      <p className="max-w-[46ch] text-[17px] text-muted">No new app to learn. The design comes as a Figma file and as code with a brief your AI assistant can read.</p>
      <ul className="m-0 flex list-none flex-wrap justify-center gap-3 p-0 md:contents">
        {TOOLS.map((t, i) => (
          <li key={t} className={`tool-float chip px-3 py-2 text-[15px] shadow-[3px_3px_0_#161616] md:absolute ${spots[i]} ${bg[i]}`} style={{ animationDelay: `${i * 0.7}s` }}>{t}</li>
        ))}
      </ul>
    </section>
  )
}

export default function Home() {
  return (
    <div className="grid gap-24 pb-10">
      {/* Hero */}
      <div className="grid gap-10">
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

        {/* Feature chips under the hero */}
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {CHIPS.map((c) => (
            <li key={c.t} className="flex items-center gap-3 border-2 border-ink bg-paper p-3">
              <span className={`grid h-10 w-10 flex-none place-items-center border-2 border-ink font-display text-lg font-extrabold ${c.bg}`} aria-hidden="true">{c.i}</span>
              <span className="grid">
                <strong className="leading-tight">{c.t}</strong>
                <span className="text-[13px] text-muted">{c.d}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* Honest proof strip: facts, not logos (no customers to show yet) */}
        <p className="text-center font-pixel text-[12px] leading-relaxed text-muted">
          FOR MID-LEVEL &amp; SENIOR PRODUCT DESIGNERS · FREE · OPEN SOURCE · CREDIT-BACK ON EVERY REMIX
        </p>
      </div>

      <DaysCarousel />

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

      <HowItWorks />
      <Bento />
      <Facts />
      <Tools />

      {/* Who */}
      <section className="grid max-w-[68ch] gap-4" aria-labelledby="who-h">
        <p className="font-pixel text-[12px]">WHO</p>
        <h2 id="who-h" className="text-4xl">Built by a designer who's job-hunting too</h2>
        <p className="text-[17px]">I'm Tamara Sary, a product designer. I started a 30-day UI challenge to keep sharp during my own search and wanted people to tear it apart with me. Make It Pop is that, for everyone in the same boat.</p>
        <p className="text-[17px]">Every design is free to remix. Just credit Make It Pop when you post. The code is open source on <a className="font-semibold text-ink" href="https://github.com/tamara-sary/makeitpop" target="_blank" rel="noreferrer">GitHub</a>.</p>
      </section>

      {/* Big final CTA block */}
      <section className="grid justify-items-center gap-5 border-2 border-ink bg-sun px-6 py-16 text-center shadow-[8px_8px_0_#161616]" aria-labelledby="end-h">
        <h2 id="end-h" className="max-w-[16ch] text-5xl sm:text-6xl">Today's design is waiting.</h2>
        <p className="max-w-[44ch] text-[18px]">Pin your first sticky. It takes a minute, and it unlocks what everyone else saw.</p>
        <Link to="/today" className="btn px-8 py-4 text-lg">Give it a try <span className="arrow" aria-hidden="true">→</span></Link>
      </section>
    </div>
  )
}
