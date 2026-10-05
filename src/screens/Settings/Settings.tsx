import { useId, useRef, useState } from 'react'
import { prepareAudio } from '../../lib/live/audio/context'
import { useNavigate } from 'react-router'
import { BackIcon, CloseIcon } from '../../components/Icons'
import { MOTHER_TONGUES, TARGET_LANGUAGES } from '../../lib/languages'
import { AGE_RANGES, type AgeRange } from '../../lib/age'
import { levelLabel } from '../../lib/levels'
import { MAX_STYLE_ITEMS } from '../../lib/live/tools'
import { setCallDebug, useCallDebug } from '../../state/debug'
import { deleteAccount, signOut, useAuth } from '../../state/auth'
import { resetLocalProfile, updateProfile, useProfile } from '../../state/profile'
import type { TargetLanguage } from '../../types'
import styles from './Settings.module.css'

const WALK_OPTIONS = [10, 15, 20, 30]

export function Settings() {
  const navigate = useNavigate()
  const profile = useProfile()
  const callDebug = useCallDebug()
  const auth = useAuth()
  const [deleteError, setDeleteError] = useState(false)
  const [newWish, setNewWish] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const ids = { mother: useId(), target: useId(), walk: useId(), romaji: useId(), reminders: useId(), debug: useId(), wish: useId(), age: useId() }

  const confirmDelete = async () => {
    try {
      await deleteAccount() // server copy first; stop if that fails, so nothing is half-deleted
    } catch {
      setDeleteError(true)
      return
    }
    resetLocalProfile()
    dialog.current?.close()
    navigate('/welcome', { replace: true })
  }

  const logOut = async () => {
    await signOut()
    resetLocalProfile()
    navigate('/welcome', { replace: true })
  }

  return (
    <div className="screen">
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate('/me')} aria-label="Back to Me">
          <BackIcon />
        </button>
        <h1>Settings</h1>
      </header>

      <section className={styles.group} aria-labelledby="lang-title">
        <h2 id="lang-title" className="section-title">Languages</h2>
        <div className={styles.field}>
          <label htmlFor={ids.mother}>Mother tongue</label>
          <select
            id={ids.mother}
            className={styles.select}
            value={profile.motherTongue}
            onChange={(e) => updateProfile({ motherTongue: e.target.value })}
          >
            {MOTHER_TONGUES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor={ids.target}>Practising</label>
          <select
            id={ids.target}
            className={styles.select}
            value={profile.targetLanguage}
            onChange={(e) => updateProfile({ targetLanguage: e.target.value as TargetLanguage })}
          >
            {TARGET_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="about-title">
        <h2 id="about-title" className="section-title">About you</h2>
        <div className={styles.field}>
          <label htmlFor={ids.age}>Age</label>
          <select
            id={ids.age}
            className={styles.select}
            value={profile.ageRange ?? ''}
            onChange={(e) => updateProfile({ ageRange: (e.target.value || null) as AgeRange | null })}
          >
            <option value="">Not set</option>
            {AGE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="level-title">
        <h2 id="level-title" className="section-title">Level</h2>
        <div className={styles.levelRow}>
          <p>
            Current level: <strong>{levelLabel(profile.level, profile.targetLanguage)}</strong>
          </p>
          <button type="button" className="btn" onClick={() => {
              prepareAudio()
              navigate('/call?mode=level')
            }}>
            Redo level call
          </button>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="style-title">
        <h2 id="style-title" className="section-title">How Buddy teaches you</h2>
        <p className="soft">
          Tell Buddy during a call, like “speak slower” or “make me repeat after you”. Buddy remembers it here.
        </p>
        {profile.learningStyle.length > 0 && (
          <ul className={styles.wishes}>
            {profile.learningStyle.map((wish, i) => (
              <li key={i} className={styles.wish}>
                <span>{wish}</span>
                <button
                  type="button"
                  className={styles.back}
                  aria-label={`Remove: ${wish}`}
                  onClick={() => updateProfile({ learningStyle: profile.learningStyle.filter((_, j) => j !== i) })}
                >
                  <CloseIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
        {profile.learningStyle.length < MAX_STYLE_ITEMS && (
          <form
            className={styles.addWish}
            onSubmit={(e) => {
              e.preventDefault()
              const wish = newWish.trim()
              if (!wish) return
              updateProfile({ learningStyle: [...profile.learningStyle, wish.slice(0, 160)] })
              setNewWish('')
            }}
          >
            <label htmlFor={ids.wish} className="visually-hidden">
              Add a wish
            </label>
            <input
              id={ids.wish}
              className={styles.select}
              value={newWish}
              onChange={(e) => setNewWish(e.target.value)}
              placeholder="e.g. Speak slowly"
            />
            <button type="submit" className="btn">
              Add
            </button>
          </form>
        )}
      </section>

      <section className={styles.group} aria-labelledby="walk-title">
        <h2 id="walk-title" className="section-title">Walks</h2>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Walk length</legend>
          <div className="chips">
            {WALK_OPTIONS.map((m) => (
              <label key={m} className="chip">
                <input
                  type="radio"
                  name="walk"
                  checked={profile.walkMinutes === m}
                  onChange={() => updateProfile({ walkMinutes: m })}
                />
                <span>{m} min</span>
              </label>
            ))}
          </div>
        </fieldset>
        {profile.targetLanguage === 'ja' && (
          <label className="switch-row" htmlFor={ids.romaji}>
            <span>Show romaji</span>
            <input
              id={ids.romaji}
              type="checkbox"
              role="switch"
              className="switch"
              checked={profile.showRomaji}
              onChange={(e) => updateProfile({ showRomaji: e.target.checked })}
            />
          </label>
        )}
        <label className="switch-row" htmlFor={ids.reminders}>
          <span>
            Reminders <span className="soft">(coming soon)</span>
          </span>
          <input id={ids.reminders} type="checkbox" role="switch" className="switch" disabled />
        </label>
      </section>

      <section className={styles.group} aria-labelledby="proto-title">
        <h2 id="proto-title" className="section-title">Prototype</h2>
        <label className="switch-row" htmlFor={ids.debug}>
          <span>
            Show call log <span className="soft">(for testing)</span>
          </span>
          <input
            id={ids.debug}
            type="checkbox"
            role="switch"
            className="switch"
            checked={callDebug}
            onChange={(e) => setCallDebug(e.target.checked)}
          />
        </label>
      </section>

      <section className={styles.group} aria-labelledby="data-title">
        <h2 id="data-title" className="section-title">Your data</h2>
        {auth.status === 'disabled' && <p className="soft">Everything stays on this device.</p>}
        {(auth.status === 'none' || auth.status === 'anonymous') && (
          <>
            <p className="soft">Your progress is only on this phone for now.</p>
            <button type="button" className="btn" onClick={() => navigate('/account')}>
              Keep your progress
            </button>
          </>
        )}
        {auth.status === 'signedIn' && (
          <>
            <p className="soft">Signed in{auth.email ? ` as ${auth.email}` : ''}. Your progress is saved.</p>
            <button type="button" className="btn" onClick={logOut}>
              Sign out
            </button>
          </>
        )}
        <button type="button" className={`btn ${styles.danger}`} onClick={() => dialog.current?.showModal()}>
          Delete my data
        </button>
      </section>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="del-title" aria-describedby="del-desc">
        <h2 id="del-title">Delete everything?</h2>
        <p id="del-desc">
          Your account, words, walks and settings will be deleted{auth.status === 'disabled' ? ' from this device' : ''}. This
          can't be undone.
        </p>
        {deleteError && (
          <p role="alert" className={styles.deleteError}>
            Couldn't delete right now. Check your connection and try again.
          </p>
        )}
        <div className={styles.dialogActions}>
          <button type="button" className="btn" onClick={() => dialog.current?.close()} autoFocus>
            Keep my data
          </button>
          <button type="button" className={`btn ${styles.danger}`} onClick={confirmDelete}>
            Delete
          </button>
        </div>
      </dialog>
    </div>
  )
}
