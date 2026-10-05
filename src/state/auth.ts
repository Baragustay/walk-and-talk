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
  | { status: 'signedIn'; userId: string; email: string | null }

const store = createStore<AuthState>(supabase ? { status: 'loading' } : { status: 'disabled' })

function fromSession(session: Session | null): AuthState {
  if (!session) return { status: 'none' }
  const u = session.user
  return u.is_anonymous ? { status: 'anonymous', userId: u.id } : { status: 'signedIn', userId: u.id, email: u.email ?? null }
}

if (supabase) {
  void supabase.auth.getSession().then(({ data }) => store.set(fromSession(data.session)))
  supabase.auth.onAuthStateChange((_event, session) => store.set(fromSession(session)))
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
  if (!supabase || store.get().status === 'none') return
  const { error } = await supabase.rpc('delete_my_account')
  if (error) throw error
  await supabase.auth.signOut()
}

/** After onboarding: offer "Keep your progress" unless accounts are off or already saved. */
export function pathAfterOnboarding(): string {
  const s = store.get().status
  return s === 'disabled' || s === 'signedIn' ? '/' : '/account?from=onboarding'
}
