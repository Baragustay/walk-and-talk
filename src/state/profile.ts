// PHASE 1 STAND-IN: keeps the profile in localStorage. Phase 2 replaces this with Dexie.
import type { Profile } from '../types'
import { guessMotherTongue } from '../lib/languages'
import { createStore, useStore } from './createStore'

const KEY = 'wt-profile-phase1'

function defaultProfile(): Profile {
  return {
    id: 'me',
    motherTongue: guessMotherTongue(),
    targetLanguage: 'sv',
    level: 'unknown',
    levelNote: '',
    walkMinutes: 20,
    showRomaji: true,
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

export function updateProfile(patch: Partial<Profile>) {
  store.set((p) => ({ ...p, ...patch }))
}

export function deleteAllData() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
  store.set(defaultProfile())
}
