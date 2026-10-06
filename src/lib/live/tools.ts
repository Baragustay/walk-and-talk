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
      highest_level_tested: {
        type: Type.STRING,
        enum: ['none', 'A2', 'B1', 'B2', 'C1'],
        description: "The hardest SPEAKING TEST level you gave them tasks at. 'none' if you only did the beginner phrases.",
      },
      struggled_there: {
        type: Type.BOOLEAN,
        description: 'Did they clearly struggle with the tasks at highest_level_tested?',
      },
      start_lesson: {
        type: Type.INTEGER,
        description:
          'From the placement test: the number of the first item they missed (1 if they missed the first). Use 1 if there was no placement test.',
      },
    },
    required: ['cefr_band', 'note', 'start_lesson', 'highest_level_tested', 'struggled_there'],
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

export const WAIT_FOR_USER: FunctionDeclaration = {
  name: 'wait_for_user',
  description:
    'They asked you to wait ("hold on", "one sec") or are clearly busy for a moment. The app stops checking in on silence until they speak again.',
}

export const DRIVING_MODE: FunctionDeclaration = {
  name: 'driving_mode',
  description:
    'They are driving or cycling. The app stops all silence check-ins for the rest of the call. Call once, as soon as you know.',
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

const TEST_ORDER = ['A2', 'B1', 'B2', 'C1']
const TASKS: Record<string, string> = {
  B1: 'tell a story from their past in detail; explain plans and the reasons for them',
  B2: 'argue for an opinion with pros and cons; speculate about causes or consequences',
  C1: 'an abstract topic, a hypothetical ("what would you do if..."), rephrasing an idea another way',
}

/**
 * A level is only accepted with evidence: for anything from A2 up, Buddy must have tested the
 * level above and seen them struggle there (C1 needs C1 tasks). Returns an instruction for Buddy
 * if the evidence is missing, or null if the level can be saved.
 */
export function checkLevelEvidence(args: Record<string, unknown> | undefined): string | null {
  const band = String(args?.cefr_band ?? '').toUpperCase()
  if (band === 'PRE-A1' || band === 'A1') return null // beginners: placement phrases are enough
  const tested = String(args?.highest_level_tested ?? 'none').toUpperCase()
  const struggled = Boolean(args?.struggled_there)
  const bandIdx = TEST_ORDER.indexOf(band)
  const testedIdx = TEST_ORDER.indexOf(tested)
  if (band === 'C1') {
    return tested === 'C1' ? null : `Not saved yet. Before C1, give them C1 tasks: ${TASKS.C1}.`
  }
  const next = TEST_ORDER[bandIdx + 1]
  if (testedIdx < bandIdx + 1) return `Not saved yet. Before ${band}, give them ${next} tasks (${TASKS[next]}) and see how they do.`
  if (testedIdx === bandIdx + 1 && !struggled) {
    return `Not saved yet. They handled ${next} tasks, so their level is at least ${next}. Test the next level up before deciding.`
  }
  return null
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
