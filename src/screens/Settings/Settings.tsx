import { useId, useRef } from 'react'
import { prepareAudio } from '../../lib/live/audio/context'
import { useNavigate } from 'react-router'
import { BackIcon } from '../../components/Icons'
import { MOTHER_TONGUES, TARGET_LANGUAGES } from '../../lib/languages'
import { levelLabel } from '../../lib/levels'
import { deleteAllData, updateProfile, useProfile } from '../../state/profile'
import type { TargetLanguage } from '../../types'
import styles from './Settings.module.css'

const WALK_OPTIONS = [10, 15, 20, 30]

export function Settings() {
  const navigate = useNavigate()
  const profile = useProfile()
  const dialog = useRef<HTMLDialogElement>(null)
  const ids = { mother: useId(), target: useId(), walk: useId(), romaji: useId(), reminders: useId() }

  const confirmDelete = () => {
    deleteAllData()
    dialog.current?.close()
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

      <section className={styles.group} aria-labelledby="data-title">
        <h2 id="data-title" className="section-title">Your data</h2>
        <p className="soft">Everything stays on this device.</p>
        <button type="button" className={`btn ${styles.danger}`} onClick={() => dialog.current?.showModal()}>
          Delete my data
        </button>
      </section>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="del-title" aria-describedby="del-desc">
        <h2 id="del-title">Delete everything?</h2>
        <p id="del-desc">Your words, walks and settings will be removed from this device. This can't be undone.</p>
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
