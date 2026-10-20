// Where Google (or a magic-link email click) bounces back. Handles both shapes:
//  - ?code=...            → PKCE exchange (Google OAuth)
//  - #access_token=...    → magic link / implicit tokens → setSession
//  - #error_description=  → expired/used link, shown in a friendly window
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Win } from '../components/ui'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const nav = useNavigate()
  const [failed, setFailed] = useState<string | null>(null)
  // Derived during render so the effect never sets state synchronously.
  const configError = supabase
    ? null
    : 'Sign-in is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see .env.example).'
  const error = failed ?? configError

  useEffect(() => {
    const sb = supabase
    if (!sb || configError) return
    let live = true
    const params = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.slice(1))

    const run = async () => {
      const hashError = params.get('error_description') ?? hash.get('error_description')
      if (hashError) {
        if (live) setFailed(hashError + ' Send yourself a new link.')
        return
      }
      const code = params.get('code')
      if (code) {
        const { error: e } = await sb.auth.exchangeCodeForSession(code)
        if (!live) return
        if (e) setFailed(e.message)
        else nav('/me', { replace: true })
        return
      }
      const access_token = hash.get('access_token')
      const refresh_token = hash.get('refresh_token')
      if (access_token && refresh_token) {
        const { error: e } = await sb.auth.setSession({ access_token, refresh_token })
        if (!live) return
        if (e) setFailed(e.message)
        else nav('/me', { replace: true })
        return
      }
      if (live) setFailed('This sign-in link has no code in it. Go back and send yourself a new one.')
    }
    void run()
    return () => { live = false }
  }, [nav, configError])

  return (
    <div className="mx-auto grid w-full max-w-md gap-4 pt-6">
      <Win title={error ? 'sign-in.failed' : 'signing-in…'} bodyClass="p-5">
        {error ? (
          <div className="grid gap-3">
            <p role="alert">{error}</p>
            <button type="button" className="btn w-fit" onClick={() => nav('/me', { replace: true })}>Back to profile</button>
          </div>
        ) : (
          <p role="status">Opening your profile…</p>
        )}
      </Win>
    </div>
  )
}
