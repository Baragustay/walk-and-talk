import { NavLink } from 'react-router'
import { HomeIcon, MeIcon, WordsIcon } from '../Icons'
import styles from './TabBar.module.css'

const TABS = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/words', label: 'Words', Icon: WordsIcon, end: false },
  { to: '/me', label: 'Me', Icon: MeIcon, end: false },
]

export function TabBar() {
  return (
    <nav className={styles.bar} aria-label="Main">
      <ul>
        {TABS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>
              <span className={styles.icon}>
                <Icon />
              </span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
