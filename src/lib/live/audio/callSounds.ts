// Phone-call sounds made with oscillators, so there are no audio files. Kept soft on purpose.
import { getAudioContext, getVoiceOutput } from './context'

const VOLUME = 0.03 // goes through the voice boost (x2.5)

/** One tone (or chord) with soft edges, so it never clicks or startles. */
function tone(freqs: number[], start: number, duration: number, volume = VOLUME) {
  const ctx = getAudioContext()
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.04)
  gain.gain.setValueAtTime(volume, start + duration - 0.06)
  gain.gain.linearRampToValueAtTime(0, start + duration)
  gain.connect(getVoiceOutput())
  const oscs = freqs.map((f) => {
    const o = ctx.createOscillator()
    o.frequency.value = f
    o.connect(gain)
    o.start(start)
    o.stop(start + duration)
    return o
  })
  oscs[0].onended = () => gain.disconnect()
  return { stop: () => oscs.forEach((o) => o.stop()) }
}

export const RING_CYCLE_S = 3.2 // 1.2 s ring, 2 s pause

/** Ringback tone until stop() is called. */
export function startRinging(): { stop: () => void } {
  const ctx = getAudioContext()
  let stopped = false
  let current: { stop: () => void } | null = null
  let next = ctx.currentTime + 0.05
  const schedule = () => {
    if (stopped) return
    current = tone([440, 480], next, 1.2)
    next += RING_CYCLE_S
    timer = setTimeout(schedule, (next - ctx.currentTime - 0.3) * 1000)
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  schedule()
  return {
    stop() {
      stopped = true
      clearTimeout(timer)
      try {
        current?.stop()
      } catch {
        // already finished
      }
    },
  }
}

/** Two rising notes: Buddy picked up. */
export function playPickup() {
  const t = getAudioContext().currentTime + 0.02
  tone([660], t, 0.09)
  tone([880], t + 0.1, 0.12)
}

/** Three short beeps: call ended. */
export function playHangup() {
  const t = getAudioContext().currentTime + 0.02
  for (let i = 0; i < 3; i++) tone([425], t + i * 0.3, 0.16)
}
