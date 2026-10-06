// Start again as a brand-new user (for "Let's start", testing, and ?reset).
// Trial accounts are deleted (so test runs don't pile up); real accounts are only signed out.
import { supabase } from '../lib/supabase'
import { deleteAccount, signOut } from './auth'
import { resetLocalProfile } from './profile'
import { resetLocalWalks } from './walks'
import { resetLocalWords } from './words'

export async function startFresh() {
  try {
    // Ask Supabase directly: at app start the auth state may not be loaded yet.
    const session = supabase ? (await supabase.auth.getSession()).data.session : null
    if (session?.user.is_anonymous) await deleteAccount()
    else if (session) await signOut()
  } catch {
    await signOut() // offline or already gone: at least drop the session
  }
  resetLocalProfile()
  resetLocalWords()
  resetLocalWalks()
  try {
    // App data only; leaves e.g. the call-log setting alone.
    for (const key of Object.keys(localStorage)) if (key.startsWith('wt-') && key !== 'wt-call-debug') localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
