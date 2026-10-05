import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { requestMicPermission, type MicResult } from '../../lib/mic'
import { OnboardingStep } from './OnboardingStep'
import styles from './Onboarding.module.css'

const MESSAGES: Record<Exclude<MicResult, 'granted'>, string> = {
  denied:
    "No microphone yet. That's okay. You can turn it on later in your browser settings, then come back.",
  unsupported:
    "This browser can't use the microphone here. Open the app over https (or on localhost) to talk with Buddy.",
}

export function MeetBuddy() {
  const navigate = useNavigate()
  const [result, setResult] = useState<MicResult | null>(null)
  const [asking, setAsking] = useState(false)

  const ask = async () => {
    setAsking(true)
    const r = await requestMicPermission()
    setAsking(false)
    setResult(r)
    if (r === 'granted') navigate('/onboarding/level')
  }

  return (
    <OnboardingStep
      step={4}
      title="Say hi to Buddy"
      footer={
        <>
          <button type="button" className="btn btn-primary btn-block" onClick={ask} disabled={asking}>
            {asking ? 'Waiting for permission…' : 'Allow microphone'}
          </button>
          {result && result !== 'granted' && (
            <button type="button" className="link-btn" onClick={() => navigate('/onboarding/level')}>
              Continue without it
            </button>
          )}
        </>
      }
    >
      <Buddy state="talking" size={200} />
      <p className={styles.lead}>
        To hear you, I need your microphone. I only listen while we're on a call.
      </p>
      {result && result !== 'granted' && (
        <p className={styles.note} role="alert">
          {MESSAGES[result]}
        </p>
      )}
    </OnboardingStep>
  )
}
