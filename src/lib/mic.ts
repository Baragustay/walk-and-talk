export type MicResult = 'granted' | 'denied' | 'unsupported'

/** Ask for the microphone once, then release it straight away. */
export async function requestMicPermission(): Promise<MicResult> {
  // getUserMedia only exists on secure origins (https or localhost).
  if (!navigator.mediaDevices?.getUserMedia) return 'unsupported'
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop())
    return 'granted'
  } catch {
    return 'denied'
  }
}
