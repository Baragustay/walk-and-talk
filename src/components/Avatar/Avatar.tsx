import { useState } from 'react'
import styles from './Avatar.module.css'

interface Props {
  name: string | null
  email: string | null
  avatarUrl: string | null
  size?: number
}

/** The signed-in person: their Google photo, or their initial in a circle. */
export function Avatar({ name, email, avatarUrl, size = 44 }: Props) {
  const [broken, setBroken] = useState(false)
  const initial = (name || email || '?').trim().charAt(0).toUpperCase()
  const style = { width: size, height: size, fontSize: size * 0.42 }
  if (avatarUrl && !broken) {
    return (
      <img
        className={styles.avatar}
        style={style}
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer" // Google photos refuse requests that send a referrer
        onError={() => setBroken(true)}
      />
    )
  }
  return (
    <span className={`${styles.avatar} ${styles.initial}`} style={style} aria-hidden="true">
      {initial}
    </span>
  )
}
