import { useState, type FormEvent } from 'react'
import { CRIT_TAGS, type Crit } from '../data/days'
import { useToast } from './ui'

const TONES = ['bg-sun', 'bg-mint', 'bg-paper', 'bg-pink']
const TILTS = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]', 'rotate-[0.7deg]']

export function CritList({ crits, onAgree, compact = false }: { crits: Crit[]; onAgree: (id: string) => void; compact?: boolean }) {
  if (!crits.length) return <p className="text-muted">No crits yet. Be the first to say what's off.</p>
  return (
    <ul className={'m-0 grid list-none gap-4 p-0 ' + (compact ? '' : 'sm:grid-cols-2')}>
      {crits.map((c, i) => (
        <li key={c.id} className={`note ${TONES[i % TONES.length]} ${TILTS[i % TILTS.length]}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{c.tag}</span>
            {c.sample && <span className="font-pixel text-[11px]">SAMPLE</span>}
          </div>
          <p className="text-[15px]">{c.text}</p>
          <div className="flex items-center justify-between gap-2">
            <small className="text-[12px]">{c.name} · {c.level}</small>
            <button type="button" className="chip cursor-pointer hover:bg-sun" onClick={() => onAgree(c.id)} aria-label={`Agree with ${c.name}'s crit, ${c.agrees} agree`}>
              +1 agree · {c.agrees}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function CritForm({ onAdd }: { onAdd: (c: Omit<Crit, 'id' | 'agrees'>) => void }) {
  const [text, setText] = useState('')
  const [tag, setTag] = useState(CRIT_TAGS[0])
  const [name, setName] = useState('')
  const [level, setLevel] = useState<'Mid' | 'Senior'>('Mid')
  const [err, setErr] = useState('')
  const toast = useToast()

  function submit(e: FormEvent) {
    e.preventDefault()
    if (text.trim().length < 15) {
      setErr('Say a bit more. What is off, and why? (15+ characters)')
      return
    }
    onAdd({ text: text.trim(), tag, name: name.trim() || 'Anonymous', level })
    setText('')
    setErr('')
    toast('Crit posted')
  }

  return (
    <form onSubmit={submit} className="grid gap-3 border-2 border-ink bg-paper p-4" noValidate>
      <label htmlFor="crit-text" className="font-display text-lg font-extrabold">Leave a crit</label>
      <textarea
        id="crit-text"
        className="field min-h-24"
        placeholder="What's the one thing you'd change first, and why?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-invalid={!!err}
        aria-describedby={err ? 'crit-err' : undefined}
      />
      {err && <p id="crit-err" className="text-[14px] font-semibold">⚠ {err}</p>}
      <div className="grid gap-3">
        <label className="grid gap-1 text-[13px] font-semibold" htmlFor="crit-tag">About
          <select id="crit-tag" className="field" value={tag} onChange={(e) => setTag(e.target.value)}>
            {CRIT_TAGS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-[13px] font-semibold" htmlFor="crit-name">Name
          <input id="crit-name" className="field" placeholder="Anonymous" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold" htmlFor="crit-level">Level
          <select id="crit-level" className="field" value={level} onChange={(e) => setLevel(e.target.value as 'Mid' | 'Senior')}>
            <option>Mid</option>
            <option>Senior</option>
          </select>
        </label>
      </div>
      <div><button className="btn" type="submit">Post crit</button></div>
    </form>
  )
}
