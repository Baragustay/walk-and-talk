import { useNavigate } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { useAuth } from '../../state/auth'
import { startFresh } from '../../state/reset'
import { OnboardingStep } from './OnboardingStep'
import styles from './Onboarding.module.css'

export function Welcome() {
  const navigate = useNavigate()
  const auth = useAuth()

  // A new run through onboarding starts blank, unless this is a logged-in account
  // that just hasn't finished onboarding (e.g. signed in on a new phone).
  const start = async () => {
    if (auth.status !== 'signedIn') await startFresh()
    navigate('/onboarding/about')
  }

  return (
    <OnboardingStep
      step={1}
      title="Hi, I'm Buddy"
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={start}>
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
      <p className={styles.brand}>Walk &amp; Talk</p>
      <Buddy state="waving" size={220} />
      <p className={styles.lead}>Call me while you walk, and we'll practise speaking a new language together.</p>
      <p className="soft">For adults (18+).</p>
    </OnboardingStep>
  )
}
