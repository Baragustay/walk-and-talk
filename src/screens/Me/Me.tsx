import { Link } from 'react-router'
import { GearIcon } from '../../components/Icons'
import { buddySrc } from '../../components/Buddy/buddyImages'
import { useProfile } from '../../state/profile'
import { useWalks, walkStats } from '../../state/walks'
import { useWords } from '../../state/words'
import styles from './Me.module.css'

export function Me() {
  const profile = useProfile()
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
        <h1>Me</h1>
        <Link to="/settings" className={styles.gear} aria-label="Settings">
          <GearIcon />
        </Link>
      </header>

      <img src={buddySrc('buddy_hero_card_banner.png')} alt="" className={styles.banner} />

      <ul className={styles.stats}>
        {STATS.map((s) => (
          <li key={s.label} className={styles.stat}>
            <span className={styles.value}>{s.value}</span>
            <span className={styles.label}>{s.label}</span>
          </li>
        ))}
      </ul>

      <p className="soft">Every walk counts, however short. Buddy is here whenever you are.</p>
    </div>
  )
}
