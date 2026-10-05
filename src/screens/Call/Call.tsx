import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { PhoneIcon } from '../../components/Icons'
import { WordText } from '../../components/WordText/WordText'
import { formatTimer } from '../../lib/format'
import { TOPICS } from '../../lib/topics'
import { useFakeCall } from '../../mock/useFakeCall'
import { useCallSetup } from '../../state/callSetup'
import { updateProfile, useProfile } from '../../state/profile'
import styles from './Call.module.css'

export function Call() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isLevelCall = params.get('mode') === 'level'
  const profile = useProfile()
  const { topic } = useCallSetup()
  const [ended, setEnded] = useState(false)
  const call = useFakeCall(profile.targetLanguage, !ended)
  const logEnd = useRef<HTMLDivElement>(null)

  // Keep the newest line in view.
  useEffect(() => {
    logEnd.current?.scrollIntoView({ block: 'end' })
  }, [call.bubbles.length])

  const endCall = () => {
    if (isLevelCall) {
      // Mock result. Phase 6: Buddy sets this through set_level.
      updateProfile({ level: 'A2', levelNote: 'Mock level from phase 1', onboarded: true })
      navigate('/', { replace: true })
      return
    }
    setEnded(true)
  }

  if (ended) {
    return (
      <div className={styles.endPage}>
        <Buddy state="waving" size={220} />
        <h1>Nice walk!</h1>
        <p className="soft">
          You talked for {Math.max(1, Math.round(call.seconds / 60))} min
          {call.latestWord ? ' and learned a new word.' : '.'}
        </p>
        <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/', { replace: true })}>
          Back home
        </button>
      </div>
    )
  }

  const topicLabel = TOPICS.find((t) => t.id === topic)?.label

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <p className={styles.meta}>{isLevelCall ? 'Level call' : topicLabel}</p>
        <p className={styles.meta}>
          <span className="visually-hidden">Call time </span>
          <time>{formatTimer(call.seconds)}</time>
        </p>
      </header>

      <h1 className="visually-hidden">Call with Buddy</h1>
      <Buddy state={call.buddyState} size={180} announce />

      <div className={styles.log} role="log" aria-label="Conversation">
        {call.bubbles.map((b) => (
          <p
            key={b.id}
            className={`${styles.bubble} ${b.who === 'buddy' ? styles.buddy : styles.user}`}
            lang={profile.targetLanguage}
          >
            <span className="visually-hidden">{b.who === 'buddy' ? 'Buddy: ' : 'You: '}</span>
            {b.text}
          </p>
        ))}
        <div ref={logEnd} />
      </div>

      <footer className={styles.bottom}>
        {call.latestWord && (
          <section className={styles.wordCard} aria-label="Latest word" aria-live="polite">
            <WordText word={call.latestWord} lang={profile.targetLanguage} showRomaji={profile.showRomaji} />
            <span className={styles.translation}>{call.latestWord.translation}</span>
          </section>
        )}
        <button type="button" className={styles.end} onClick={endCall}>
          <PhoneIcon size={30} />
          End call
        </button>
      </footer>
    </div>
  )
}
