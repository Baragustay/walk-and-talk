// Uses the browser's built-in voices. Returns false if there's no voice for the language.
const BCP47: Record<string, string> = { sv: 'sv-SE', es: 'es-ES', ja: 'ja-JP' }

export function canSpeak(lang: string): boolean {
  if (!('speechSynthesis' in window)) return false
  const voices = speechSynthesis.getVoices()
  // Some browsers load voices lazily; assume yes until we know otherwise.
  return voices.length === 0 || voices.some((v) => v.lang.toLowerCase().startsWith(lang))
}

export function speak(text: string, lang: string) {
  if (!('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = BCP47[lang] ?? lang
  u.rate = 0.9
  speechSynthesis.speak(u)
}
