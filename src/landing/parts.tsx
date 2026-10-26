import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { track } from '../lib/analytics'
import { load, save } from '../lib/store'
import { Link } from 'react-router-dom'
import { Sticky } from '../components/Stickies'
import type { Crit } from '../data/days'
import './pop.css'

// ---------- real copy (honest: only things that are true today) ----------
export const CTA = { to: '/today', label: 'Pin your first sticky' }

export const HERO_STICKIES: Crit[] = [
  { id: 'l1', name: 'Jon', level: 'Mid', tag: '', agrees: 0, color: 'mint', text: '38% of what? Add units.', sample: true },
  { id: 'l2', name: 'Priya', level: 'Senior', tag: '', agrees: 0, color: 'pink', text: 'Two CTAs fight. Pick one.', sample: true },
  { id: 'l3', name: 'Marta', level: 'Senior', tag: '', agrees: 0, color: 'sun', text: 'The drop-off is the story.', sample: true },
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
    <div className={'overflow-hidden border-y-2 border-ink ' + className}>
      <span className="sr-only">{words.join(', ')}</span>
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
    <Link to={to} data-sound="cta" onClick={() => track('landing_cta_clicked', { to })}
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

// ---------- footer: the prototype note stays; nav + socials added ----------
const FOOT_NAV = [
  { to: '/today', label: 'Today' },
  { to: '/archive', label: 'Archive' },
  { to: '/steam-room', label: 'Steam room' },
  { to: '/me', label: 'Your profile' },
]
const SOCIALS = [
  { href: 'https://www.linkedin.com/in/tamarasaribekyan', label: 'LinkedIn' },
  { href: 'https://happyui.dev', label: 'happyui.dev' },
]

export function SiteFooter() {
  return (
    <footer className="bg-desk">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-6">
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-2">
          {FOOT_NAV.map((l) => (
            <Link key={l.to} to={l.to} className="border-2 border-ink bg-paper px-3 py-1.5 text-ui font-bold text-ink no-underline shadow-pop-sm hover:bg-pop-sun">{l.label}</Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-pixel text-caption uppercase">Made by Tamara Sary</span>
          {SOCIALS.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="border-2 border-ink bg-ink px-3 py-1.5 text-ui font-bold text-paper no-underline shadow-pop-sm hover:bg-pop-pink hover:text-ink">
              {s.label} <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      </div>
      <p className="border-t-2 border-ink px-4 py-4 text-center text-ui text-muted">
        Prototype v1 · sample content is marked "sample" · anything you add is saved on this device only
      </p>
    </footer>
  )
}

// ---------- pause all looping motion ----------
// One switch for the ticker, the showcase loops and the apple. Remembered per browser.
export function MotionToggle({ className = '' }: { className?: string }) {
  const [paused, setPaused] = useState(() => load<boolean>('motion-paused', false))
  useEffect(() => {
    document.documentElement.classList.toggle('motion-paused', paused)
    save('motion-paused', paused)
  }, [paused])
  return (
    <button type="button" data-sound="none" aria-pressed={paused} onClick={() => setPaused(!paused)}
      className={'inline-flex min-h-9 cursor-pointer items-center gap-2 border-2 border-ink bg-paper px-3 py-1.5 text-ui font-bold text-ink shadow-pop-sm ' + className}>
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        {paused ? <path d="M7 4.5v15l12-7.5z" /> : <><rect x="6" y="4.5" width="4" height="15" /><rect x="14" y="4.5" width="4" height="15" /></>}
      </svg>
      {paused ? 'Play animations' : 'Pause animations'}
    </button>
  )
}
