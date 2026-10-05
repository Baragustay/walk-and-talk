import { useId, useState } from 'react'
import { useNavigate } from 'react-router'
import { languageName, searchLanguages, TARGET_LANGUAGES } from '../../lib/languages'
import { updateProfile, useProfile } from '../../state/profile'
import type { TargetLanguage } from '../../types'
import { OnboardingStep } from './OnboardingStep'
import styles from './Onboarding.module.css'

export function Languages() {
  const navigate = useNavigate()
  const profile = useProfile()
  const [query, setQuery] = useState('')
  const [mother, setMother] = useState(profile.motherTongue)
  const [target, setTarget] = useState<TargetLanguage>(profile.targetLanguage)
  const searchId = useId()
  const results = searchLanguages(query)

  const next = () => {
    updateProfile({ motherTongue: mother, targetLanguage: target })
    navigate('/onboarding/how')
  }

  return (
    <OnboardingStep
      step={3}
      title="Your languages"
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={next}>
          Next
        </button>
      }
    >
      <div className={styles.left}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>I speak</legend>
          <label htmlFor={searchId} className="visually-hidden">
            Search languages
          </label>
          <input
            id={searchId}
            className={styles.search}
            type="search"
            placeholder="Search languages"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <p className="soft" aria-live="polite">
            Selected: <strong>{languageName(mother)}</strong>
          </p>
          <ul className={styles.langList}>
            {results.map((l) => (
              <li key={l.code}>
                <label className={styles.option}>
                  <input
                    type="radio"
                    name="mother"
                    value={l.code}
                    checked={mother === l.code}
                    onChange={() => setMother(l.code)}
                  />
                  <span>{l.name}</span>
                  {l.native !== l.name && <span className={styles.native} lang={l.code}>{l.native}</span>}
                </label>
              </li>
            ))}
            {results.length === 0 && <li className={styles.option}>No language matches “{query}”.</li>}
          </ul>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>I want to practise</legend>
          {TARGET_LANGUAGES.map((l) => (
            <label key={l.code} className={styles.bigOption}>
              <input
                type="radio"
                name="target"
                value={l.code}
                checked={target === l.code}
                onChange={() => setTarget(l.code)}
              />
              <span>{l.name}</span>
              <span className={styles.native} lang={l.code}>{l.native}</span>
            </label>
          ))}
        </fieldset>
      </div>
    </OnboardingStep>
  )
}
