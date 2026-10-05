import { useNavigate } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { useAuth } from '../../state/auth'
import { OnboardingStep } from './OnboardingStep'
import styles from './Onboarding.module.css'

export function Welcome() {
  const navigate = useNavigate()
  const auth = useAuth()
  return (
    <OnboardingStep
      step={1}
      title="Hi, I'm Buddy"
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/onboarding/languages')}>
          Let's start
        </button>
      }
      secondary={
        auth.status !== 'disabled' && (
          <button type="button" className="link-btn" onClick={() => navigate('/account?mode=signin')}>
            I already have an account
          </button>
        )
      }
    >
      <Buddy state="waving" size={220} />
      <p className={styles.lead}>Call me while you walk, and we'll practise speaking a new language together.</p>
      <p className="soft">For adults (18+).</p>
    </OnboardingStep>
  )
}
