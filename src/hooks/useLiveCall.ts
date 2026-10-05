import { useEffect, useRef, useState } from 'react'
import { languageName, targetLanguageName } from '../lib/languages'
import { LiveCall, type CallSnapshot } from '../lib/live/liveCall'
import {
  buildSystemPrompt,
  kickoffMessage,
  lessonKickoffMessage,
  levelCallWrapUpCue,
  walkWrapUpCue,
} from '../lib/live/systemPrompt'
import { completeLesson, courseFor, currentLesson, progressFromPlacement } from '../lib/course'
import {
  COMPLETE_LESSON,
  HANG_UP,
  MARK_RECALL,
  SAVE_WORD,
  parseLearningStyle,
  parseSetLevel,
  SET_LEVEL,
  UPDATE_LEARNING_STYLE,
  type ToolHandler,
} from '../lib/live/tools'
import { accessToken } from '../state/auth'
import { getProfile, updateProfile } from '../state/profile'
import { recordWalk, useWalks } from '../state/walks'
import { dueWords, findWord, getWords, reviewWord, saveWord } from '../state/words'
import type { Level, Profile, Word } from '../types'

const INITIAL: CallSnapshot = {
  status: 'connecting',
  error: null,
  buddyState: 'thinking',
  bubbles: [],
  connectedAt: null,
  audioBlocked: false,
  log: [],
}

// The model has no clock, so we tell it when to wrap up.
const LEVEL_CUE_AT = 4 * 60 // seconds
const LEVEL_CUE_AGAIN_AT = 6.5 * 60 // if it still hasn't set a level

