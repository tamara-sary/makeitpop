import { useState, type FormEvent } from 'react'
import { BreakStuff } from '../components/BreakStuff'
import { Win, useToast } from '../components/ui'
import { SAMPLE_RANTS } from '../data/days'
import { useStored } from '../lib/store'

type Rant = { id: string; text: string; same: number; hugs: number; sample?: boolean }

export default function SteamRoom() {
  const [mine, setMine] = useStored<Rant[]>('rants', [])
  const [reacts, setReacts] = useStored<Record<string, { same: number; hugs: number }>>('rant-reacts', {})
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const toast = useToast()

  const rants = [...mine, ...SAMPLE_RANTS].map((r) => ({
    ...r,
    same: r.same + (reacts[r.id]?.same ?? 0),
    hugs: r.hugs + (reacts[r.id]?.hugs ?? 0),
  }))
  const react = (id: string, k: 'same' | 'hugs') =>
    setReacts((x) => ({ ...x, [id]: { same: x[id]?.same ?? 0, hugs: x[id]?.hugs ?? 0, [k]: (x[id]?.[k] ?? 0) + 1 } }))

  function post(e: FormEvent) {
    e.preventDefault()
    if (text.trim().length < 5) { setErr('Write at least a few words.'); return }
    setMine((m) => [{ id: 'u' + Date.now(), text: text.trim(), same: 0, hugs: 0 }, ...m])
    setText(''); setErr(''); toast('Posted anonymously')
  }

  return (
    <div className="grid gap-10">
      <header className="grid max-w-[62ch] gap-2">
        <h1 className="text-4xl sm:text-5xl">Steam room</h1>
        <p className="text-[17px]">Ghosted again? Rejected after round 3? You're in the right place. Break some stuff, then say it out loud. Nobody here will ask you to make it pop.</p>
      </header>

      <Win title="break_stuff.exe" bodyClass="p-4 sm:p-5">
        <BreakStuff />
      </Win>

      <section className="grid gap-4" aria-labelledby="rant-h">
        <h2 id="rant-h" className="text-3xl">Rant wall</h2>
        <form onSubmit={post} className="win grid gap-3 p-4" noValidate>
          <label htmlFor="rant" className="font-display text-lg font-extrabold">Get it off your chest. Posted anonymously.</label>
          <textarea id="rant" className="field min-h-24" placeholder="Today I got…" value={text} onChange={(e) => setText(e.target.value)} aria-describedby="rant-rule" aria-invalid={!!err} />
          <p id="rant-rule" className="text-[13px] text-muted">House rule: punch at the process, never at people. No names, no companies.</p>
          {err && <p className="text-[14px] font-semibold">⚠ {err}</p>}
          <div><button className="btn" type="submit">Post rant</button></div>
        </form>
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
          {rants.map((r, i) => (
            <li key={r.id} className={`note ${['bg-paper', 'bg-mint', 'bg-sun'][i % 3]}`}>
              {r.sample && <span className="font-pixel text-[11px]">SAMPLE</span>}
              <p className="text-[16px]">{r.text}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="chip cursor-pointer hover:bg-sun" onClick={() => react(r.id, 'same')}>Same 🫠 {r.same}</button>
                <button type="button" className="chip cursor-pointer hover:bg-pink" onClick={() => react(r.id, 'hugs')}>Hug contents 🤗 {r.hugs}</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
