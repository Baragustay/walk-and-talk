// PHASE 1 MOCK: plays a scripted conversation so the Call screen can be clicked through.
// Phase 5 swaps this for the real Gemini Live session with the same shape.
import { useEffect, useRef, useState } from 'react'
import type { BuddyState } from '../components/Buddy/buddyImages'
import type { TargetLanguage, Word } from '../types'
import { MOCK_SCRIPT, MOCK_WORDS } from './data'

export interface Bubble {
  id: number
  who: 'buddy' | 'user'
  text: string
}

export interface CallView {
  buddyState: BuddyState
  bubbles: Bubble[]
  latestWord: Word | null
  seconds: number
}

export function useFakeCall(lang: TargetLanguage, active: boolean): CallView {
  const [view, setView] = useState<CallView>({ buddyState: 'thinking', bubbles: [], latestWord: null, seconds: 0 })
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (!active) return
    const script = MOCK_SCRIPT[lang]
    let t = 800
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms))

    script.forEach((line, i) => {
      if (line.who === 'buddy') {
        at(t, () => setView((v) => ({ ...v, buddyState: 'thinking' })))
        t += 1200
        at(t, () =>
          setView((v) => ({
            ...v,
            buddyState: 'talking',
            bubbles: [...v.bubbles, { id: i, who: 'buddy', text: line.text }],
            latestWord: line.saves !== undefined ? MOCK_WORDS[lang][line.saves] : v.latestWord,
          })),
        )
        t += 2600
      } else {
        at(t, () => setView((v) => ({ ...v, buddyState: 'listening' })))
        t += 2400
        at(t, () => setView((v) => ({ ...v, bubbles: [...v.bubbles, { id: i, who: 'user', text: line.text }] })))
        t += 400
      }
    })
    at(t, () => setView((v) => ({ ...v, buddyState: 'listening' })))

    const tick = setInterval(() => setView((v) => ({ ...v, seconds: v.seconds + 1 })), 1000)
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
      clearInterval(tick)
    }
  }, [lang, active])

  return view
}
