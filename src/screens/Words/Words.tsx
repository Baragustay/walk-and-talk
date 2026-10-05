import { Link } from 'react-router'
import { WordText } from '../../components/WordText/WordText'
import { useProfile } from '../../state/profile'
import { dueWords, useWords } from '../../state/words'
import type { Word } from '../../types'
import styles from './Words.module.css'

export function Words() {
  const profile = useProfile()
  const words = useWords(profile.targetLanguage)
  const due = dueWords(words)
  const all = [...words].sort((a, b) => b.createdAt - a.createdAt)

  const row = (w: Word) => (
    <li key={w.id} className={styles.row}>
      <WordText word={w} lang={profile.targetLanguage} showRomaji={profile.showRomaji} />
      <span className="soft">{w.translation}</span>
    </li>
  )

  return (
    <div className="screen">
      <h1>Words</h1>

      <section className={styles.section} aria-labelledby="due-title">
        <h2 id="due-title" className="section-title">
          Due today
        </h2>
        {due.length > 0 ? (
          <>
            <ul className={styles.list}>{due.map(row)}</ul>
            <Link to="/words/review" className="btn btn-primary btn-block">
              Start flashcards
            </Link>
          </>
        ) : (
          <p className="soft">Nothing to review today. Enjoy your walk.</p>
        )}
      </section>

      <section className={styles.section} aria-labelledby="all-title">
        <h2 id="all-title" className="section-title">
          All words
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
