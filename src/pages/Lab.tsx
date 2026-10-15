import { useState, type CSSProperties } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import LandingA from '../landing/LandingA'
import LandingB from '../landing/LandingB'
import LandingC from '../landing/LandingC'
import { PALETTES, type PaletteKey } from '../landing/parts'

// Landing lab: compare layout options and palettes before one replaces Home. Local exploration only.
const OPTIONS = {
  a: { name: 'Poster', C: LandingA },
  b: { name: 'Comic strip', C: LandingB },
  c: { name: 'Colour slabs', C: LandingC },
} as const

export default function Lab() {
  const { v = 'a' } = useParams()
  const [pal, setPal] = useState<PaletteKey>('riso')
  const opt = OPTIONS[v as keyof typeof OPTIONS]
  if (!opt) return <Navigate to="/lab/a" replace />
  const p = PALETTES[pal].vars
  // palettes override the pop-* tokens for everything inside the lab
  const vars = { '--color-pop-pink': p.pink, '--color-pop-sun': p.sun, '--color-pop-blue': p.blue, '--color-pop-mint': p.mint } as CSSProperties
  return (
    <div style={vars}>
      <opt.C />
      <nav className="fixed bottom-4 right-4 z-50 grid gap-1 border-2 border-ink bg-paper p-1 text-ui font-bold shadow-pop-md" aria-label="Landing lab">
        <div className="flex gap-1">
          {Object.entries(OPTIONS).map(([k, o]) => (
            <Link key={k} to={`/lab/${k}`} className={'px-3 py-1.5 no-underline ' + (k === v ? 'bg-ink text-pop-sun' : 'text-ink hover:bg-pop-sun')}>{k.toUpperCase()} · {o.name}</Link>
          ))}
        </div>
        <div className="flex gap-1 border-t-2 border-ink pt-1">
          {(Object.keys(PALETTES) as PaletteKey[]).map((k) => (
            <button key={k} type="button" onClick={() => setPal(k)} aria-pressed={k === pal}
              className={'flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-0 px-2 py-1.5 ' + (k === pal ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-cream')}>
              <span className="flex" aria-hidden="true">
                {Object.values(PALETTES[k].vars).map((c) => <span key={c} className="-ml-1 h-3.5 w-3.5 rounded-full border border-ink first:ml-0" style={{ background: c }} />)}
              </span>
              {PALETTES[k].name}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
