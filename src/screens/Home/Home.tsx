import { useId } from 'react'
import { Link, useNavigate } from 'react-router'
import { Avatar } from '../../components/Avatar/Avatar'
import { Buddy } from '../../components/Buddy/Buddy'
import { PhoneIcon } from '../../components/Icons'
import { currentLesson } from '../../lib/course'
import { plural } from '../../lib/format'
import { prepareAudio } from '../../lib/live/audio/context'
import { TOPICS } from '../../lib/topics'
import { useAuth } from '../../state/auth'
import { setTopic, useCallSetup } from '../../state/callSetup'
import { useProfile } from '../../state/profile'
import { dueWords, useWords } from '../../state/words'
import styles from './Home.module.css'

// One clear action (Call Buddy), then at most two cards: what this call is about, and
// words to review. The photo option is hidden until the photo actually reaches Buddy (phase 7).
export function Home() {
  const navigate = useNavigate()
  const profile = useProfile()
  const auth = useAuth()
  const { topic } = useCallSetup()
  const topicsLabel = useId()
  const lesson = currentLesson(profile)
  const due = dueWords(useWords(profile.targetLanguage)).length

  const call = (mode?: 'review') => {
    prepareAudio() // must happen inside the tap (mobile Safari)
    navigate(mode ? `/call?mode=${mode}` : '/call')
  }

  return (
    <div className="screen">
      <h1 className="visually-hidden">Home</h1>
      <header className={styles.top}>
        <p className={styles.hello}>
          {auth.status === 'signedIn' && auth.name ? `Hi, ${auth.name.split(' ')[0]}!` : 'Hi there!'}
        </p>
        {auth.status === 'signedIn' && (
          <Link to="/me" className={styles.me} aria-label={`Your profile${auth.email ? ` (${auth.email})` : ''}`}>
            <Avatar name={auth.name} email={auth.email} avatarUrl={auth.avatarUrl} />
          </Link>
        )}
      </header>

      <div className={styles.hero}>
        <Buddy state="idle" size={180} />
        <button type="button" className={styles.call} onClick={() => call()}>
          <PhoneIcon size={30} />
          <span>Call Buddy</span>
        </button>
        <p className="soft">Talk hands-free: walking, cooking, wherever you are.</p>
      </div>

      {lesson ? (
        <section className="feature-card" aria-labelledby="lesson-title">
          <p className="eyebrow">
            Today’s lesson · {lesson.number} of {lesson.total}
          </p>
          <h2 id="lesson-title" className={styles.cardTitle}>
            {lesson.lesson.title}
          </h2>
          <p className="soft">You’ll be able to {lesson.lesson.canDo}.</p>
          <div className={styles.progress} aria-hidden="true">
            <span style={{ width: `${((lesson.number - 1) / lesson.total) * 100}%` }} />
          </div>
        </section>
      ) : (
        <fieldset className={styles.group} aria-labelledby={topicsLabel}>
          <h2 id={topicsLabel} className="section-title">
            Talk about
          </h2>
          <div className="chips">
            {TOPICS.map((t) => (
              <label key={t.id} className="chip">
                <input type="radio" name="topic" value={t.id} checked={topic === t.id} onChange={() => setTopic(t.id)} />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {due > 0 && (
        <section className={`feature-card ${styles.reviewCard}`} aria-labelledby="review-title">
          <div>
            <h2 id="review-title" className={styles.cardTitle}>
              {plural(due, 'word', 'words')} to review
            </h2>
            <p className="soft">A two-minute call to keep them fresh.</p>
          </div>
          <div className={styles.reviewActions}>
            <button type="button" className="btn" onClick={() => call('review')}>
              <PhoneIcon size={20} />
              Review
            </button>
            <Link to="/words" className="link-btn">
              See words
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
