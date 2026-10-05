import type { TargetLanguage } from '../types'

export const TARGET_LANGUAGES: { code: TargetLanguage; name: string; native: string }[] = [
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
]

// Mother tongues offered in onboarding. Names come from the browser (Intl.DisplayNames),
// so we only keep codes here.
const MOTHER_TONGUE_CODES = [
  'af', 'am', 'ar', 'bg', 'bn', 'bs', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'en', 'es', 'et',
  'fa', 'fi', 'fil', 'fr', 'ga', 'gu', 'he', 'hi', 'hr', 'hu', 'hy', 'id', 'is', 'it', 'ja',
  'ka', 'kk', 'km', 'kn', 'ko', 'ku', 'lt', 'lv', 'mk', 'ml', 'mn', 'mr', 'ms', 'my', 'nb',
  'ne', 'nl', 'pa', 'pl', 'ps', 'pt', 'ro', 'ru', 'si', 'sk', 'sl', 'so', 'sq', 'sr', 'sv',
  'sw', 'ta', 'te', 'th', 'ti', 'tr', 'uk', 'ur', 'uz', 'vi', 'yo', 'zh', 'zu',
]

function displayName(code: string, inLocale: string): string {
  try {
    return new Intl.DisplayNames([inLocale], { type: 'language' }).of(code) ?? code
  } catch {
    return code
  }
}

export interface LanguageOption {
  code: string
  name: string // in English
  native: string // in the language itself
}

export const MOTHER_TONGUES: LanguageOption[] = MOTHER_TONGUE_CODES.map((code) => ({
  code,
  name: displayName(code, 'en'),
  native: displayName(code, code),
})).sort((a, b) => a.name.localeCompare(b.name))

export function languageName(code: string): string {
  return displayName(code, 'en')
}

export function targetLanguageName(code: TargetLanguage): string {
  return TARGET_LANGUAGES.find((l) => l.code === code)?.name ?? code
}

export function searchLanguages(query: string): LanguageOption[] {
  const q = query.trim().toLowerCase()
  if (!q) return MOTHER_TONGUES
  return MOTHER_TONGUES.filter(
    (l) => l.name.toLowerCase().includes(q) || l.native.toLowerCase().includes(q) || l.code === q,
  )
}

/** Best guess at the user's mother tongue from the browser, if we offer it. */
export function guessMotherTongue(): string {
  const base = (navigator.language || 'en').split('-')[0]
  return MOTHER_TONGUE_CODES.includes(base) ? base : 'en'
}
