import { useEffect, useId, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { GoogleIcon } from '../../components/GoogleIcon'
import { BackIcon } from '../../components/Icons'
import { continueWithEmail, continueWithGoogle, signInExisting, signOut, useAuth, useAuthError } from '../../state/auth'
import { resetLocalProfile, useProfile } from '../../state/profile'
import { useProfileLoadedFor } from '../../state/profileSync'
import styles from './Account.module.css'

// /account                    keep progress (attach Google or email to the trial account)
// /account?from=onboarding    same, right after the level call, with "Not now"
// /account?mode=signin        returning user on a new device
export function Account() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fromOnboarding = params.get('from') === 'onboarding'
  const signIn = params.get('mode') === 'signin'
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const authError = useAuthError()
  const [error, setError] = useState<string | null>(authError)
  const [busy, setBusy] = useState(false)
  const emailId = useId()

  const done = () => navigate('/', { replace: true })
  const profile = useProfile()
  const loadedFor = useProfileLoadedFor()

  // Back from Google (or the email link) and signed in: carry on to Home, or to onboarding if
  // this account has never been set up.
  useEffect(() => {
    if (auth.status !== 'signedIn' || loadedFor !== auth.userId || sentTo) return
    navigate(profile.onboarded ? '/' : '/onboarding/about', { replace: true })
  }, [auth, loadedFor, profile.onboarded, sentTo, navigate])

  const google = async () => {
    setError(null)
    setBusy(true)
    try {
      // Leaves the page for Google, then comes back to the app signed in.
      await (signIn ? signInExisting({ google: true }) : continueWithGoogle())
    } catch (e) {
      setBusy(false)
      setError(
        String((e as Error).message).includes('already')
          ? 'That Google account already has Walk & Talk. Use "I already have an account" instead.'
          : 'Google sign-in didn’t work. Try again, or use your email.',
      )
    }
  }

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = email.trim()
    if (!value) return
    setError(null)
    setBusy(true)
    try {
      await (signIn ? signInExisting({ email: value }) : continueWithEmail(value))
      setSentTo(value)
    } catch {
      setError('We couldn’t send the link. Check the address and try again.')
    }
    setBusy(false)
  }

  if (auth.status === 'signedIn' && !sentTo) {
    return (
      <div className={styles.page}>
        <Buddy state="happy" size={180} />
        <h1>Your progress is saved</h1>
        <p className="soft">Signed in{auth.email ? ` as ${auth.email}` : ''}. Your words and lessons follow you to any device.</p>
        <button type="button" className="btn btn-primary btn-block" onClick={done}>
          Done
        </button>
      </div>
    )
  }

  if (sentTo) {
    return (
      <div className={styles.page}>
        <Buddy state="waving" size={180} />
        <h1>Check your email</h1>
        <p className="soft">
          We sent a link to <strong>{sentTo}</strong>. Open it on this phone to {signIn ? 'sign in' : 'save your progress'}.
        </p>
        <button type="button" className="link-btn" onClick={() => setSentTo(null)}>
          Use a different email
        </button>
        <button type="button" className="btn btn-block" onClick={done}>
          Back home
        </button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {!fromOnboarding && (
        <button type="button" className={styles.back} onClick={() => navigate(-1)} aria-label="Back">
          <BackIcon />
        </button>
      )}
      <Buddy state="happy" size={180} />
      <h1>{signIn ? 'Welcome back' : 'Keep your progress'}</h1>
      <p className="soft">
        {signIn
          ? 'Sign in to pick up where you left off.'
          : fromOnboarding
            ? 'Save your level and plan to start your lessons. It’s free and takes a moment.'
            : 'Save your level, lessons and words, so they’re here next time, on any device.'}
      </p>

      <button type="button" className={`btn btn-block ${styles.google}`} onClick={google} disabled={busy}>
        <GoogleIcon />
        Continue with Google
      </button>

      <p className={styles.or} aria-hidden="true">
        or
      </p>

      <form className={styles.form} onSubmit={sendLink}>
        <label htmlFor={emailId}>Email</label>
        <input
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          Send me a link
        </button>
      </form>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!signIn && (
        <button
          type="button"
          className="link-btn"
          onClick={async () => {
            await signOut()
            resetLocalProfile()
            navigate('/welcome', { replace: true })
          }}
        >
          Not you? Start over
        </button>
      )}
      {signIn || (
        <button type="button" className="link-btn" onClick={() => navigate('/account?mode=signin')}>
          I already have an account
        </button>
      )}
      <p className={styles.small}>
        For adults (18+). We only store what Buddy needs to teach you. No voice recordings.
      </p>
    </div>
  )
}
