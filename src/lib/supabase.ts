// Supabase client: the "real auth" the prototype TODOs in lib/profile.ts pointed at.
// Config comes from .env.local (dev) / Vercel env vars — see .env.example.
// No keys → supabase is null and the sign-in screen explains setup instead of crashing.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

let client: SupabaseClient | null = null
if (url && key) {
  client = createClient(url, key, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      // /auth/callback exchanges the ?code itself, so the router must not also try to parse it.
      detectSessionInUrl: false,
    },
  })
}

export const supabase = client
export const isSupabaseConfigured = Boolean(client)
