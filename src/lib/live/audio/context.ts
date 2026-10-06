// One shared AudioContext for mic capture and Buddy's voice.
// Mobile Safari only lets audio start inside a tap, so call prepareAudio() from the
// click handler that starts a call (before navigating), not later in an effect.
let ctx: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext({ latencyHint: 'interactive' })
  return ctx
}

let output: AudioNode | null = null
let player: HTMLAudioElement | null = null

/**
 * Where Buddy's voice (and the call sounds) go: a boost and a limiter, then out through a
 * plain <audio> element rather than straight to the speakers.
 * - Safari can silence Web Audio output once the microphone is on; media elements keep playing.
 * - iPhones mute Web Audio with the silent switch, but not media elements.
 * - Phones play quieter while the mic is on; the limiter lets us boost without distortion.
 */
export function getVoiceOutput(): AudioNode {
  if (output) return output
  const ctx = getAudioContext()
  const boost = ctx.createGain()
  boost.gain.value = 2.5
  const limiter = ctx.createDynamicsCompressor()
  limiter.threshold.value = -10
  limiter.knee.value = 6
  limiter.ratio.value = 12
  limiter.attack.value = 0.003
  limiter.release.value = 0.15
  boost.connect(limiter)

  const stream = ctx.createMediaStreamDestination()
  limiter.connect(stream)
  player = getPlayer()
  player.srcObject = stream.stream
  player.play().catch(() => {
    // The element couldn't start (no tap yet?). Fall back to direct output.
    limiter.disconnect(stream)
    limiter.connect(ctx.destination)
  })
  output = boost
  return output
}

function getPlayer(): HTMLAudioElement {
  if (!player) {
    player = document.createElement('audio')
    player.autoplay = true
    player.setAttribute('playsinline', '')
    player.setAttribute('aria-hidden', 'true')
  }
  return player
}

/** Call inside the tap that starts a call: unlocks both the AudioContext and the audio element. */
export function prepareAudio() {
  void getAudioContext().resume()
  getVoiceOutput()
  void getPlayer().play().catch(() => {})
}

export function isAudioRunning(): boolean {
  return ctx?.state === 'running'
}

/** Resume after the browser paused audio (also restarts the audio element). */
export async function resumeAudio() {
  await getAudioContext().resume()
  await getPlayer().play().catch(() => {})
}
