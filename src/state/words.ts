// Saved words, with their review schedule. Stored in Supabase (`words` table) for the
// signed-in or trial account, plus a local copy so lists show instantly and work offline.
import { newSchedule, review } from '../lib/srs'
import { supabase } from '../lib/supabase'
import type { TargetLanguage, Word, WordReason } from '../types'
import { getAuth, onAuthChange } from './auth'
import { createStore, useStore } from './createStore'

const KEY = 'wt-words'

function loadLocal(): Word[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

const store = createStore<Word[]>(loadLocal())
store.subscribe(() => {
  try {
    localStorage.setItem(KEY, JSON.stringify(store.get()))
  } catch {
    // ignore
  }
})

export function useWords(lang: TargetLanguage): Word[] {
  return useStore(store).filter((w) => w.targetLanguage === lang)
}

export function getWords(lang: TargetLanguage): Word[] {
  return store.get().filter((w) => w.targetLanguage === lang)
}

export function dueWords(words: Word[], now = Date.now()): Word[] {
  return words.filter((w) => w.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt)
}

// ---- Supabase mapping ------------------------------------------------------

interface WordRow {
  id: string
  target_language: TargetLanguage
  target: string
  translation: string
  example: string
  reason: WordReason
  kana: string | null
  kanji: string | null
  romaji: string | null
  step: number
  due_at: string
  created_at: string
  last_reviewed_at: string | null
  times_remembered: number
  times_missed: number
}

const fromRow = (r: WordRow): Word => ({
  id: r.id,
  targetLanguage: r.target_language,
  target: r.target,
  translation: r.translation,
  example: r.example,
  reason: r.reason,
  kana: r.kana ?? undefined,
  kanji: r.kanji ?? undefined,
  romaji: r.romaji ?? undefined,
  step: r.step,
  dueAt: Date.parse(r.due_at),
  createdAt: Date.parse(r.created_at),
  lastReviewedAt: r.last_reviewed_at ? Date.parse(r.last_reviewed_at) : undefined,
  timesRemembered: r.times_remembered,
  timesMissed: r.times_missed,
})

const iso = (ms: number) => new Date(ms).toISOString()

function accountId(): string | null {
  const a = getAuth()
  return a.status === 'anonymous' || a.status === 'signedIn' ? a.userId : null
}

let loadedFor: string | null = null

async function loadFromServer(userId: string) {
  const { data, error } = await supabase!.from('words').select('*').order('created_at', { ascending: false })
  if (error) return console.warn('Loading words failed', error.message)
  loadedFor = userId
  // Server is the source of truth; keep local words that never reached it (e.g. saved offline).
  const server = (data as WordRow[]).map(fromRow)
  const unsynced = store.get().filter((w) => w.id.startsWith('local-'))
  store.set([...unsynced, ...server])
  for (const w of unsynced) void pushNew(w)
}

export function startWordSync() {
  if (!supabase) return
  const onAuth = () => {
    const id = accountId()
    if (id && id !== loadedFor) void loadFromServer(id)
    if (!id && loadedFor) {
      loadedFor = null
      store.set([]) // signed out: forget this person's words on the device
    }
  }
  onAuthChange(onAuth)
  onAuth()
}

async function pushNew(w: Word) {
  if (!supabase || !accountId()) return
  const { data, error } = await supabase
    .from('words')
    .insert({
      target_language: w.targetLanguage,
      target: w.target,
      translation: w.translation,
      example: w.example,
      reason: w.reason,
      kana: w.kana ?? null,
      kanji: w.kanji ?? null,
      romaji: w.romaji ?? null,
      step: w.step,
      due_at: iso(w.dueAt),
      created_at: iso(w.createdAt),
    })
    .select()
    .single()
  if (error) return console.warn('Saving word failed', error.message)
  const saved = fromRow(data as WordRow)
  store.set((all) => all.map((x) => (x.id === w.id ? saved : x)))
}

// ---- actions -----------------------------------------------------------------

export interface NewWord {
  targetLanguage: TargetLanguage
  target: string
  translation: string
  example?: string
  reason?: WordReason
  kana?: string
  kanji?: string
  romaji?: string
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/** Saves a word unless this language already has it. Returns the word (new or existing). */
export function saveWord(input: NewWord): Word {
  const existing = store.get().find((w) => w.targetLanguage === input.targetLanguage && same(w.target, input.target))
  if (existing) return existing
  const now = Date.now()
  const word: Word = {
    id: `local-${now}-${Math.random().toString(36).slice(2, 8)}`,
    targetLanguage: input.targetLanguage,
    target: input.target.trim(),
    translation: input.translation.trim(),
    example: input.example?.trim() ?? '',
    reason: input.reason ?? 'taught',
    kana: input.kana,
    kanji: input.kanji,
    romaji: input.romaji,
    ...newSchedule(now),
    createdAt: now,
    timesRemembered: 0,
    timesMissed: 0,
  }
  store.set((all) => [word, ...all])
  void pushNew(word)
  return word
}

/** "Got it" / "Not yet" on a flashcard, or Buddy's mark_recall during a call. */
export function reviewWord(id: string, remembered: boolean) {
  const word = store.get().find((w) => w.id === id)
  if (!word) return
  const next = review(word, remembered, Date.now())
  store.set((all) => all.map((w) => (w.id === id ? { ...w, ...next } : w)))
  if (supabase && accountId() && !id.startsWith('local-')) {
    void supabase
      .from('words')
      .update({
        step: next.step,
        due_at: iso(next.dueAt),
        last_reviewed_at: iso(next.lastReviewedAt),
        times_remembered: next.timesRemembered,
        times_missed: next.timesMissed,
      })
      .eq('id', id)
      .then(({ error }) => error && console.warn('Saving review failed', error.message))
  }
}

export function findWord(lang: TargetLanguage, target: string): Word | undefined {
  return store.get().find((w) => w.targetLanguage === lang && same(w.target, target))
}

/** Forget words on this device (used by sign out / delete). */
export function resetLocalWords() {
  loadedFor = null
  store.set([])
}
