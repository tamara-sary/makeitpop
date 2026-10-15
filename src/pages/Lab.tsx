import { Link, Navigate, useParams } from 'react-router-dom'
import LandingA from '../landing/LandingA'
import LandingB from '../landing/LandingB'
import LandingC from '../landing/LandingC'

// Landing lab: compare layout options side by side before one replaces Home. Local exploration only.
const OPTIONS = {
  a: { name: 'Poster', C: LandingA },
  b: { name: 'Comic strip', C: LandingB },
  c: { name: 'Colour slabs', C: LandingC },
} as const

export default function Lab() {
  const { v = 'a' } = useParams()
  const opt = OPTIONS[v as keyof typeof OPTIONS]
  if (!opt) return <Navigate to="/lab/a" replace />
  return (
    <>
      <opt.C />
      <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-1 border-2 border-ink bg-paper p-1 shadow-pop-md" aria-label="Landing options">
        {Object.entries(OPTIONS).map(([k, o]) => (
          <Link key={k} to={`/lab/${k}`} className={'px-3 py-1.5 text-ui font-bold no-underline ' + (k === v ? 'bg-ink text-pop-sun' : 'text-ink hover:bg-pop-sun')}>
            {k.toUpperCase()} · {o.name}
          </Link>
        ))}
      </nav>
    </>
  )
}
