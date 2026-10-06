import { Link } from 'react-router'
import { Avatar } from '../../components/Avatar/Avatar'
import { GearIcon } from '../../components/Icons'
import { buddySrc } from '../../components/Buddy/buddyImages'
import { useAuth } from '../../state/auth'
import { currentLesson } from '../../lib/course'
import { targetLanguageName } from '../../lib/languages'
import { levelLabel } from '../../lib/levels'
import { useProfile } from '../../state/profile'
import { useWalks, walkStats } from '../../state/walks'
import { useWords } from '../../state/words'
import styles from './Me.module.css'

export function Me() {
  const profile = useProfile()
  const auth = useAuth()
  const lesson = currentLesson(profile)
  const words = useWords(profile.targetLanguage)
  const { walksThisWeek, minutesSpoken } = walkStats(useWalks())
  const STATS = [
    { value: walksThisWeek, label: walksThisWeek === 1 ? 'call this week' : 'calls this week' },
    { value: minutesSpoken, label: 'minutes spoken' },
    { value: words.length, label: 'words learned' },
    { value: words.filter((w) => w.timesRemembered > 0).length, label: 'words remembered' },
  ]

  return (
    <div className="screen">
      <header className={styles.header}>
        <h1 className="page-title">Me</h1>
        <Link to="/settings" className={styles.gear} aria-label="Settings">
          <GearIcon />
        </Link>
      </header>

      {auth.status === 'signedIn' && (
        <section className={styles.who} aria-label="Your account">
          <Avatar name={auth.name} email={auth.email} avatarUrl={auth.avatarUrl} size={56} />
          <div>
            <p className={styles.name}>{auth.name ?? auth.email ?? 'Signed in'}</p>
            {auth.name && auth.email && <p className="soft">{auth.email}</p>}
          </div>
        </section>
      )}

      <section className="feature-card" aria-labelledby="level-card">
        <p className="eyebrow" id="level-card">
          {targetLanguageName(profile.targetLanguage)}
        </p>
        <p className={styles.level}>
          Level <strong>{levelLabel(profile.level, profile.targetLanguage)}</strong>
        </p>
        {lesson && (
          <>
            <p className="soft">
              Lesson {lesson.number} of {lesson.total}: {lesson.lesson.title}
            </p>
            <div className={styles.progress} aria-hidden="true">
              <span style={{ width: `${((lesson.number - 1) / lesson.total) * 100}%` }} />
            </div>
          </>
        )}
      </section>

      <img src={buddySrc('buddy_hero_card_banner.png')} alt="" className={styles.banner} />

      <ul className={styles.stats}>
        {STATS.map((s) => (
          <li key={s.label} className={styles.stat}>
            <span className={styles.value}>{s.value}</span>
            <span className={styles.label}>{s.label}</span>
          </li>
        ))}
      </ul>

      <p className="soft">Every call counts, however short. Buddy is here whenever you are.</p>
    </div>
  )
}
