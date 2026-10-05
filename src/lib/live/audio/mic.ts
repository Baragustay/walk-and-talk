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

export interface MicEvents {
  /** A 40 ms chunk as base64 16 kHz PCM, plus its loudest sample (0..32767). */
  onChunk: (base64Pcm: string, peak: number) => void
  /** The phone or browser paused ('muted') or cut ('ended') the microphone. */
  onTrackState?: (state: 'muted' | 'unmuted' | 'ended') => void
}

/** Streams the microphone as base64 16 kHz PCM chunks (40 ms each). */
export async function startMic({ onChunk, onTrackState }: MicEvents): Promise<Mic> {
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

  recorder.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
    const pcm = new Int16Array(e.data)
    let peak = 0
    for (let i = 0; i < pcm.length; i++) peak = Math.max(peak, Math.abs(pcm[i]))
    onChunk(bytesToBase64(new Uint8Array(e.data)), peak)
  }

  const track = stream.getAudioTracks()[0]
  if (track && onTrackState) {
    track.onmute = () => onTrackState('muted')
    track.onunmute = () => onTrackState('unmuted')
    track.onended = () => onTrackState('ended')
  }

  return {
    stop() {
      recorder.port.onmessage = null
      if (track) track.onmute = track.onunmute = track.onended = null
      source.disconnect()
      recorder.disconnect()
      mute.disconnect()
      stream.getTracks().forEach((t) => t.stop())
    },
  }
}
