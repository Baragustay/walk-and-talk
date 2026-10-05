import type { Level, Profile, TargetLanguage } from '../../types'
import { SPANISH_COURSE } from './es'
import { JAPANESE_COURSE } from './ja'
import type { Lesson, Phrase } from './types'

export type { Lesson, Phrase }

// Swedish comes next.
const COURSES: Partial<Record<TargetLanguage, Lesson[]>> = { es: SPANISH_COURSE, ja: JAPANESE_COURSE }

/** Starter and A1 learners follow the course; from A2 up it's conversation. */
const COURSE_LEVELS: Level[] = ['preA1', 'A1']

export function courseFor(lang: TargetLanguage): Lesson[] | null {
  return COURSES[lang] ?? null
}

/** Course progress after a placement test that says to start at lesson `startLesson` (1-based). */
export function progressFromPlacement(profile: Profile, startLesson: number): Profile['courseProgress'] {
  const course = COURSES[profile.targetLanguage]
  if (!course) return profile.courseProgress
  const done = Math.min(Math.max(startLesson - 1, 0), course.length)
  return { ...profile.courseProgress, [profile.targetLanguage]: done }
}

export interface LessonPlan {
  lesson: Lesson
  number: number // 1-based
  total: number
  /** Phrases from the two lessons before, for the warm-up. */
  review: Phrase[]
}

export function lessonsDone(profile: Profile): number {
  return profile.courseProgress?.[profile.targetLanguage] ?? 0
}

/** Today's lesson, or null if this user should just have a conversation. */
export function currentLesson(profile: Profile): LessonPlan | null {
  const course = COURSES[profile.targetLanguage]
  if (!course || !COURSE_LEVELS.includes(profile.level)) return null
  const done = lessonsDone(profile)
  if (done >= course.length) return null
  const review = course.slice(Math.max(0, done - 2), done).flatMap((l) => l.phrases)
  return { lesson: course[done], number: done + 1, total: course.length, review }
}

/** Progress after finishing a lesson, or null if the id isn't today's lesson. */
export function completeLesson(profile: Profile, lessonId: string): Profile['courseProgress'] | null {
  const plan = currentLesson(profile)
  if (!plan || plan.lesson.id !== lessonId) return null
  return { ...profile.courseProgress, [profile.targetLanguage]: plan.number }
}
