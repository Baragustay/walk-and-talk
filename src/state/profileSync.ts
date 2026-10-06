// Keeps the local profile and the Supabase `profiles` row in step.
// - When an account appears (trial or sign-in): load its row. If there is one, it wins
//   (e.g. signing in on a new phone). If not, save the local profile as the first row.
// - After that, every local change is saved (debounced).
import { supabase } from '../lib/supabase'
import type { AgeRange } from '../lib/age'
import type { Level, Profile, TargetLanguage } from '../types'
import { getAuth, onAuthChange } from './auth'
import { createStore, useStore } from './createStore'
import { getProfile, replaceProfile, subscribeProfile } from './profile'

interface ProfileRow {
  id: string
  mother_tongue: string
  age_range: AgeRange | null
  target_language: TargetLanguage
  level: Level
  level_note: string
  walk_minutes: number
  show_romaji: boolean
  learning_style: string[]
  course_progress: Partial<Record<TargetLanguage, number>>
  onboarded: boolean
  created_at: string
}

function toRow(p: Profile, userId: string): Omit<ProfileRow, 'created_at'> {
  return {
    id: userId,
    mother_tongue: p.motherTongue,
    age_range: p.ageRange,
    target_language: p.targetLanguage,
    level: p.level,
    level_note: p.levelNote,
    walk_minutes: p.walkMinutes,
    show_romaji: p.showRomaji,
    learning_style: p.learningStyle,
    course_progress: p.courseProgress,
    onboarded: p.onboarded,
  }
}

function fromRow(r: ProfileRow): Profile {
  return {
    id: 'me',
    motherTongue: r.mother_tongue,
    ageRange: r.age_range,
    targetLanguage: r.target_language,
    level: r.level,
    levelNote: r.level_note,
    walkMinutes: r.walk_minutes,
    showRomaji: r.show_romaji,
    learningStyle: r.learning_style ?? [],
    courseProgress: r.course_progress ?? {},
    onboarded: r.onboarded,
    createdAt: Date.parse(r.created_at),
  }
}

let syncedUser: string | null = null

/** Which account's profile has been loaded from the server (null = none yet). */
const loadedStore = createStore<string | null>(null)
export const useProfileLoadedFor = () => useStore(loadedStore)
let applyingRemote = false
let saveTimer: ReturnType<typeof setTimeout> | undefined

async function save(userId: string) {
  const { error } = await supabase!.from('profiles').upsert(toRow(getProfile(), userId))
  if (error) console.warn('Saving profile failed', error.message)
}

async function loadFor(userId: string) {
  const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) {
    console.warn('Loading profile failed', error.message)
    return
  }
  syncedUser = userId
  if (data) {
    applyingRemote = true
    replaceProfile(fromRow(data as ProfileRow))
    applyingRemote = false
  } else {
    await save(userId)
  }
  loadedStore.set(userId)
}

export function startProfileSync() {
  if (!supabase) return
  const onAuth = () => {
    const a = getAuth()
    const userId = a.status === 'anonymous' || a.status === 'signedIn' ? a.userId : null
    if (userId && userId !== syncedUser) void loadFor(userId)
    if (!userId) syncedUser = null
  }
  onAuthChange(onAuth)
  onAuth()

  subscribeProfile(() => {
    if (applyingRemote || !syncedUser) return
    const userId = syncedUser
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => void save(userId), 600)
  })
}
