import { useNavigate } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { OnboardingStep } from './OnboardingStep'
import styles from './Onboarding.module.css'

export function Welcome() {
  const navigate = useNavigate()
  return (
    <OnboardingStep
      step={1}
      title="Hi, I'm Buddy"
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/onboarding/languages')}>
          Let's start
        </button>
      }
    >
      <Buddy state="waving" size={220} />
      <p className={styles.lead}>Call me while you walk, and we'll practise speaking a new language together.</p>
    </OnboardingStep>
  )
}
