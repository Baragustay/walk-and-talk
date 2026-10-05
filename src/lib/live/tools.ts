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
    },
    required: ['cefr_band', 'note'],
  },
}

export const HANG_UP: FunctionDeclaration = {
  name: 'hang_up',
  description:
    'End the phone call. Use only when the user says goodbye or clearly wants to stop, or after you said goodbye at the end of a level call.',
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

export function parseSetLevel(args: Record<string, unknown> | undefined): { level: Level; note: string } | null {
  const level = BANDS[String(args?.cefr_band ?? '').toUpperCase().trim()]
  if (!level) return null
  return { level, note: String(args?.note ?? '').slice(0, 300) }
}

export type ToolHandler = (name: string, args: Record<string, unknown> | undefined) => Record<string, unknown>
