// The profile lives in localStorage (instant start, works offline) and, when Supabase is set
// up, in the `profiles` table too. See profileSync.ts for the server side.
import type { Profile } from '../types'
import { guessMotherTongue } from '../lib/languages'
import { createStore, useStore } from './createStore'

const KEY = 'wt-profile-phase1'

function defaultProfile(): Profile {
  return {
    id: 'me',
    motherTongue: guessMotherTongue(),
    ageRange: null,
    targetLanguage: 'sv',
    level: 'unknown',
    levelNote: '',
    walkMinutes: 20,
    showRomaji: true,
    learningStyle: [],
    courseProgress: {},
    createdAt: Date.now(),
    onboarded: false,
  }
}

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...defaultProfile(), ...JSON.parse(raw) }
  } catch {
    // storage blocked: fall through to defaults
  }
  return defaultProfile()
}

const store = createStore<Profile>(load())

store.subscribe(() => {
  try {
    localStorage.setItem(KEY, JSON.stringify(store.get()))
  } catch {
    // ignore
  }
})

export function useProfile(): Profile {
  return useStore(store)
}

/** Current profile outside React (e.g. in tool handlers during a call). */
export function getProfile(): Profile {
  return store.get()
}

export function updateProfile(patch: Partial<Profile>) {
  store.set((p) => ({ ...p, ...patch }))
}

/** Replace the whole profile (e.g. with the copy from the server after signing in). */
export function replaceProfile(profile: Profile) {
  store.set(profile)
}

export function subscribeProfile(listener: () => void) {
  return store.subscribe(listener)
}

/** Forget everything on this device. */
export function resetLocalProfile() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
  store.set(defaultProfile())
}
