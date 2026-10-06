import { describe, expect, it } from 'vitest'
import { checkLevelEvidence, parseSetLevel } from './tools'

describe('checkLevelEvidence', () => {
  it('accepts beginners from the placement phrases alone', () => {
    expect(checkLevelEvidence({ cefr_band: 'Pre-A1', highest_level_tested: 'none' })).toBeNull()
    expect(checkLevelEvidence({ cefr_band: 'A1', highest_level_tested: 'none' })).toBeNull()
  })
  it('refuses a level when the level above was never tested', () => {
    expect(checkLevelEvidence({ cefr_band: 'B1', highest_level_tested: 'B1', struggled_there: false })).toMatch(/B2 tasks/)
  })
  it('refuses when they handled the level above fine', () => {
    expect(checkLevelEvidence({ cefr_band: 'B1', highest_level_tested: 'B2', struggled_there: false })).toMatch(/at least B2/)
  })
  it('accepts when they struggled one level up', () => {
    expect(checkLevelEvidence({ cefr_band: 'B1', highest_level_tested: 'B2', struggled_there: true })).toBeNull()
  })
  it('needs C1 tasks for C1', () => {
    expect(checkLevelEvidence({ cefr_band: 'C1', highest_level_tested: 'B2' })).toMatch(/C1 tasks/)
    expect(checkLevelEvidence({ cefr_band: 'C1', highest_level_tested: 'C1' })).toBeNull()
  })
})

describe('parseSetLevel', () => {
  it('maps Pre-A1 and reads start_lesson', () => {
    expect(parseSetLevel({ cefr_band: 'Pre-A1', note: 'x', start_lesson: 3 })).toEqual({ level: 'preA1', note: 'x', startLesson: 3 })
  })
})