/** Starts a Live call when the screen mounts, hangs up when it unmounts. */
export function useLiveCall(profile: Profile, isLevelCall: boolean) {
  const [snap, setSnap] = useState<CallSnapshot>(INITIAL)
  const [levelResult, setLevelResult] = useState<{ level: Level; note: string } | null>(null)
  /** Words saved or completed during this call, newest first: for the word card and the recap. */
  const [sessionWords, setSessionWords] = useState<Word[]>([])
  const [lessonDone, setLessonDone] = useState<string | null>(null)
  const walks = useWalks()
  const call = useRef<LiveCall | null>(null)

  useEffect(() => {
    const motherTongue = languageName(profile.motherTongue)
    const lesson = isLevelCall ? null : currentLesson(profile)
    const systemPrompt = buildSystemPrompt({
      motherTongue,
      ageRange: profile.ageRange,
      targetLanguage: targetLanguageName(profile.targetLanguage),
      level: isLevelCall ? 'unknown' : profile.level,
      levelNote: isLevelCall ? '' : profile.levelNote,
      learningStyle: profile.learningStyle,
      // TODO(phase 2): real walk count and due words from Dexie. No fake words until then.
      walkCount: walks.length + 1,
      dueWords: isLevelCall ? [] : dueWords(getWords(profile.targetLanguage)).slice(0, 3),
      topicNotes: 'Free talk. Follow whatever the user wants to talk about.',
      walkMinutes: isLevelCall ? 5 : profile.walkMinutes,
      lesson,
      placementCourse: isLevelCall ? courseFor(profile.targetLanguage) : null,
    })

    const onToolCall: ToolHandler = (name, args) => {
      if (name === 'set_level') {
        const result = parseSetLevel(args)
        if (!result) return { error: 'cefr_band must be one of A1, A2, B1, B2, C1' }
        updateProfile({
          level: result.level,
          levelNote: result.note,
          ...(result.startLesson ? { courseProgress: progressFromPlacement(getProfile(), result.startLesson) } : {}),
        })
        setLevelResult(result)
        return { saved: true }
      }
      if (name === 'update_learning_style') {
        const prefs = parseLearningStyle(args)
        if (!prefs) return { error: 'preferences must be a list of short strings' }
        updateProfile({ learningStyle: prefs })
        return { saved: true }
      }
      if (name === 'complete_lesson') {
        // Read the latest profile: other tools may have changed it during the call.
        const progress = completeLesson(getProfile(), String(args?.lesson_id ?? ''))
        if (!progress || !lesson) return { error: "That isn't today's lesson id." }
        updateProfile({ courseProgress: progress })
        // The lesson's phrases become words for review on later calls.
        const saved = lesson.lesson.phrases.map((p) =>
          saveWord({
            targetLanguage: profile.targetLanguage,
            target: p.target,
            translation: p.meaning,
            reason: 'taught',
            kana: p.kana,
            romaji: p.romaji,
            kanji: p.kana && p.kana !== p.target ? p.target : undefined,
          }),
        )
        setSessionWords((ws) => [...saved.filter((w) => !ws.some((x) => x.id === w.id)).reverse(), ...ws])
        setLessonDone(lesson.lesson.title)
        return { saved: true, words_saved: saved.length }
      }
      if (name === 'save_word') {
        const target = String(args?.word ?? '').trim()
        const translation = String(args?.translation ?? '').trim()
        if (!target || !translation) return { error: 'word and translation are required' }
        const reason = ['taught', 'asked', 'repeated_mistake'].includes(String(args?.reason)) ? (args!.reason as Word['reason']) : 'taught'
        const opt = (k: string) => (args?.[k] ? String(args[k]) : undefined)
        const w = saveWord({
          targetLanguage: profile.targetLanguage,
          target,
          translation,
          example: opt('example'),
          reason,
          kana: opt('kana'),
          kanji: opt('kanji'),
          romaji: opt('romaji'),
        })
        setSessionWords((ws) => [w, ...ws.filter((x) => x.id !== w.id)])
        return { saved: true }
      }
      if (name === 'mark_recall') {
        const w = findWord(profile.targetLanguage, String(args?.word ?? ''))
        if (!w) return { error: 'Not one of their saved words.' }
        reviewWord(w.id, Boolean(args?.remembered))
        return { saved: true }
      }
      if (name === 'hang_up') {
        c.hangUpAfterGoodbye()
        return { ok: true, note: 'The call ends after your goodbye. If you have not said goodbye yet, say it now, briefly.' }
      }
      return { error: `Unknown function ${name}` }
    }

    // Only the current call may update the screen (React dev mode mounts twice).
    const c: LiveCall = new LiveCall({
      systemPrompt,
      kickoff: lesson
        ? lessonKickoffMessage(lesson, motherTongue, profile.learningStyle)
        : kickoffMessage(isLevelCall, motherTongue, profile.learningStyle),
      tools: isLevelCall
        ? [SET_LEVEL, UPDATE_LEARNING_STYLE, HANG_UP]
        : [UPDATE_LEARNING_STYLE, HANG_UP, SAVE_WORD, MARK_RECALL, ...(lesson ? [COMPLETE_LESSON] : [])],
      onToolCall,
      getAuthToken: accessToken,
      onChange: (s) => call.current === c && setSnap(s),
    })
    call.current = c
    void c.start()
    return () => {
      call.current = null
      c.end()
    }
  }, [])

  // Time cues, counted from when the line opened.
  const levelSet = levelResult !== null
  const cuesSent = useRef(new Set<string>())
  useEffect(() => {
    if (!snap.connectedAt) return
    const connectedAt = snap.connectedAt
    const check = () => {
      const c = call.current
      if (!c) return
      const elapsed = (Date.now() - connectedAt) / 1000
      const once = (key: string, text: string) => {
        if (cuesSent.current.has(key)) return
        cuesSent.current.add(key)
        c.sendNote(text)
      }
      if (isLevelCall) {
        if (elapsed >= LEVEL_CUE_AT && !levelSet) once('level', levelCallWrapUpCue())
        if (elapsed >= LEVEL_CUE_AGAIN_AT && !levelSet) once('level-again', levelCallWrapUpCue())
      } else if (elapsed >= profile.walkMinutes * 60) {
        once('walk', walkWrapUpCue(profile.walkMinutes))
      }
    }
    const t = setInterval(check, 5000)
    return () => clearInterval(t)
  }, [snap.connectedAt, isLevelCall, levelSet, profile.walkMinutes])

  // Record the call once it has ended, for the stats on Me.
  const recorded = useRef(false)
  useEffect(() => {
    if (snap.status !== 'ended' || !snap.connectedAt || recorded.current) return
    recorded.current = true
    const endedAt = Date.now()
    recordWalk({
      startedAt: snap.connectedAt,
      endedAt,
      minutes: Math.max(1, Math.round((endedAt - snap.connectedAt) / 60_000)),
      topic: 'free',
      hadPhoto: false,
    })
  }, [snap.status, snap.connectedAt])

  return {
    ...snap,
    levelResult,
    sessionWords,
    lessonDone,
    end: () => call.current?.end(),
    unblockAudio: () => call.current?.unblockAudio(),
  }
}

/** Seconds since the line opened, ticking once a second. */
export function useCallTimer(connectedAt: number | null, running: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [running])
  return connectedAt ? Math.max(0, Math.floor((now - connectedAt) / 1000)) : 0
}
