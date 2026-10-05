import { useEffect, useRef, useState } from 'react'
import { BUDDY_ALT, BUDDY_IMAGES, buddySrc, type BuddyState } from './buddyImages'
import styles from './Buddy.module.css'

// Files that failed to load, shared across all Buddy instances so we only try once.
const missing = new Set<string>()

function resolveFile(state: BuddyState): string | null {
  for (const file of [BUDDY_IMAGES[state], BUDDY_IMAGES.idle]) {
    if (!missing.has(file)) return file
  }
  return null
}

interface Props {
  state: BuddyState
  size?: number // px, width of the square
  /** Also announce state changes to screen readers (use on the Call screen). */
  announce?: boolean
}

interface Layer {
  key: number
  state: BuddyState
}

export function Buddy({ state, size = 200, announce = false }: Props) {
  const [layers, setLayers] = useState<Layer[]>([{ key: 0, state }])
  const [, rerender] = useState(0)
  const nextKey = useRef(1)

  // Cross-fade: put the new state on top, fade it in, then drop the old layer.
  useEffect(() => {
    setLayers((prev) => {
      if (prev[prev.length - 1].state === state) return prev
      return [...prev.slice(-1), { key: nextKey.current++, state }]
    })
    const t = setTimeout(() => setLayers((prev) => prev.slice(-1)), 400)
    return () => clearTimeout(t)
  }, [state])

  const onError = (file: string) => {
    if (!missing.has(file)) {
      missing.add(file)
      rerender((n) => n + 1)
    }
  }

  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      {layers.map((layer, i) => {
        const isTop = i === layers.length - 1
        const file = resolveFile(layer.state)
        const fadeClass = layers.length > 1 ? (isTop ? styles.fadeIn : styles.fadeOut) : ''
        if (!file) {
          return (
            <div
              key={layer.key}
              className={`${styles.layer} ${styles.placeholder} ${fadeClass}`}
              role={isTop ? 'img' : undefined}
              aria-label={isTop ? BUDDY_ALT[layer.state] : undefined}
              aria-hidden={isTop ? undefined : true}
            />
          )
        }
        return (
          <img
            key={layer.key}
            className={`${styles.layer} ${fadeClass}`}
            src={buddySrc(file)}
            alt={isTop ? BUDDY_ALT[layer.state] : ''}
            aria-hidden={isTop ? undefined : true}
            onError={() => onError(file)}
            draggable={false}
          />
        )
      })}
      {announce && (
        <p className="visually-hidden" role="status">
          {BUDDY_ALT[state]}
        </p>
      )}
    </div>
  )
}
