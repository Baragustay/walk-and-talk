// One row per call (the `walks` table), for the stats on Me.
import { supabase } from '../lib/supabase'
import type { Topic, Walk } from '../types'
import { getAuth, onAuthChange } from './auth'
import { createStore, useStore } from './createStore'

const KEY = 'wt-walks'
const store = createStore<Walk[]>(
  (() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]')
    } catch {
      return []
    }
  })(),
)
store.subscribe(() => {
  try {
    localStorage.setItem(KEY, JSON.stringify(store.get()))
  } catch {
    // ignore
  }
})

export const useWalks = () => useStore(store)

const accountId = () => {
  const a = getAuth()
  return a.status === 'anonymous' || a.status === 'signedIn' ? a.userId : null
}

let loadedFor: string | null = null

export function startWalkSync() {
  if (!supabase) return
  const onAuth = async () => {
    const id = accountId()
    if (!id) {
      if (loadedFor) store.set([])
      loadedFor = null
      return
    }
    if (id === loadedFor) return
    loadedFor = id
    const { data, error } = await supabase!.from('walks').select('*').order('started_at', { ascending: false }).limit(200)
    if (error) return console.warn('Loading walks failed', error.message)
    store.set(
      (data as { id: string; started_at: string; ended_at: string | null; minutes: number; topic: Topic; had_photo: boolean }[]).map(
        (r) => ({
          id: r.id,
          startedAt: Date.parse(r.started_at),
          endedAt: r.ended_at ? Date.parse(r.ended_at) : Date.parse(r.started_at),
          minutes: r.minutes,
          topic: r.topic,
          hadPhoto: r.had_photo,
        }),
      ),
    )
  }
  onAuthChange(() => void onAuth())
  void onAuth()
}

export function recordWalk(w: Omit<Walk, 'id'>) {
  const local: Walk = { ...w, id: `local-${w.startedAt}` }
  store.set((all) => [local, ...all])
  if (!supabase || !accountId()) return
  void supabase
    .from('walks')
    .insert({
      started_at: new Date(w.startedAt).toISOString(),
      ended_at: new Date(w.endedAt).toISOString(),
      minutes: w.minutes,
      topic: w.topic,
      had_photo: w.hadPhoto,
    })
    .then(({ error }) => error && console.warn('Saving walk failed', error.message))
}

export function resetLocalWalks() {
  loadedFor = null
  store.set([])
}

const WEEK = 7 * 24 * 60 * 60 * 1000

export function walkStats(walks: Walk[], now = Date.now()) {
  return {
    walksThisWeek: walks.filter((w) => now - w.startedAt < WEEK).length,
    minutesSpoken: walks.reduce((sum, w) => sum + w.minutes, 0),
  }
}
