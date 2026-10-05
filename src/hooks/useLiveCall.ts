import { useEffect, useRef, useState } from 'react'
import { languageName, targetLanguageName } from '../lib/languages'
import { LiveCall, type CallSnapshot } from '../lib/live/liveCall'
import { buildSystemPrompt, kickoffMessage } from '../lib/live/systemPrompt'
import { parseSetLevel, SET_LEVEL, type ToolHandler } from '../lib/live/tools'
import { updateProfile } from '../state/profile'
import type { Level, Profile } from '../types'

const INITIAL: CallSnapshot = {
  status: 'connecting',
  error: null,
  buddyState: 'thinking',
  bubbles: [],
  connectedAt: null,
  audioBlocked: false,
}

/** Starts a Live call when the screen mounts, hangs up when it unmounts. */
export function useLiveCall(profile: Profile, isLevelCall: boolean) {
  const [snap, setSnap] = useState<CallSnapshot>(INITIAL)
  const [levelResult, setLevelResult] = useState<{ level: Level; note: string } | null>(null)
  const call = useRef<LiveCall | null>(null)

  useEffect(() => {
    const motherTongue = languageName(profile.motherTongue)
    const systemPrompt = buildSystemPrompt({
      motherTongue,
      targetLanguage: targetLanguageName(profile.targetLanguage),
      level: isLevelCall ? 'unknown' : profile.level,
      // TODO(phase 2): real walk count and due words from Dexie. No fake words until then.
      walkCount: 1,
      dueWords: [],
      topicNotes: 'Free talk. Follow whatever the user wants to talk about.',
      walkMinutes: isLevelCall ? 5 : profile.walkMinutes,
    })

    const onToolCall: ToolHandler = (name, args) => {
      if (name === 'set_level') {
        const result = parseSetLevel(args)
        if (!result) return { error: 'cefr_band must be one of A1, A2, B1, B2, C1' }
        updateProfile({ level: result.level, levelNote: result.note })
        setLevelResult(result)
        return { saved: true }
      }
      return { error: `Unknown function ${name}` }
    }

    // Only the current call may update the screen (React dev mode mounts twice).
    const c: LiveCall = new LiveCall({
      systemPrompt,
      kickoff: kickoffMessage(isLevelCall, motherTongue),
      tools: isLevelCall ? [SET_LEVEL] : [],
      onToolCall,
      onChange: (s) => call.current === c && setSnap(s),
    })
    call.current = c
    void c.start()
    return () => {
      call.current = null
      c.end()
    }
  }, [])

  return {
    ...snap,
    levelResult,
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
