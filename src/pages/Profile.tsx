import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { track } from '../lib/analytics'
import { Link } from 'react-router-dom'
import { DAYS, TODAY, type Crit } from '../data/days'
import { load, save } from '../lib/store'
import { shotKey, useProfile, type Profile as P, type Shot } from '../lib/profile'
import { useAuth } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import { STICKY_BG } from '../components/Stickies'
import { GoogleG } from '../components/GoogleG'
import { useToast } from '../components/ui'

// Your profile: your remixes (shots) and your crits across all days.
// Sign-in is Google via Supabase; level/linkedin and the shots + stickies still live in this browser.
export default function Profile() {
  const { loading, user } = useAuth()
  const [profile, setProfile] = useProfile()
  if (loading) return <p role="status" className="mx-auto w-full max-w-xl pt-8 text-body text-muted">Checking your session…</p>
  if (!user) return <SignInWindow />
  if (!profile) return <Join user={user} onJoin={setProfile} />
  return <Dashboard profile={profile} user={user} onLeave={() => setProfile(null)} />
}

function SignInWindow() {
  const { signInWithGoogle } = useAuth()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const go = async () => {
    if (!isSupabaseConfigured) {
      setErr('Sign-in is not configured yet — add the Supabase env vars from .env.example, then rebuild.')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      track('sign_in_google')
      await signInWithGoogle()
      // success: the page navigates away to Google
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not reach Google. Try again.')
      setBusy(false)
    }
  }
  return (
    <div className="mx-auto grid w-full max-w-xl gap-6">
      <header className="grid gap-2">
        <h1 className="text-4xl sm:text-5xl">Your profile, one click away</h1>
        <p className="text-lead">Sign in with Google and your profile opens: your stickies and remixes, day by day.</p>
      </header>
      <div className="win grid gap-4 p-5">
        <button type="button" className="btn w-fit" disabled={busy} aria-busy={busy} onClick={() => void go()}>
          <span className="inline-flex items-center gap-2"><GoogleG />{busy ? 'Opening Google…' : 'Continue with Google'}</span>
        </button>
        {err && <p role="alert" className="text-ui">{err}</p>}
        <p className="text-ui text-muted">Signing in tells us who you are. Your stickies, agrees and remix shots still save in this browser only.</p>
      </div>
    </div>
  )
}

function Join({ user, onJoin }: { user: User; onJoin: (p: P) => void }) {
  const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string; avatar_url?: string }
  const [name, setName] = useState(meta.full_name || meta.name || '')
  const [level, setLevel] = useState<P['level']>('Mid')
  const [linkedin, setLinkedin] = useState('')
  return (
    <div className="mx-auto grid w-full max-w-xl gap-6">
      <header className="grid gap-2">
        <h1 className="text-4xl sm:text-5xl">Make your profile</h1>
        <p className="text-[17px]">Your stickies and remixes in one place, so you can see how your eye changes over 30 days.</p>
      </header>
      <div className="flex items-center gap-3 border-2 border-ink bg-paper px-3 py-2">
        {meta.avatar_url && <img src={meta.avatar_url} alt="" className="h-9 w-9 border-2 border-ink object-cover" />}
        <p className="text-body-sm"><strong>Signed in as {user.email}</strong><br /><span className="text-muted">via Google</span></p>
      </div>
      <form className="win grid gap-4 p-5" onSubmit={(e) => { e.preventDefault(); track('profile_created', { level }); onJoin({ name: name.trim(), level, linkedin: linkedin.trim() || undefined, joined: Date.now() }) }}>
        <label className="grid gap-1.5">
          <span className="font-semibold">Your name <span className="font-normal text-muted">(from Google — change it if you like)</span></span>
          <input className="field" required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
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
        <p className="text-[13px] text-muted">Your Google sign-in is real; level, link and stickies still save in this browser only for now.</p>
      </form>
    </div>
  )
}

function Dashboard({ profile, user, onLeave }: { profile: P; user: User; onLeave: () => void }) {
  const toast = useToast()
  const { signOut } = useAuth()
  const meta = (user.user_metadata ?? {}) as { avatar_url?: string }
  const [tick, setTick] = useState(0) // re-read storage after removing a shot
  const open = DAYS.filter((d) => d.n <= TODAY)
  void tick
  const shots = open.map((d) => ({ day: d, shot: load<Shot | null>(shotKey(d.n), null) })).filter((x) => x.shot)
  const crits = open.flatMap((d) => load<Crit[]>(`crits:${d.n}`, []).map((c) => ({ day: d, crit: c })))

  return (
    <div className="grid gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          {meta.avatar_url && <img src={meta.avatar_url} alt="" className="h-12 w-12 border-2 border-ink object-cover" />}
          <span className="chip w-fit bg-sun">{profile.level} designer</span>
          <h1 className="text-4xl sm:text-5xl">{profile.name}</h1>
          <p className="text-muted">{user.email} · Joined {new Date(profile.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} · {crits.length} {crits.length === 1 ? 'sticky' : 'stickies'} · {shots.length} remix{shots.length === 1 ? '' : 'es'}</p>
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
        <h2 id="my-crits" className="text-3xl">Your stickies</h2>
        {crits.length === 0 ? (
          <Empty text="No stickies yet. Pin one on today's design: it also unlocks everyone else's." cta="Add a sticky to today's design" to="/today" />
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

      <button type="button" className="w-fit cursor-pointer border-0 bg-transparent p-0 text-[13px] text-muted underline" onClick={() => { onLeave(); void signOut() }}>Sign out (ends your Google session on this device)</button>
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
