import { useEffect, useRef, useState, type ReactNode } from 'react'
import './showcase.css'
import { MotionToggle } from './parts'

// "What you get": structure borrowed from Shopify Editions (stage + 3 feature tiles + feature catalogue),
// built neo-brutalist: flat fills, ink borders, hard shadows, real Make It Pop UI inside, small loops that explain.

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

// ---------- stage ----------
const CHIPS = [
  { t: 'Figma', c: 'bg-pop-pink', pos: '-left-6 top-[14%] -rotate-6' },
  { t: 'Claude Code', c: 'bg-pop-sun', pos: '-left-10 bottom-[18%] rotate-3' },
  { t: 'Cursor', c: 'bg-pop-mint', pos: '-right-6 top-[22%] rotate-6' },
  { t: 'LinkedIn', c: 'bg-paper', pos: '-right-10 bottom-[14%] -rotate-3' },
]

function Stage() {
  return (
    <div className="relative overflow-hidden border-2 border-ink bg-pop-blue px-[9%] pb-[7%] pt-[6%] shadow-pop-lg">
      <div className="halftone pointer-events-none absolute inset-0" style={{ ['--dot-alpha' as string]: '18%', ['--dot-size' as string]: '12px' }} />
      <div className="win relative">
        <div className="tbar"><span className="title">makeitpop.work / today</span></div>
        <img src="/landing/stick.webp" alt="Today's challenge canvas: a finance dashboard with stickies pinned on it" className="block w-full" width={1600} height={946} />
      </div>
      {CHIPS.map((c) => (
        <span key={c.t} className={'anim float-chip absolute hidden border-2 border-ink px-4 py-2.5 font-display text-lead font-extrabold shadow-pop-md sm:block ' + c.c + ' ' + c.pos} aria-hidden="true">{c.t}</span>
      ))}
      {/* floating "add a sticky" bar, like Shopify's prompt bar */}
      <div className="absolute bottom-[12%] left-1/2 flex w-[min(520px,78%)] -translate-x-1/2 items-center gap-3 border-2 border-ink bg-paper py-2 pl-2 pr-2 shadow-pop-lg" aria-hidden="true">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full rounded-tl-none border-2 border-ink bg-pop-pink font-display text-title-sm font-extrabold leading-none">+</span>
        <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-body font-medium"><span className="anim stage-type type-reveal max-w-[26ch]">Only Eng is blue. Alert or just big?</span><span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 bg-ink" /></span>
        <span className="anim stage-send shrink-0 border-2 border-ink px-3 py-1.5 text-ui font-extrabold">Stick it</span>
      </div>
    </div>
  )
}

// ---------- feature tiles ----------
function Tile({ bg, title, children, desc }: { bg: string; title: string; desc: string; children: ReactNode }) {
  return (
    <article className="grid content-start gap-4">
      <div className={'relative h-[260px] overflow-hidden border-2 border-ink shadow-pop-md ' + bg} aria-hidden="true">{children}</div>
      <div>
        <h3 className="font-display text-title-sm font-extrabold leading-tight">{title}</h3>
        <p className="mt-1.5 text-body text-ink">{desc}</p>
      </div>
    </article>
  )
}

function PinTile() {
  return (
    <Tile bg="bg-pop-sun" title="Pin it on the spot" desc="Zoom in like in Figma and stick a note on the exact pixel that bugs you.">
      <div className="absolute inset-x-[8%] top-[10%] border-2 border-ink bg-paper shadow-pop-sm">
        <img src="/days/day-01.png" alt="" className="block w-full" />
      </div>
      <span className="anim pin-dot absolute left-[36%] top-[40%] z-[1] grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full rounded-tl-none border-2 border-ink bg-pop-pink text-caption font-extrabold">+</span>
      <div className="anim pin-sticky absolute left-[40%] top-[24%] z-[2] w-[48%] origin-top-left border-2 border-ink bg-sticky-mint p-2.5 shadow-pop-sm" style={{ rotate: '-3deg' }}>
        <p className="text-ui font-semibold leading-snug">‘Ahead of pace’ reads like good news.</p>
        <p className="mt-1 font-pixel text-micro uppercase">You · Senior</p>
      </div>
      <svg className="anim pin-cursor absolute z-[3] h-7 w-7 drop-shadow-[2px_2px_0_var(--color-ink)]" viewBox="0 0 24 24">
        <path d="M3 2 L3 20 L8 15 L11.5 22 L14.5 20.6 L11 13.8 L18 13.8 Z" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </Tile>
  )
}

// Same people, same stickies as the hero (parts.tsx HERO_STICKIES), so the sample crowd stays consistent.
const OTHERS = [
  { n: 'Jon', l: 'Mid', t: '38% of what? Add units.', c: 'bg-sky' },
  { n: 'Priya', l: 'Senior', t: 'Two CTAs fight. Pick one.', c: 'bg-pop-pink' },
  { n: 'Marta', l: 'Senior', t: 'The drop-off is the story.', c: 'bg-pop-sun' },
]

