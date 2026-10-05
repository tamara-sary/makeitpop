import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DAYS, TODAY, type Crit } from '../data/days'
import { load, save } from '../lib/store'
import { shotKey, useProfile, type Profile as P, type Shot } from '../lib/profile'
import { STICKY_BG } from '../components/Stickies'
import { useToast } from '../components/ui'

// Your profile: your remixes (shots) and your crits across all days.
// Prototype: "joining" just names you in this browser. Nobody else sees any of it yet.
export default function Profile() {
  const [profile, setProfile] = useProfile()
  if (!profile) return <Join onJoin={setProfile} />
  return <Dashboard profile={profile} onLeave={() => setProfile(null)} />
}

function Join({ onJoin }: { onJoin: (p: P) => void }) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState<P['level']>('Mid')
  const [linkedin, setLinkedin] = useState('')
  return (
    <div className="mx-auto grid w-full max-w-xl gap-6">
      <header className="grid gap-2">
        <h1 className="text-4xl sm:text-5xl">Make your profile</h1>
        <p className="text-[17px]">Your crits and remixes in one place, so you can see how your eye changes over 30 days.</p>
      </header>
      <form className="win grid gap-4 p-5" onSubmit={(e) => { e.preventDefault(); onJoin({ name: name.trim(), level, linkedin: linkedin.trim() || undefined, joined: Date.now() }) }}>
        <label className="grid gap-1.5">
          <span className="font-semibold">Your name</span>
          <input className="field" required minLength={2} autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <fieldset className="m-0 grid gap-1.5 border-0 p-0">
          <legend className="mb-1.5 font-semibold">Level</legend>
          <div className="flex gap-2">
            {(['Mid', 'Senior'] as const).map((l) => (
              <label key={l} className={'chip cursor-pointer px-3 py-2 text-[14px] ' + (level === l ? 'bg-sun' : '')}>
                <input type="radio" name="level" className="sr-only" checked={level === l} onChange={() => setLevel(l)} />{l}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-1.5">
          <span className="font-semibold">LinkedIn <span className="font-normal text-muted">(optional, for credit when you post)</span></span>
          <input className="field" type="url" placeholder="https://linkedin.com/in/…" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
        </label>
        <button type="submit" className="btn w-fit">Make my profile</button>
        <p className="text-[13px] text-muted">Prototype: there are no accounts yet. Your profile lives in this browser only. Nobody else can see it.</p>
      </form>
    </div>
  )
}

function Dashboard({ profile, onLeave }: { profile: P; onLeave: () => void }) {
  const toast = useToast()
  const [tick, setTick] = useState(0) // re-read storage after removing a shot
  const open = DAYS.filter((d) => d.n <= TODAY)
  void tick
  const shots = open.map((d) => ({ day: d, shot: load<Shot | null>(shotKey(d.n), null) })).filter((x) => x.shot)
  const crits = open.flatMap((d) => load<Crit[]>(`crits:${d.n}`, []).map((c) => ({ day: d, crit: c })))

  return (
    <div className="grid gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <span className="chip w-fit bg-sun">{profile.level} designer</span>
          <h1 className="text-4xl sm:text-5xl">{profile.name}</h1>
          <p className="text-muted">Joined {new Date(profile.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} · {crits.length} crit{crits.length === 1 ? '' : 's'} · {shots.length} remix{shots.length === 1 ? '' : 'es'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.linkedin && <a className="btn btn-ghost btn-sm" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
          <Link className="btn btn-sm" to="/today">Today's challenge →</Link>
        </div>
      </header>

      <p className="w-fit border-2 border-ink bg-paper px-3 py-2 text-[14px]"><strong>Who sees this?</strong> Only you, in this browser. To show a remix, post it on LinkedIn.</p>

      <section className="grid gap-4" aria-labelledby="my-remixes">
        <h2 id="my-remixes" className="text-3xl">Your remixes</h2>
        {shots.length === 0 ? (
          <Empty text="No remixes yet. Drop your shot into the “Your remix” frame on any day." cta="Go to today's remix" to="/today" />
        ) : (
          <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {shots.map(({ day, shot }) => (
              <li key={day.n} className="win grid content-start">
                <Link to={day.n === TODAY ? '/today' : `/day/${day.n}`} className="block border-b-2 border-ink bg-[#f3eee6]">
                  <img src={shot!.src} alt={`Your remix of Day ${day.n}: ${day.title}`} className="block aspect-[16/10] w-full object-cover object-top" />
                </Link>
                <div className="grid gap-2 p-4">
                  <span className="font-pixel text-[12px]">DAY {String(day.n).padStart(2, '0')}</span>
                  <strong className="leading-snug">{day.title}</strong>
                  <span className="text-[13px] text-muted">Added {new Date(shot!.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  <button type="button" className="w-fit cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold underline"
                    onClick={() => { save(shotKey(day.n), null); setTick((t) => t + 1); toast('Shot removed') }}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4" aria-labelledby="my-crits">
        <h2 id="my-crits" className="text-3xl">Your crits</h2>
        {crits.length === 0 ? (
          <Empty text="No crits yet. Pin one on today's design: it also unlocks everyone else's." cta="Crit today's design" to="/today" />
        ) : (
          <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {crits.map(({ day, crit }, i) => (
              <li key={crit.id} className="grid content-start gap-2 border-2 border-ink p-4 shadow-[4px_4px_0_#161616]"
                style={{ background: STICKY_BG[crit.color ?? 'sun'], transform: `rotate(${[-1.5, 1, -0.6, 1.4][i % 4]}deg)` }}>
                <p className="font-medium leading-snug">{crit.text}</p>
                <Link to={day.n === TODAY ? '/today' : `/day/${day.n}`} className="font-pixel text-[11px] text-ink">DAY {String(day.n).padStart(2, '0')} · SEE IT ON THE DESIGN →</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button type="button" className="w-fit cursor-pointer border-0 bg-transparent p-0 text-[13px] text-muted underline" onClick={onLeave}>Sign out (forget my name on this browser)</button>
    </div>
  )
}

function Empty({ text, cta, to }: { text: string; cta: string; to: string }) {
  return (
    <div className="grid justify-items-start gap-3 border-2 border-dashed border-ink/40 p-6">
      <p>{text}</p>
      <Link className="btn btn-sm" to={to}>{cta}</Link>
    </div>
  )
}
