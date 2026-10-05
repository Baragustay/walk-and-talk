import { Link } from 'react-router'
import { GearIcon } from '../../components/Icons'
import { buddySrc } from '../../components/Buddy/buddyImages'
import { MOCK_STATS } from '../../mock/data'
import styles from './Me.module.css'

const STATS = [
  { value: MOCK_STATS.walksThisWeek, label: 'walks this week' },
  { value: MOCK_STATS.minutesSpoken, label: 'minutes spoken' },
  { value: MOCK_STATS.wordsLearned, label: 'words learned' },
  { value: MOCK_STATS.wordsRemembered, label: 'words remembered' },
]

export function Me() {
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
