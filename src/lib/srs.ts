// Spaced repetition, as in the brief. Pure functions: no storage, no React.
export const STEPS_DAYS = [1, 3, 7, 14, 30]
const DAY = 24 * 60 * 60 * 1000

export interface Schedule {
  step: number // 0..STEPS_DAYS.length - 1
  dueAt: number // ms
}

export interface ReviewStats extends Schedule {
  lastReviewedAt: number
  timesRemembered: number
  timesMissed: number
}

/** A brand-new word: step 0, due in 1 day. */
export function newSchedule(now: number): Schedule {
  return { step: 0, dueAt: now + STEPS_DAYS[0] * DAY }
}

/** Remembered: up one step (capped). Missed: back to step 0. Due date follows the new step. */
export function review(
  word: { step: number; timesRemembered: number; timesMissed: number },
  remembered: boolean,
  now: number,
): ReviewStats {
  const step = remembered ? Math.min(word.step + 1, STEPS_DAYS.length - 1) : 0
  return {
    step,
    dueAt: now + STEPS_DAYS[step] * DAY,
    lastReviewedAt: now,
    timesRemembered: word.timesRemembered + (remembered ? 1 : 0),
    timesMissed: word.timesMissed + (remembered ? 0 : 1),
  }
}

export function isDue(word: { dueAt: number }, now: number): boolean {
  return word.dueAt <= now
}
