// Who is signed in (Google via Supabase Auth) + the sign-in/out actions.
// Loading stays true until the stored session is read so /me never flashes the sign-in window at a signed-in user.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

type AuthValue = {
  loading: boolean
  user: User | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthValue>({
  loading: true,
  user: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
})
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Not configured → no session to wait for, so loading starts false.
  const [loading, setLoading] = useState(() => Boolean(supabase))
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!supabase) return
    let live = true
    supabase.auth.getSession().then(({ data }) => {
      if (!live) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })
    return () => {
      live = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
  }

  return (
    <AuthCtx.Provider value={{ loading, user: session?.user ?? null, signInWithGoogle, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}
