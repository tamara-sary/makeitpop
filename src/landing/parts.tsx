import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Sticky } from '../components/Stickies'
import type { Crit } from '../data/days'
import './pop.css'

// ---------- real copy (honest: only things that are true today) ----------
export const CTA = { to: '/today', label: 'Pin your first sticky' }

export const HERO_STICKIES: Crit[] = [
  { id: 'l1', name: 'Jon', level: 'Mid', tag: '', agrees: 0, color: 'mint', text: '38% of what? Add units.' },
  { id: 'l2', name: 'Priya', level: 'Senior', tag: '', agrees: 0, color: 'pink', text: 'Two CTAs fight. Pick one.' },
  { id: 'l3', name: 'Marta', level: 'Senior', tag: '', agrees: 0, color: 'sun', text: 'The drop-off is the story.' },
]

// ---------- comic starburst ----------
// Deterministic spiky polygon so every render is the same shape.
function burstPoints(spikes: number, outer = 50, inner = 37) {
  const pts: string[] = []
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer - (i % 4 === 0 ? 0 : 4) : inner + (i % 3) * 2
    const a = (Math.PI * i) / spikes - Math.PI / 2
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

export function Burst({ children, fill = 'var(--color-pop-sun)', spikes = 14, className = '', style }: {
  children?: ReactNode; fill?: string; spikes?: number; className?: string; style?: CSSProperties
}) {
  return (
    <span className={(className.includes('absolute') ? '' : 'relative ') + 'inline-grid place-items-center ' + className} style={style}>
      <svg viewBox="-4 -4 108 108" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <polygon points={burstPoints(spikes)} transform="translate(4 5)" fill="var(--color-ink)" />
        <polygon points={burstPoints(spikes)} fill={fill} stroke="var(--color-ink)" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
      <span className="relative">{children}</span>
    </span>
  )
}

// ---------- ticker ----------
export function Ticker({ words, className = '' }: { words: string[]; className?: string }) {
  const row = words.flatMap((w, i) => [<span key={'w' + i}>{w}</span>, <span key={'s' + i} aria-hidden="true">✦</span>])
  return (
    <div className={'overflow-hidden border-y-2 border-ink ' + className} aria-label={words.join(', ')}>
      <div className="ticker gap-6 py-3 pr-6" aria-hidden="true">
        <div className="flex shrink-0 gap-6">{row}</div>
        <div className="flex shrink-0 gap-6">{row}</div>
      </div>
    </div>
  )
}

// ---------- buttons ----------
export function PopButton({ to = CTA.to, children = CTA.label, tone = 'ink', size = 'lg' }: {
  to?: string; children?: ReactNode; tone?: 'ink' | 'sun' | 'paper'; size?: 'lg' | 'md'
}) {
  const tones = { ink: 'bg-ink text-pop-sun', sun: 'bg-pop-sun text-ink', paper: 'bg-paper text-ink' }
  const sizes = { lg: 'px-7 py-4 text-lead', md: 'px-5 py-3 text-body' }
  return (
    <Link to={to} data-sound="cta"
      className={'inline-flex items-center gap-3 border-2 border-ink font-sans font-extrabold no-underline shadow-pop-lg transition-[translate,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-pop-sm ' + tones[tone] + ' ' + sizes[size]}>
      {children} <span aria-hidden="true">→</span>
    </Link>
  )
}

// ---------- the real design with stickies slapped on ----------
export function DesignWithStickies({ className = '', tilt = -2.5 }: { className?: string; tilt?: number }) {
  return (
    <div className={'relative ' + className} role="img" aria-label="Today's design, a finance dashboard, with three stickies pinned on it">
      <div className="win" style={{ rotate: `${tilt}deg` }}>
        <div className="tbar"><span className="title">Day 01 · Dashboards</span></div>
        <img src="/days/day-01.png" alt="" className="block w-full" width={1392} height={988} />
      </div>
      <Sticky crit={HERO_STICKIES[0]} i={0} className="absolute -left-[6%] top-[52%] w-[34%] max-sm:p-2 max-sm:[&_p]:text-caption" />
      <Sticky crit={HERO_STICKIES[1]} i={1} className="absolute right-[-5%] top-[8%] w-[34%] max-sm:p-2 max-sm:[&_p]:text-caption" />
      <Sticky crit={HERO_STICKIES[2]} i={3} className="absolute bottom-[-8%] right-[18%] w-[34%] max-sm:p-2 max-sm:[&_p]:text-caption" />
    </div>
  )
}

// ---------- "What is Make It Pop" cards (recent.design subscription-card style) ----------
// Each tile is a small, real piece of the product; one layer breaks out of the frame; one plain caption underneath.

function Tile({ bg, children, caption, dark }: { bg: string; children: ReactNode; caption: string; dark?: boolean }) {
  return (
    <figure className="what-tile m-0 grid gap-4">
      <div className={'relative h-[300px] overflow-hidden border-2 border-ink shadow-pop-md ' + bg}>
        <div className="halftone halftone-fade pointer-events-none absolute inset-0" style={{ ['--dot-alpha' as string]: '14%' }} />
        {children}
      </div>
      <figcaption className={'text-center text-body font-semibold ' + (dark ? 'text-paper' : 'text-ink')}>{caption}</figcaption>
    </figure>
  )
}

function DayTile({ dark }: { dark?: boolean }) {
  return (
    <Tile dark={dark} bg="bg-pop-sun" caption="One real design a day, with a brief">
      <div className="lift absolute left-[9%] right-[9%] top-[12%] border-2 border-ink bg-paper shadow-pop-md">
        <div className="flex items-center justify-between border-b-2 border-ink px-3 py-1.5">
          <span className="font-pixel text-micro uppercase">Day 01 / 30</span>
          <span className="chip px-1.5 py-0.5 text-micro">Dashboards</span>
        </div>
        <img src="/days/day-01.png" alt="" className="block w-full" />
      </div>
      <div className="lift lift-tilt absolute bottom-[9%] left-[5%] flex items-center gap-2.5 border-2 border-ink bg-paper px-3 py-2 shadow-pop-sm">
        <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-pop-pink text-caption font-extrabold" aria-hidden="true">✓</span>
        <span className="grid leading-tight">
          <b className="text-ui">Finance dashboard</b>
          <span className="text-caption text-muted">for Maya, ops lead · Monday</span>
        </span>
      </div>
    </Tile>
  )
}

const PEOPLE = [
  { n: 'You', l: 'Senior', t: 'The drop-off is the story.', c: 'bg-pop-sun', you: true },
  { n: 'Priya', l: 'Senior', t: 'Two CTAs fight. Pick one.', c: 'bg-pop-pink' },
  { n: 'Jon', l: 'Mid', t: '38% of what? Add units.', c: 'bg-pop-mint' },
  { n: 'Marta', l: 'Senior', t: 'Legend hides the key number.', c: 'bg-sky' },
  { n: 'Leo', l: 'Mid', t: 'Gauge reads 74%, of what?', c: 'bg-pop-sun' },
]

function EyeTile({ dark }: { dark?: boolean }) {
  return (
    <Tile dark={dark} bg="bg-pop-mint" caption="Pin what's off, then see what others spotted">
      <ul className="lift absolute left-[8%] right-[14%] top-[9%] m-0 grid list-none gap-0.5 border-2 border-ink bg-paper p-1.5 shadow-pop-md">
        {PEOPLE.map((p) => (
          <li key={p.n} className={'flex items-center gap-2.5 px-2 py-1.5 ' + (p.you ? 'bg-cream' : 'blur-[2.5px] select-none')} aria-hidden={!p.you}>
            <span className={'grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink text-micro font-extrabold ' + p.c}>{p.n[0]}</span>
            <span className="grid min-w-0 leading-tight">
              <b className="text-ui">{p.n} <span className="font-pixel text-micro font-normal uppercase text-muted">{p.l}</span></b>
              <span className="truncate text-caption text-muted">{p.t}</span>
            </span>
          </li>
        ))}
      </ul>
      <span className="lift absolute bottom-[10%] right-[6%] inline-flex items-center gap-1.5 border-2 border-ink bg-ink px-3 py-1.5 text-caption font-bold text-paper shadow-pop-sm">
        <span aria-hidden="true">🔒</span> 4 unlock after yours
      </span>
    </Tile>
  )
}

function RemixTile({ dark }: { dark?: boolean }) {
  const lines: { t: string; k?: '+' | '-' }[] = [
    { t: '<section class="kpi">' },
    { t: '  <p>38%</p>', k: '-' },
    { t: '  <p>38% <small>of budget</small></p>', k: '+' },
    { t: '  <button>Export</button>', k: '-' },
    { t: '</section>' },
  ]
  return (
    <Tile dark={dark} bg="bg-pop-blue" caption="Remix it in Figma, Cursor or Claude Code">
      <div className="lift absolute left-[8%] right-[8%] top-[10%] border-2 border-ink bg-paper font-mono text-caption shadow-pop-md">
        <div className="flex items-center gap-1.5 border-b-2 border-ink px-3 py-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-ink bg-pop-pink" />
          <span className="h-2.5 w-2.5 rounded-full border border-ink bg-pop-sun" />
          <span className="h-2.5 w-2.5 rounded-full border border-ink bg-pop-mint" />
          <span className="ml-2 font-pixel text-micro">day-01/index.html</span>
        </div>
        <ol className="m-0 list-none py-1.5 pl-0">
          {lines.map((l, i) => (
            <li key={i} className={'flex gap-3 whitespace-pre px-3 leading-6 ' + (l.k === '+' ? 'bg-pop-mint/30' : l.k === '-' ? 'bg-pop-pink/25' : '')}>
              <span className="w-4 text-right text-muted">{l.k ?? i + 1}</span>{l.t}
            </li>
          ))}
        </ol>
      </div>
      <div className="lift lift-tilt absolute bottom-[8%] left-[14%] right-[14%] flex items-center gap-2 border-2 border-ink bg-paper py-1.5 pl-3 pr-1.5 shadow-pop-md">
        <span className="flex-1 text-ui">Make the KPI cards pop</span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-caption text-paper" aria-hidden="true">↑</span>
      </div>
    </Tile>
  )
}

export function WhatCards({ title = 'What you get, every day', dark = false }: { title?: string; dark?: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 className={'cond mb-10 text-center text-[clamp(44px,7vw,88px)] uppercase ' + (dark ? 'text-paper' : 'text-ink')}>{title}</h2>
      <div className="grid gap-8 md:grid-cols-3 md:gap-6">
        <DayTile dark={dark} />
        <EyeTile dark={dark} />
        <RemixTile dark={dark} />
      </div>
      <p className={'mx-auto mt-10 flex w-fit flex-wrap items-center justify-center gap-x-2 gap-y-1 border-2 border-ink px-4 py-2.5 text-center text-ui ' + (dark ? 'bg-paper' : 'bg-cream')}>
        <span aria-hidden="true">✦</span> Free to remix. Credit Make It Pop when you post.
        <a href="https://github.com/tamara-sary/makeitpop" className="font-bold text-ink underline underline-offset-2">Open source on GitHub</a>
      </p>
    </section>
  )
}
