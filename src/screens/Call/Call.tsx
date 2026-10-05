import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { PhoneIcon } from '../../components/Icons'
import { useCallTimer, useLiveCall } from '../../hooks/useLiveCall'
import { formatTimer } from '../../lib/format'
import type { CallError } from '../../lib/live/liveCall'
import { updateProfile, useProfile } from '../../state/profile'
import styles from './Call.module.css'

const ERRORS: Record<CallError, { title: string; body: string }> = {
  'mic-denied': {
    title: "I can't hear you",
    body: 'The microphone is blocked. Allow it for this site in your browser settings, then try again.',
  },
  'mic-unsupported': {
    title: 'No microphone here',
    body: 'This browser only allows the microphone on a secure (https) page. Open the app from its https address.',
  },
  token: {
    title: "Buddy can't pick up",
    body: "We couldn't start the call. Check your connection and try again in a moment.",
  },
  network: {
    title: 'The line dropped',
    body: 'The connection to Buddy was lost. Check your internet and call again.',
  },
}

export function Call() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isLevelCall = params.get('mode') === 'level'
  const profile = useProfile()
  const call = useLiveCall(profile, isLevelCall)
  const seconds = useCallTimer(call.connectedAt, call.status === 'live' || call.status === 'reconnecting')
  const logEnd = useRef<HTMLDivElement>(null)

  // Keep the newest line in view.
  const lastText = call.bubbles[call.bubbles.length - 1]?.text
  useEffect(() => {
    logEnd.current?.scrollIntoView({ block: 'end' })
  }, [call.bubbles.length, lastText])

  const endCall = () => {
    call.end()
    if (isLevelCall) {
      // Phase 6: Buddy sets the level through set_level. For now just finish onboarding.
      updateProfile({ onboarded: true })
      navigate('/', { replace: true })
    }
  }

  const leave = () => {
    if (isLevelCall) updateProfile({ onboarded: true })
    navigate('/', { replace: true })
  }

  if (call.status === 'error' && call.error) {
    const e = ERRORS[call.error]
    return (
      <div className={styles.endPage} role="alert">
        <Buddy state="encouraging" size={180} />
        <h1>{e.title}</h1>
        <p className="soft">{e.body}</p>
        <button type="button" className="btn btn-primary btn-block" onClick={() => window.location.reload()}>
          Try again
        </button>
        <button type="button" className="link-btn" onClick={leave}>
          Back home
        </button>
      </div>
    )
  }

  if (call.status === 'ended') {
    return (
      <div className={styles.endPage}>
        <Buddy state="waving" size={220} />
        <h1>Nice walk!</h1>
        <p className="soft">You talked for {Math.max(1, Math.round(seconds / 60))} min.</p>
        <button type="button" className="btn btn-primary btn-block" onClick={leave}>
          Back home
        </button>
      </div>
    )
  }

  const statusText =
    call.status === 'connecting' ? 'Calling Buddy…' : call.status === 'reconnecting' ? 'Reconnecting…' : null

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <p className={styles.meta}>{isLevelCall ? 'Level call' : 'Free talk'}</p>
        <p className={styles.meta}>
          <span className="visually-hidden">Call time </span>
          <time>{formatTimer(seconds)}</time>
        </p>
      </header>

      <h1 className="visually-hidden">Call with Buddy</h1>
      <Buddy state={call.buddyState} size={180} announce={call.status === 'live'} />
      {statusText && (
        <p className={styles.status} role="status">
          {statusText}
        </p>
      )}
      {call.audioBlocked && (
        <button type="button" className="btn btn-primary" onClick={() => call.unblockAudio()}>
          Tap to hear Buddy
        </button>
      )}

      <div className={styles.log} role="log" aria-label="Conversation">
        {call.bubbles.map((b) => (
          <p key={b.id} className={`${styles.bubble} ${b.who === 'buddy' ? styles.buddy : styles.user}`}>
            <span className="visually-hidden">{b.who === 'buddy' ? 'Buddy: ' : 'You: '}</span>
            {b.text}
          </p>
        ))}
        <div ref={logEnd} />
      </div>

      <footer className={styles.bottom}>
        {/* Word card returns in phase 6, when Buddy can call save_word. */}
        <button type="button" className={styles.end} onClick={endCall}>
          <PhoneIcon size={30} />
          End call
        </button>
      </footer>
    </div>
  )
}
