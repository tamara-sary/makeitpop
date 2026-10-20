// Google bounces back here with ?code=... — trade it for a session, then continue to /me.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Win } from '../components/ui'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const nav = useNavigate()
  const code = new URLSearchParams(window.location.search).get('code')
  const [failed, setFailed] = useState<string | null>(null)
  // Derived during render so the effect never sets state synchronously.
  const setupError = !supabase
    ? 'Sign-in is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see .env.example).'
    : !code
      ? 'No sign-in code in the URL. Go back and try again.'
      : null
  const error = failed ?? setupError

  useEffect(() => {
    if (!supabase || !code) return
    let live = true
    supabase.auth.exchangeCodeForSession(code).then(({ error: e }) => {
      if (!live) return
      if (e) setFailed(e.message)
      else nav('/me', { replace: true })
    })
    return () => { live = false }
  }, [nav, code])

  return (
    <div className="mx-auto grid w-full max-w-md gap-4 pt-6">
      <Win title={error ? 'sign-in.failed' : 'signing-in…'} bodyClass="p-5">
        {error ? (
          <div className="grid gap-3">
            <p role="alert">{error}</p>
            <button type="button" className="btn w-fit" onClick={() => nav('/me', { replace: true })}>Back to profile</button>
          </div>
        ) : (
          <p role="status">Trading handshakes with Google…</p>
        )}
      </Win>
    </div>
  )
}
