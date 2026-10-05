import { prepareAudio } from '../../lib/live/audio/context'
import { useNavigate } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { targetLanguageName } from '../../lib/languages'
import { pathAfterOnboarding } from '../../state/auth'
import { updateProfile, useProfile } from '../../state/profile'
import { OnboardingStep } from './OnboardingStep'
import styles from './Onboarding.module.css'

export function LevelIntro() {
  const navigate = useNavigate()
  const profile = useProfile()

  const skip = () => {
    updateProfile({ level: 'A1', levelNote: 'Skipped level call', onboarded: true })
    navigate(pathAfterOnboarding(), { replace: true })
  }

  return (
    <OnboardingStep
      step={6}
      title="A first short call"
      footer={
        <>
          <button type="button" className="btn btn-primary btn-block" onClick={() => {
              prepareAudio()
              navigate('/call?mode=level')
            }}>
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
        I'll ask you how to say a few things in {targetLanguageName(profile.targetLanguage)}, so I know where to start.
        Not knowing is completely fine. It takes a few minutes, wherever you are.
      </p>
    </OnboardingStep>
  )
}
