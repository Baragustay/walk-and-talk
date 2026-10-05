import { useNavigate } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { targetLanguageName } from '../../lib/languages'
import { updateProfile, useProfile } from '../../state/profile'
import { OnboardingStep } from './OnboardingStep'
import styles from './Onboarding.module.css'

export function LevelIntro() {
  const navigate = useNavigate()
  const profile = useProfile()

  const skip = () => {
    updateProfile({ level: 'A1', levelNote: 'Skipped level call', onboarded: true })
    navigate('/', { replace: true })
  }

  return (
    <OnboardingStep
      step={5}
      title="A first short call"
      footer={
        <>
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/call?mode=level')}>
            Start level call
          </button>
          <button type="button" className="link-btn" onClick={skip}>
            Skip for now
          </button>
        </>
      }
    >
      <Buddy state="idle" size={200} />
      <p className={styles.lead}>
        Let's chat in {targetLanguageName(profile.targetLanguage)} for 3 to 5 minutes, so I know where to start. Sitting
        down is fine.
      </p>
    </OnboardingStep>
  )
}
