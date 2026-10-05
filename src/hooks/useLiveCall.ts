import { useEffect, useRef, useState } from 'react'
import { languageName, targetLanguageName } from '../lib/languages'
import { LiveCall, type CallSnapshot } from '../lib/live/liveCall'
import { buildSystemPrompt, kickoffMessage } from '../lib/live/systemPrompt'
import { dueWords, MOCK_WALKS, MOCK_WORDS } from '../mock/data'
import type { Profile } from '../types'

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
  const call = useRef<LiveCall | null>(null)

  useEffect(() => {
    // Phase 5: free talk only. Walk count and due words are still mock data until Dexie (phase 2).
    const systemPrompt = buildSystemPrompt({
      motherTongue: languageName(profile.motherTongue),
      targetLanguage: targetLanguageName(profile.targetLanguage),
      level: isLevelCall ? 'unknown' : profile.level,
      walkCount: isLevelCall ? 1 : MOCK_WALKS.length + 1,
      dueWords: isLevelCall ? [] : dueWords(MOCK_WORDS[profile.targetLanguage]),
      topicNotes: 'Free talk. Follow whatever the user wants to talk about.',
      walkMinutes: isLevelCall ? 5 : profile.walkMinutes,
    })
    // Only the current call may update the screen (React dev mode mounts twice).
    const c: LiveCall = new LiveCall({
      systemPrompt,
      kickoff: kickoffMessage(),
      onChange: (s) => call.current === c && setSnap(s),
    })
    call.current = c
    void c.start()
    return () => {
      call.current = null
      c.end()
    }
    // Settings can't change mid-call, so only start once per mount.
  }, [])

  return {
    ...snap,
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
