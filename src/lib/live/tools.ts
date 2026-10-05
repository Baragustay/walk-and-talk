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
        enum: ['A1', 'A2', 'B1', 'B2', 'C1'],
        description: 'CEFR band. For Japanese, map JLPT: N5=A1, N4=A2, N3=B1, N2=B2, N1=C1.',
      },
      note: {
        type: Type.STRING,
        description: 'One short sentence on what they can and cannot do yet, in English.',
      },
    },
    required: ['cefr_band', 'note'],
  },
}

const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

export function parseSetLevel(args: Record<string, unknown> | undefined): { level: Level; note: string } | null {
  const band = String(args?.cefr_band ?? '').toUpperCase()
  if (!(BANDS as readonly string[]).includes(band)) return null
  return { level: band as Level, note: String(args?.note ?? '').slice(0, 300) }
}

export type ToolHandler = (name: string, args: Record<string, unknown> | undefined) => Record<string, unknown>
