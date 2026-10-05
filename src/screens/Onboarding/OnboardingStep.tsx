import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { BackIcon } from '../../components/Icons'
import styles from './Onboarding.module.css'

interface Props {
  step: number
  total?: number
  title: string
  children: ReactNode
  footer: ReactNode
}

export function OnboardingStep({ step, total = 5, title, children, footer }: Props) {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        {step > 1 ? (
          <button type="button" className={styles.back} onClick={() => navigate(-1)} aria-label="Back">
            <BackIcon />
          </button>
        ) : (
          <span className={styles.back} aria-hidden="true" />
        )}
        <p className={styles.progress}>
          <span className="visually-hidden">Step {step} of {total}</span>
          <span aria-hidden="true" className={styles.dots}>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={i < step ? styles.dotOn : styles.dot} />
            ))}
          </span>
        </p>
        <span className={styles.back} aria-hidden="true" />
      </header>
      <main className={styles.body}>
        <h1>{title}</h1>
        {children}
      </main>
      <footer className={styles.footer}>{footer}</footer>
    </div>
  )
}