function EyeTile() {
  return (
    <Tile bg="bg-pop-mint" title="Your eye goes first" desc="Everyone else's stickies stay hidden until you add yours, so their take can't steer yours.">
      <ul className="absolute inset-x-[8%] top-[9%] m-0 grid list-none gap-1 border-2 border-ink bg-paper p-1.5 shadow-pop-sm">
        <li className="anim eye-you flex items-center gap-2.5 bg-pop-sun/60 px-2 py-1.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper text-micro font-extrabold">Y</span>
          <span className="grid min-w-0 leading-tight"><b className="text-ui">You</b><span className="truncate text-caption">‘Ahead of pace’ reads like good news.</span></span>
        </li>
        {OTHERS.map((p) => (
          <li key={p.n} className="anim eye-row flex items-center gap-2.5 px-2 py-1.5">
            <span className={'grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink text-micro font-extrabold ' + p.c}>{p.n[0]}</span>
            <span className="grid min-w-0 leading-tight"><b className="text-ui">{p.n} <span className="font-pixel text-micro font-normal uppercase text-muted">{p.l}</span></b><span className="truncate text-caption text-muted">{p.t}</span></span>
          </li>
        ))}
      </ul>
      <span className="absolute bottom-[8%] right-[7%] grid">
        <span className="anim eye-locked col-start-1 row-start-1 inline-flex items-center gap-1.5 border-2 border-ink bg-ink px-3 py-1.5 text-caption font-bold text-paper">🔒 3 hidden</span>
        <span className="anim eye-open col-start-1 row-start-1 inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-3 py-1.5 text-caption font-bold shadow-pop-sm">✓ Unlocked</span>
      </span>
    </Tile>
  )
}

function RemixTile() {
  return (
    <Tile bg="bg-pop-pink" title="Remix it your way" desc="Take the Figma file, or pull the code kit into Cursor or Claude Code. The brief comes with it.">
      <div className="absolute inset-x-[7%] top-[9%] border-2 border-ink bg-paper font-mono text-caption shadow-pop-sm">
        <div className="flex items-center gap-1.5 border-b-2 border-ink px-2.5 py-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-ink bg-pop-pink" /><span className="h-2.5 w-2.5 rounded-full border border-ink bg-pop-sun" /><span className="h-2.5 w-2.5 rounded-full border border-ink bg-pop-mint" />
          <span className="ml-1.5 font-pixel text-micro">index.html</span>
          <span className="anim remix-done ml-auto border border-ink bg-pop-mint px-1.5 text-micro font-bold">✓ 2 changes</span>
        </div>
        <div className="py-1.5 leading-6">
          <div className="px-2.5"><span className="mr-2 text-muted">1</span>&lt;div class="kpi"&gt;</div>
          <div className="relative px-2.5"><span className="mr-2 text-muted">2</span>  &lt;p&gt;38%&lt;/p&gt;<span className="anim remix-strike absolute inset-x-2 top-1/2 h-0.5 origin-left bg-ink" /></div>
          <div className="anim remix-add bg-pop-mint/40 px-2.5"><span className="mr-2">+</span>  &lt;p&gt;38% of budget&lt;/p&gt;</div>
          <div className="px-2.5"><span className="mr-2 text-muted">4</span>&lt;/div&gt;</div>
        </div>
      </div>
      <div className="absolute inset-x-[10%] bottom-[9%] flex items-center gap-2 border-2 border-ink bg-paper py-1.5 pl-3 pr-1.5 shadow-pop-sm">
        <span className="min-w-0 flex-1 text-ui"><span className="anim remix-type type-reveal max-w-[22ch]">Add units to every KPI</span></span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-caption text-paper">↑</span>
      </div>
    </Tile>
  )
}

// ---------- catalogue: only features that exist today ----------
const CATALOGUE = [
  { t: 'A real brief every day', d: 'Who it’s for, when they use it, what failure looks like. Like a design test, minus the ghosting.' },
  { t: 'Hide stickies with Shift+C', d: 'Clear the canvas to look again with fresh eyes. Your sticky draft is kept.' },
  { t: 'Discussion next to the design', d: 'Comment threads open in a side panel, so you never lose your spot.' },
  { t: 'Drop your shot', d: 'Paste or drop your remix into the frame and see it next to the original.' },
  { t: 'Caption with credit, ready to copy', d: 'Post your before/after on LinkedIn. You add the three things you changed.' },
  { t: 'Your profile', d: 'Every sticky and remix in one place, so you can see your eye get sharper.' },
  { t: 'Steam room', d: 'Ghosted again? Break stuff, rant anonymously, then back to work.' },
  { t: 'The archive', d: 'Every day released so far, in order, so you can catch up any time.' },
  { t: 'Open source', d: 'The kits and the site are on GitHub. Remix freely, credit Make It Pop.' },
]

export default function Showcase() {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <section ref={ref} id="what" className={'show bg-desk ' + (inView ? 'play' : '')}>
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className="cond text-[clamp(64px,10vw,144px)] uppercase">What you get</h2>
          <div className="grid justify-items-start gap-4">
            <p className="max-w-[36ch] text-lead">One design a day, and everything you need to critique it, fix it and show it.</p>
            <MotionToggle />
          </div>
        </div>
        <Stage />
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          <PinTile />
          <EyeTile />
          <RemixTile />
        </div>
        <ul className="mt-16 grid list-none gap-x-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {CATALOGUE.map((f) => (
            <li key={f.t} className="border-t-2 border-ink py-5">
              <h3 className="font-display text-lead font-extrabold leading-tight">{f.t}</h3>
              <p className="mt-1 text-body-sm text-ink">{f.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
