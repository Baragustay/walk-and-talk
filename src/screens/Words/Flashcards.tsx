import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { CloseIcon, SpeakerIcon } from '../../components/Icons'
import { WordText } from '../../components/WordText/WordText'
import { canSpeak, speak } from '../../lib/speak'
import { useProfile } from '../../state/profile'
import { dueWords, getWords, reviewWord } from '../../state/words'
import styles from './Words.module.css'

export function Flashcards() {
  const navigate = useNavigate()
  const profile = useProfile()
  const lang = profile.targetLanguage
  // Snapshot the due list once, so answering doesn't reshuffle the deck.
  const [deck] = useState(() => dueWords(getWords(lang)))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [lastAnswer, setLastAnswer] = useState<'got' | 'missed' | null>(null)
  const backRef = useRef<HTMLDivElement>(null)

  const word = deck[index]

  const answer = (got: boolean) => {
    reviewWord(word.id, got)
    setLastAnswer(got ? 'got' : 'missed')
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  const flip = () => {
    setFlipped(true)
    if (canSpeak(lang)) void speak(word.target, lang)
    // Move focus to the answer so screen readers read it.
    requestAnimationFrame(() => backRef.current?.focus())
  }

  return (
    <div className={styles.reviewPage}>
      <header className={styles.reviewTop}>
        <p className="soft" aria-live="polite">
          {word ? `Card ${index + 1} of ${deck.length}` : 'All done'}
        </p>
        <button type="button" className={styles.iconBtn} onClick={() => navigate('/words')} aria-label="Close flashcards">
          <CloseIcon />
        </button>
      </header>
      <h1 className="visually-hidden">Flashcards</h1>

      {!word ? (
        <div className={styles.done}>
          <Buddy state={lastAnswer === 'missed' ? 'encouraging' : 'happy'} size={200} />
          <h2>That's all for today</h2>
          <p className="soft">These words will come back on a later walk.</p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/words')}>
            Back to words
          </button>
        </div>
      ) : (
        <>
          <div className={styles.cardArea}>
            {!flipped ? (
              <button key={`f${word.id}`} type="button" className={styles.flashcard} onClick={flip}>
                <span className={styles.front} lang={profile.motherTongue}>
                  {word.translation}
                </span>
                <span className={styles.hint}>Tap to see the answer</span>
              </button>
            ) : (
              <div key={`b${word.id}`} ref={backRef} tabIndex={-1} className={`${styles.flashcard} ${styles.back}`}>
                <WordText word={word} lang={lang} showRomaji={profile.showRomaji} size="lg" />
                <p className={styles.example} lang={lang}>
                  {word.example}
                </p>
                {canSpeak(lang) && (
                  <div className={styles.playRow}>
                    <button type="button" className="btn" onClick={() => speak(word.target, lang)}>
                      <SpeakerIcon />
                      Hear it
                    </button>
                    {word.example && (
                      <button type="button" className="btn" onClick={() => speak(word.example, lang)}>
                        <SpeakerIcon />
                        Example
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {flipped && (
            <div className={styles.answers}>
              <button type="button" className="btn" onClick={() => answer(false)}>
                Not yet
              </button>
              <button type="button" className={`btn ${styles.gotIt}`} onClick={() => answer(true)}>
                Got it
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
