// Function declarations Buddy can call. Phase 6 adds save_word, mark_recall and end_walk.
import { Type, type FunctionDeclaration } from '@google/genai'
import type { Level } from '../../types'

export const SET_LEVEL: FunctionDeclaration = {
  name: 'set_level',
  description:
    "Save the user's estimated speaking level after the first level call. Call once, when you are confident.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      cefr_band: {
        type: Type.STRING,
        enum: ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'],
        description:
          'CEFR band. Pre-A1 = knows almost nothing yet. For Japanese, map JLPT: N5=A1, N4=A2, N3=B1, N2=B2, N1=C1.',
      },
      note: {
        type: Type.STRING,
        description: 'One short sentence on what they can and cannot do yet, in English.',
      },
      start_lesson: {
        type: Type.INTEGER,
        description:
          'From the placement test: the number of the first item they missed (1 if they missed the first). Use 1 if there was no placement test.',
      },
    },
    required: ['cefr_band', 'note', 'start_lesson'],
  },
}

export const HANG_UP: FunctionDeclaration = {
  name: 'hang_up',
  description:
    'End the phone call. Use only when the user says goodbye or clearly wants to stop, or after you said goodbye at the end of a level call.',
}

export const COMPLETE_LESSON: FunctionDeclaration = {
  name: 'complete_lesson',
  description: "Mark today's lesson as done, when the user can say most of its new phrases. The next call starts the next lesson.",
  parameters: {
    type: Type.OBJECT,
    properties: { lesson_id: { type: Type.STRING, description: "Today's lesson id, exactly as given." } },
    required: ['lesson_id'],
  },
}

export const SAVE_WORD: FunctionDeclaration = {
  name: 'save_word',
  description: 'Save a word or short phrase you taught, they asked about, or they keep getting wrong. It goes to their word list and comes back for review.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING, description: 'In the target language, as normally written.' },
      translation: { type: Type.STRING, description: "Meaning in the user's mother tongue." },
      example: { type: Type.STRING, description: 'A short example sentence in the target language.' },
      reason: { type: Type.STRING, enum: ['taught', 'asked', 'repeated_mistake'] },
      kana: { type: Type.STRING, description: 'Japanese only: reading in kana.' },
      kanji: { type: Type.STRING, description: 'Japanese only: kanji spelling, if any.' },
      romaji: { type: Type.STRING, description: 'Japanese only: romaji.' },
    },
    required: ['word', 'translation', 'reason'],
  },
}

export const MARK_RECALL: FunctionDeclaration = {
  name: 'mark_recall',
  description: 'After practising one of the review words: did they remember it?',
  parameters: {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING, description: 'The review word, exactly as listed.' },
      remembered: { type: Type.BOOLEAN },
    },
    required: ['word', 'remembered'],
  },
}

export const MAX_STYLE_ITEMS = 8

export const UPDATE_LEARNING_STYLE: FunctionDeclaration = {
  name: 'update_learning_style',
  description:
    'Save how this user wants to learn, so every future call follows it. Send the COMPLETE updated list each time; it replaces the old one.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      preferences: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          `Up to ${MAX_STYLE_ITEMS} short instructions to yourself, in English, e.g. "Speak slowly, with pauses", "Have them repeat each new phrase after you, often".`,
      },
    },
    required: ['preferences'],
  },
}

export function parseLearningStyle(args: Record<string, unknown> | undefined): string[] | null {
  const list = args?.preferences
  if (!Array.isArray(list)) return null
  return list
    .map((p) => String(p).trim().slice(0, 160))
    .filter(Boolean)
    .slice(0, MAX_STYLE_ITEMS)
}

const BANDS: Record<string, Level> = { 'PRE-A1': 'preA1', A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1' }

export function parseSetLevel(
  args: Record<string, unknown> | undefined,
): { level: Level; note: string; startLesson: number | null } | null {
  const level = BANDS[String(args?.cefr_band ?? '').toUpperCase().trim()]
  if (!level) return null
  const start = Number(args?.start_lesson)
  return {
    level,
    note: String(args?.note ?? '').slice(0, 300),
    startLesson: Number.isInteger(start) && start >= 1 ? start : null,
  }
}

export type ToolHandler = (name: string, args: Record<string, unknown> | undefined) => Record<string, unknown>
