import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { AGE_RANGES, type AgeRange } from '../../lib/age'
import { updateProfile, useProfile } from '../../state/profile'
import { OnboardingStep } from './OnboardingStep'
import styles from './Onboarding.module.css'

export function AboutYou() {
  const navigate = useNavigate()
  const profile = useProfile()
  const [age, setAge] = useState<AgeRange | 'under18' | null>(profile.ageRange)

  if (age === 'under18') {
    return (
      <OnboardingStep
        step={2}
        title="Walk & Talk is for adults, for now"
        footer={
          <button type="button" className="btn btn-block" onClick={() => setAge(null)}>
            Back
          </button>
        }
      >
        <Buddy state="encouraging" size={180} />
        <p className={styles.lead}>Thanks for wanting to learn with me! Right now I can only talk with people who are 18 or older.</p>
      </OnboardingStep>
    )
  }

  const next = () => {
    if (!age) return
    updateProfile({ ageRange: age })
    navigate('/onboarding/languages')
  }

  return (
    <OnboardingStep
      step={2}
      title="About you"
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={next} disabled={!age}>
          Next
        </button>
      }
    >
      <div className={styles.left}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>How old are you?</legend>
          <p className="soft">So Buddy can pick things to talk about that fit your life.</p>
          <div className="chips">
            {AGE_RANGES.map((r) => (
              <label key={r.id} className="chip">
                <input type="radio" name="age" checked={age === r.id} onChange={() => setAge(r.id)} />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
          <button type="button" className={`link-btn ${styles.under18}`} onClick={() => setAge('under18')}>
            I’m under 18
          </button>
        </fieldset>
      </div>
    </OnboardingStep>
  )
}
