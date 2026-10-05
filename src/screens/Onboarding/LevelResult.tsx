import { useNavigate, useSearchParams } from 'react-router'
import { Buddy } from '../../components/Buddy/Buddy'
import { courseFor, currentLesson } from '../../lib/course'
import { levelLabel } from '../../lib/levels'
import { useProfile } from '../../state/profile'
import styles from './Onboarding.module.css'

const PLAIN: Record<string, string> = {
  preA1: 'You’re just starting. Perfect: we’ll build from the very first words.',
  A1: 'You know some basics. We’ll make them solid and add more.',
  A2: 'You can handle simple conversations. We’ll talk about everyday life.',
  B1: 'You can get by. We’ll have real conversations and fill the gaps.',
  B2: 'You speak well. We’ll chat freely and polish the details.',
  C1: 'You’re advanced. We’ll talk about anything you like.',
}

// Shown after the level call: what Buddy found, and the plan from here.
export function LevelResult() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const profile = useProfile()
  const plan = currentLesson(profile)
  const course = courseFor(profile.targetLanguage)
  const upcoming = plan && course ? course.slice(plan.number - 1, plan.number + 2) : []

  return (
    <div className={styles.page}>
      <main className={styles.body} style={{ paddingTop: 'var(--space-6)' }}>
        <Buddy state="happy" size={160} />
        <h1>Your level: {levelLabel(profile.level, profile.targetLanguage)}</h1>
        <p className={styles.lead}>{PLAIN[profile.level] ?? ''}</p>
        {profile.levelNote && <p className={styles.note}>{profile.levelNote}</p>}

        <section className={styles.left} aria-labelledby="plan-title">
          <h2 id="plan-title" className="section-title">
            Your plan
          </h2>
          {plan ? (
            <>
              <p>
                Short lessons, one per call. You start at lesson {plan.number} of {plan.total}.
              </p>
              <ol className={styles.planList} start={plan.number}>
                {upcoming.map((l) => (
                  <li key={l.id}>
                    <strong>{l.title}</strong>
                    <span className="soft"> – you’ll be able to {l.canDo}.</span>
                  </li>
                ))}
              </ol>
              <p className="soft">After the lessons, Buddy switches to real conversations.</p>
            </>
          ) : (
            <p>
              Conversations with Buddy about your day and the things you like. Buddy gives you new words when you’re stuck
              and brings them back on later calls.
            </p>
          )}
          <p className="soft">A short call most days works best.</p>
        </section>
      </main>
      <footer className={styles.footer}>
        <button type="button" className="btn btn-primary btn-block" onClick={() => navigate(next, { replace: true })}>
          Continue
        </button>
      </footer>
    </div>
  )
}
