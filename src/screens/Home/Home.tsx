import { useId, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { CameraIcon, CloseIcon, PhoneIcon } from '../../components/Icons'
import { plural } from '../../lib/format'
import { TOPICS } from '../../lib/topics'
import { dueWords, MOCK_WORDS } from '../../mock/data'
import { setPhoto, setTopic, useCallSetup } from '../../state/callSetup'
import { useProfile } from '../../state/profile'
import styles from './Home.module.css'

export function Home() {
  const navigate = useNavigate()
  const profile = useProfile()
  const { topic, photo } = useCallSetup()
  const fileInput = useRef<HTMLInputElement>(null)
  const topicsLabel = useId()
  const due = dueWords(MOCK_WORDS[profile.targetLanguage]).length

  return (
    <div className="screen">
      <h1 className="visually-hidden">Home</h1>

      <div className={styles.hero}>
        <Buddy state="idle" size={200} />
        <button type="button" className={styles.call} onClick={() => navigate('/call')}>
          <PhoneIcon size={32} />
          <span>Call Buddy</span>
        </button>
        {due > 0 && (
          <p className={styles.due}>
            <Link to="/words">{plural(due, 'word', 'words')} to review today</Link>
          </p>
        )}
      </div>

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

      <section className={styles.group} aria-label="Photo for the next call">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setPhoto(file)
            e.target.value = ''
          }}
        />
        {photo ? (
          <div className={styles.photoRow}>
            <img src={photo.url} alt="Your photo for the next call" className={styles.thumb} />
            <p className="soft">Buddy will see this when you call.</p>
            <button type="button" className={styles.iconBtn} onClick={() => setPhoto(null)} aria-label="Remove photo">
              <CloseIcon />
            </button>
          </div>
        ) : (
          <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
            <CameraIcon />
            Add photo
          </button>
        )}
      </section>
    </div>
  )
}
