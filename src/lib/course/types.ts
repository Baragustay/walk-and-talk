export interface Phrase {
  /** In the target language, as Buddy says it. */
  target: string
  /** Meaning in English. Buddy explains it in the user's mother tongue. */
  meaning: string
  /** Japanese only: reading in hiragana/katakana, and romaji. */
  kana?: string
  romaji?: string
}

export interface Lesson {
  /** Stable id, saved in progress. Don't rename once people have used it. */
  id: string
  title: string
  /** Finishes the sentence "By the end, you can ..." */
  canDo: string
  /** 3 to 5 phrases, taught in this order. */
  phrases: Phrase[]
  /** How to practise this on a walk. */
  walkIdea: string
}
