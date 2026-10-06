// Who is using the app. New users get an anonymous Supabase account on their first call,
// so trial progress is saved. "Save your progress" then attaches Google or email to that
// same account, so nothing is lost.
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { createStore, useStore } from './createStore'

export type AuthState =
  | { status: 'disabled' } // no Supabase configured: device-only mode
  | { status: 'loading' }
  | { status: 'none' } // no account yet (first visit)
  | { status: 'anonymous'; userId: string } // trying it out, not saved to a login yet
  | { status: 'signedIn'; userId: string; email: string | null; name: string | null; avatarUrl: string | null }

const store = createStore<AuthState>(supabase ? { status: 'loading' } : { status: 'disabled' })

function fromSession(session: Session | null): AuthState {
  if (!session) return { status: 'none' }
  const u = session.user
  if (u.is_anonymous) return { status: 'anonymous', userId: u.id }
  // Google puts the photo and name in user_metadata.
  const meta = (u.user_metadata ?? {}) as Record<string, string | undefined>
  return {
    status: 'signedIn',
    userId: u.id,
    email: u.email ?? null,
    name: meta.full_name || meta.name || null,
    avatarUrl: meta.avatar_url || meta.picture || null,
  }
}

/**
 * The stored session can be out of date: after linking Google or confirming an email, the saved
 * token still says "anonymous" until it's refreshed. Ask the server, and refresh if it changed.
 */
async function settle(session: Session | null): Promise<AuthState> {
  if (!supabase || !session?.user.is_anonymous) return fromSession(session)
  const { data } = await supabase.auth.getUser()
  if (data.user && !data.user.is_anonymous) {
    const refreshed = await supabase.auth.refreshSession()
    return fromSession(refreshed.data.session ?? session)
  }
  return fromSession(session)
}

/**
 * Errors from Google/Supabase come back in the address (?error_code=... or #error_code=...).
 * "identity_already_exists": this Google account already belongs to an account (e.g. linked
 * on an earlier try). Then just sign in to that account.
 */
const authErrorStore = createStore<string | null>(null)
export const useAuthError = () => useStore(authErrorStore)

function readAuthErrorFromUrl() {
  const params = new URLSearchParams(location.search + '&' + location.hash.replace(/^#/, ''))
  const code = params.get('error_code')
  const description = params.get('error_description')
  if (!code && !description) return
  // Clean the address so a reload doesn't repeat this.
  history.replaceState(null, '', location.pathname)
  if (code === 'identity_already_exists' && supabase) {
    void supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/` } })
    return
  }
  authErrorStore.set(description?.replace(/\+/g, ' ') || 'Signing in didn’t work. Please try again.')
}

if (supabase) {
  readAuthErrorFromUrl()
  void supabase.auth.getSession().then(async ({ data }) => store.set(await settle(data.session)))
  supabase.auth.onAuthStateChange((_event, session) => {
    // Can't await Supabase calls inside this callback (it deadlocks), so settle afterwards.
    store.set(fromSession(session))
    if (session?.user.is_anonymous) setTimeout(() => void settle(session).then((s) => store.set(s)), 0)
  })
}

export function useAuth(): AuthState {
  return useStore(store)
}

export function getAuth(): AuthState {
  return store.get()
}

export function onAuthChange(listener: (s: AuthState) => void) {
  return store.subscribe(() => listener(store.get()))
}

/** Access token for our own server (the Gemini token endpoint). Creates a trial account if needed. */
export async function accessToken(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session.access_token
  const { data: anon, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return anon.session?.access_token ?? null
}

const redirectTo = () => `${window.location.origin}/`

/** Keep progress with Google. Trial users get Google attached; others just sign in. */
export async function continueWithGoogle() {
  if (!supabase) return
  const options = { redirectTo: redirectTo() }
  const { error } =
    store.get().status === 'anonymous'
      ? await supabase.auth.linkIdentity({ provider: 'google', options })
      : await supabase.auth.signInWithOAuth({ provider: 'google', options })
  if (error) throw error
}

/** Keep progress with an email link. Trial users get the email attached to their account. */
export async function continueWithEmail(email: string) {
  if (!supabase) return
  const { error } =
    store.get().status === 'anonymous'
      ? await supabase.auth.updateUser({ email }, { emailRedirectTo: redirectTo() })
      : await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } })
  if (error) throw error
}

/** Returning user on a new device: sign in to the existing account (leaves the trial behind). */
export async function signInExisting(method: { google: true } | { email: string }) {
  if (!supabase) return
  if ('google' in method) {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } })
    if (error) throw error
  } else {
    const { error } = await supabase.auth.signInWithOtp({ email: method.email, options: { emailRedirectTo: redirectTo() } })
    if (error) throw error
  }
}

export async function signOut() {
  await supabase?.auth.signOut()
}

/** Deletes the account on the server (profile, walks and words go with it). */
export async function deleteAccount() {
  if (!supabase || !(await supabase.auth.getSession()).data.session) return
  const { error } = await supabase.rpc('delete_my_account')
  if (error) throw error
  await supabase.auth.signOut()
}

/** After onboarding: saving progress (logging in) is required, unless accounts are off. */
export function pathAfterOnboarding(): string {
  const s = store.get().status
  return s === 'disabled' || s === 'signedIn' ? '/' : '/account?from=onboarding'
}

/** Accounts are on but this person hasn't logged in (trial account or none). */
export function needsLogin(s: AuthState): boolean {
  return s.status === 'none' || s.status === 'anonymous'
}
