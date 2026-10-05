import type { Level, TargetLanguage } from '../types'

// Japanese learners know JLPT labels, so we show those and store CEFR internally.
const CEFR_TO_JLPT: Record<Exclude<Level, 'unknown'>, string> = {
  A1: 'N5',
  A2: 'N4',
  B1: 'N3',
  B2: 'N2',
  C1: 'N1',
}

export function levelLabel(level: Level, target: TargetLanguage): string {
  if (level === 'unknown') return 'Not set yet'
  return target === 'ja' ? CEFR_TO_JLPT[level] : level
}
