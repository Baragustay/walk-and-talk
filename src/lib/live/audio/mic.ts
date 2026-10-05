import workletUrl from './recorder.worklet.js?worker&url'
import { bytesToBase64 } from './base64'
import { getAudioContext } from './context'

let workletReady: Promise<void> | null = null

export class MicError extends Error {
  constructor(public kind: 'denied' | 'unsupported') {
    super(kind)
  }
}

export interface Mic {
  stop(): void
}

/** Streams the microphone as base64 16 kHz PCM chunks (40 ms each). */
export async function startMic(onChunk: (base64Pcm: string) => void): Promise<Mic> {
  if (!navigator.mediaDevices?.getUserMedia) throw new MicError('unsupported')

  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })
  } catch {
    throw new MicError('denied')
  }

  const ctx = getAudioContext()
  workletReady ??= ctx.audioWorklet.addModule(workletUrl)
  await workletReady
  const source = ctx.createMediaStreamSource(stream)
  const recorder = new AudioWorkletNode(ctx, 'pcm-recorder')
  // Some browsers only run a worklet that's connected to the output; a muted gain keeps it silent.
  const mute = ctx.createGain()
  mute.gain.value = 0
  source.connect(recorder).connect(mute).connect(ctx.destination)

  recorder.port.onmessage = (e: MessageEvent<ArrayBuffer>) => onChunk(bytesToBase64(new Uint8Array(e.data)))

  return {
    stop() {
      recorder.port.onmessage = null
      source.disconnect()
      recorder.disconnect()
      mute.disconnect()
      stream.getTracks().forEach((t) => t.stop())
    },
  }
}
