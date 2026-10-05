// One shared AudioContext for mic capture and Buddy's voice.
// Mobile Safari only lets audio start inside a tap, so call prepareAudio() from the
// click handler that starts a call (before navigating), not later in an effect.
let ctx: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext({ latencyHint: 'interactive' })
  return ctx
}

export function prepareAudio() {
  void getAudioContext().resume()
}

export function isAudioRunning(): boolean {
  return ctx?.state === 'running'
}
