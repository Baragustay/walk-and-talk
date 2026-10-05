// One shared AudioContext for mic capture and Buddy's voice.
// Mobile Safari only lets audio start inside a tap, so call prepareAudio() from the
// click handler that starts a call (before navigating), not later in an effect.
let ctx: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext({ latencyHint: 'interactive' })
  return ctx
}

let output: AudioNode | null = null

/**
 * Where Buddy's voice goes: a boost plus a limiter. Phones (iPhones especially) play much
 * quieter while the microphone is on; the limiter keeps the boost from distorting.
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
  boost.connect(limiter).connect(ctx.destination)
  output = boost
  return output
}

export function prepareAudio() {
  void getAudioContext().resume()
}

export function isAudioRunning(): boolean {
  return ctx?.state === 'running'
}
