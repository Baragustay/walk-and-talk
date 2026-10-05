import { describe, expect, it } from 'vitest'
import { isDue, newSchedule, review, STEPS_DAYS } from './srs'

const DAY = 24 * 60 * 60 * 1000
const now = Date.UTC(2026, 9, 5, 12)
const fresh = { step: 0, timesRemembered: 0, timesMissed: 0 }

describe('srs', () => {
  it('uses the steps from the brief', () => {
    expect(STEPS_DAYS).toEqual([1, 3, 7, 14, 30])
  })

  it('schedules a new word for tomorrow at step 0', () => {
    expect(newSchedule(now)).toEqual({ step: 0, dueAt: now + DAY })
  })

  it('moves up one step when remembered', () => {
    const r = review(fresh, true, now)
    expect(r.step).toBe(1)
    expect(r.dueAt).toBe(now + 3 * DAY)
    expect(r.timesRemembered).toBe(1)
    expect(r.lastReviewedAt).toBe(now)
  })

  it('walks through every step and caps at the last one', () => {
    let w = { ...fresh }
    const dues: number[] = []
    for (let i = 0; i < 6; i++) {
      const r = review(w, true, now)
      dues.push((r.dueAt - now) / DAY)
      w = { ...w, ...r }
    }
    expect(dues).toEqual([3, 7, 14, 30, 30, 30])
    expect(w.step).toBe(4)
  })

  it('goes back to step 0, due in 1 day, when missed', () => {
    const r = review({ step: 3, timesRemembered: 3, timesMissed: 0 }, false, now)
    expect(r).toMatchObject({ step: 0, dueAt: now + DAY, timesRemembered: 3, timesMissed: 1 })
  })

  it('knows when a word is due', () => {
    expect(isDue({ dueAt: now }, now)).toBe(true)
    expect(isDue({ dueAt: now + 1 }, now)).toBe(false)
  })
})
