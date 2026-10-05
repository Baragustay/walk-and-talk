import type { Level, TargetLanguage } from '../types'

// Japanese learners know JLPT labels, so we show those and store CEFR internally.
const CEFR_TO_JLPT: Record<Exclude<Level, 'unknown' | 'preA1'>, string> = {
  A1: 'N5',
  A2: 'N4',
  B1: 'N3',
  B2: 'N2',
  C1: 'N1',
}

export function levelLabel(level: Level, target: TargetLanguage): string {
  if (level === 'unknown') return 'Not set yet'
  if (level === 'preA1') return 'Starter'
  return target === 'ja' ? CEFR_TO_JLPT[level] : level
}

/** How the level reads in the system prompt. */
export function levelForPrompt(level: Level): string {
  if (level === 'preA1') return 'Pre-A1 (complete beginner: knows almost no words yet)'
  return level
}
