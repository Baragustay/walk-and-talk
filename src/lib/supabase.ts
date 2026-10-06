import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Public values (safe in the browser: Row Level Security protects the data).
// Set in .env.production / .env. Without them the app runs on this device only.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Our token server: a Supabase Edge Function (supabase/functions/live-token). */
export const liveTokenUrl = url ? `${url}/functions/v1/live-token` : null
export const supabaseAnonKey = anonKey ?? ''
export const speakUrl = url ? `${url}/functions/v1/speak` : null

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { flowType: 'pkce', persistSession: true } }) : null
