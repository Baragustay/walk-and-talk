import type { TargetLanguage, Word } from '../../types'
import styles from './WordText.module.css'

interface Props {
  word: Word
  lang: TargetLanguage
  showRomaji: boolean
  size?: 'md' | 'lg'
}

/** The target-language word. Japanese: kana reading above the kanji, romaji below. */
export function WordText({ word, lang, showRomaji, size = 'md' }: Props) {
  const cls = `${styles.word} ${size === 'lg' ? styles.lg : ''}`
  if (lang !== 'ja') {
    return (
      <span className={cls} lang={lang}>
        {word.target}
      </span>
    )
  }
  const main = word.kanji && word.kana && word.kanji !== word.kana ? (
    <ruby>
      {word.kanji}
      <rp>(</rp>
      <rt>{word.kana}</rt>
      <rp>)</rp>
    </ruby>
  ) : (
    word.kana ?? word.target
  )
  return (
    <span className={styles.ja}>
      <span className={cls} lang="ja">
        {main}
      </span>
      {showRomaji && word.romaji && <span className={styles.romaji}>{word.romaji}</span>}
    </span>
  )
}
