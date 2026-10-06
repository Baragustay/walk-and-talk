import { Link, useNavigate } from 'react-router'
import { PhoneIcon, SpeakerIcon } from '../../components/Icons'
import { canSpeak, speak } from '../../lib/speak'
import { prepareAudio } from '../../lib/live/audio/context'
import { WordText } from '../../components/WordText/WordText'
import { useProfile } from '../../state/profile'
import { dueWords, useWords } from '../../state/words'
import type { Word } from '../../types'
import styles from './Words.module.css'

export function Words() {
  const profile = useProfile()
  const navigate = useNavigate()
  const words = useWords(profile.targetLanguage)
  const due = dueWords(words)
  const all = [...words].sort((a, b) => b.createdAt - a.createdAt)

  const lang = profile.targetLanguage
  const row = (w: Word) => (
    <li key={w.id} className={styles.row}>
      <div className={styles.rowText}>
        <WordText word={w} lang={lang} showRomaji={profile.showRomaji} />
        <span className="soft">{w.translation}</span>
      </div>
      {canSpeak(lang) && (
        <button type="button" className="icon-btn" onClick={() => speak(w.target, lang)} aria-label={`Hear ${w.target}`}>
          <SpeakerIcon />
        </button>
      )}
    </li>
  )

  return (
    <div className="screen">
      <h1 className="page-title">Words</h1>

      <section className={styles.section} aria-labelledby="due-title">
        <h2 id="due-title" className="section-title">
          Due today{due.length > 0 ? ` · ${due.length}` : ''}
        </h2>
        {due.length > 0 ? (
          <>
            <ul className={styles.list}>{due.map(row)}</ul>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                prepareAudio()
                navigate('/call?mode=review')
              }}
            >
              <PhoneIcon />
              Review with Buddy
            </button>
            <Link to="/words/review" className="btn btn-block">
              Flashcards instead
            </Link>
          </>
        ) : (
          <p className="soft">Nothing to review today. Enjoy your walk.</p>
        )}
      </section>

      <section className={styles.section} aria-labelledby="all-title">
        <h2 id="all-title" className="section-title">
          All words{all.length > 0 ? ` · ${all.length}` : ''}
        </h2>
        {all.length > 0 ? (
          <ul className={styles.list}>{all.map(row)}</ul>
        ) : (
          <p className="soft">No words yet. Buddy saves the words you learn during your calls.</p>
        )}
      </section>
    </div>
  )
}
