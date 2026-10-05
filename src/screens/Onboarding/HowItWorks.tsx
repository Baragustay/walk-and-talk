import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { OnboardingStep } from './OnboardingStep'
import styles from './Onboarding.module.css'

const CARDS = [
  'Call Buddy and just talk.',
  'Stuck? Say it in your own language and Buddy gives you the word.',
  'Your new words come back on later walks.',
]

export function HowItWorks() {
  const navigate = useNavigate()
  const scroller = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  // Track which card is in view when the user swipes.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth))
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const goTo = (i: number) => {
    const el = scroller.current
    if (!el) return
    const card = el.children[i] as HTMLElement
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft) })
    setIndex(i)
  }

  const last = index === CARDS.length - 1

  return (
    <OnboardingStep
      step={3}
      title="How it works"
      footer={
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => (last ? navigate('/onboarding/meet') : goTo(index + 1))}
        >
          {last ? 'Got it' : 'Next'}
        </button>
      }
    >
      <div ref={scroller} className={styles.carousel} aria-roledescription="carousel" aria-label="How it works">
        {CARDS.map((text, i) => (
          <section
            key={i}
            className={styles.howCard}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${CARDS.length}`}
            aria-hidden={i !== index}
          >
            <span className={styles.howNum} aria-hidden="true">{i + 1}</span>
            <p className={styles.howText}>{text}</p>
          </section>
        ))}
      </div>
      <div className={styles.pager}>
        {CARDS.map((_, i) => (
          <button
            key={i}
            type="button"
            className={styles.pagerDot}
            aria-label={`Card ${i + 1}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </OnboardingStep>
  )
}
