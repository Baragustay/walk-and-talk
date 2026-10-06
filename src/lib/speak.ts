// Reads words aloud in Buddy's voice (Gemini TTS via supabase/functions/speak).
// Audio is cached per phrase, in memory and in the browser's Cache Storage, so each
// phrase is only generated once. Falls back to the browser's own voice if that fails.
import { speakUrl, supabaseAnonKey } from './supabase'
import { accessToken } from '../state/auth'
import { BUDDY_VOICE } from './live/model'

const BCP47: Record<string, string> = { sv: 'sv-SE', es: 'es-ES', ja: 'ja-JP' }
const memory = new Map<string, string>() // phrase -> blob URL
let current: HTMLAudioElement | null = null

export function canSpeak(lang: string): boolean {
  if (speakUrl) return true
  if (!('speechSynthesis' in window)) return false
  const voices = speechSynthesis.getVoices()
  return voices.length === 0 || voices.some((v) => v.lang.toLowerCase().startsWith(lang))
}

async function buddyAudio(text: string): Promise<string> {
  const key = `${BUDDY_VOICE}|${text}`
  const hit = memory.get(key)
  if (hit) return hit
  const cacheKey = `https://voice.cache/${encodeURIComponent(key)}`
  let blob: Blob | null = null
  try {
    const cached = await (await caches.open('wt-voice')).match(cacheKey)
    if (cached) blob = await cached.blob()
  } catch {
    // Cache Storage unavailable (private mode): just fetch
  }
  if (!blob) {
    const auth = await accessToken()
    const res = await fetch(speakUrl!, {
      method: 'POST',
      headers: { apikey: supabaseAnonKey, 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) throw new Error(`speak ${res.status}`)
    blob = await res.blob()
    try {
      await (await caches.open('wt-voice')).put(cacheKey, new Response(blob, { headers: { 'Content-Type': blob.type } }))
    } catch {
      // ignore
    }
  }
  const url = URL.createObjectURL(blob)
  memory.set(key, url)
  return url
}

function browserVoice(text: string, lang: string) {
  if (!('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = BCP47[lang] ?? lang
  u.rate = 0.9
  speechSynthesis.speak(u)
}

/** Say a word or phrase. Resolves when playback has started (or failed over). */
export async function speak(text: string, lang: string) {
  current?.pause()
  if (!speakUrl) return browserVoice(text, lang)
  try {
    current = new Audio(await buddyAudio(text))
    await current.play()
  } catch {
    browserVoice(text, lang)
  }
}
