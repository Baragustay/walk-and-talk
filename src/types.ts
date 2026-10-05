export type TargetLanguage = 'sv' | 'es' | 'ja'
// 'preA1' is not in the PRD: CEFR Companion Volume (2020) Pre-A1, for people who know nothing yet.
export type Level = 'preA1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'unknown'
export type WordReason = 'taught' | 'asked' | 'repeated_mistake'
export type Topic = 'free' | 'daily' | 'food' | 'travel' | 'work'

export interface Profile {
  id: 'me'
  motherTongue: string // BCP 47 code, e.g. 'en', 'cs'
  targetLanguage: TargetLanguage
  level: Level
  levelNote: string
  walkMinutes: number
  showRomaji: boolean
  /** Not in the PRD: how this user wants Buddy to teach, saved by Buddy (update_learning_style) or edited in Settings. */
  learningStyle: string[]
  createdAt: number
  /** Not in the PRD data model: set once onboarding is finished, so Home knows not to show it again. */
  onboarded: boolean
}

export interface Walk {
  id: string
  startedAt: number
  endedAt: number
  minutes: number
  topic: Topic
  hadPhoto: boolean
}

export interface Word {
  id: string
  target: string
  translation: string
  example: string
  reason: WordReason
  kana?: string
  kanji?: string
  romaji?: string
  step: number // 0..4
  dueAt: number
  createdAt: number
  lastReviewedAt?: number
  timesRemembered: number
  timesMissed: number
}
