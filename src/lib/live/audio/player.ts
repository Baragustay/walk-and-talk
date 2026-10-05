import { base64ToBytes } from './base64'
import { getAudioContext, getVoiceOutput } from './context'

const RATE = 24000 // Gemini Live speaks 24 kHz 16-bit PCM
const LEAD = 0.06 // seconds of buffer before the first chunk plays

/** Plays Buddy's audio chunks back to back. */
export class PcmPlayer {
  private nextTime = 0
  private sources = new Set<AudioBufferSourceNode>()

  constructor(private onPlayingChange: (playing: boolean) => void) {}

  get playing() {
    return this.sources.size > 0
  }

  enqueue(base64Pcm: string) {
    const ctx = getAudioContext()
    const bytes = base64ToBytes(base64Pcm)
    const pcm = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength >> 1)
    if (pcm.length === 0) return
    const buffer = ctx.createBuffer(1, pcm.length, RATE)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < pcm.length; i++) data[i] = pcm[i] / 0x8000

    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(getVoiceOutput())
    const startAt = Math.max(this.nextTime, ctx.currentTime + LEAD)
    src.start(startAt)
    this.nextTime = startAt + buffer.duration

    const wasPlaying = this.playing
    this.sources.add(src)
    src.onended = () => {
      this.sources.delete(src)
      if (!this.playing) this.onPlayingChange(false)
    }
    if (!wasPlaying) this.onPlayingChange(true)
  }

  /** Stop at once, e.g. when the user talks over Buddy. */
  clear() {
    const was = this.playing
    for (const s of this.sources) {
      s.onended = null
      try {
        s.stop()
      } catch {
        // already stopped
      }
    }
    this.sources.clear()
    this.nextTime = 0
    if (was) this.onPlayingChange(false)
  }
}
