// Runs on the audio thread. Takes mic audio at the device rate (often 48 kHz),
// downsamples to 16 kHz mono 16-bit PCM, and posts 40 ms chunks to the main thread.
const TARGET_RATE = 16000
const CHUNK = 640 // 40 ms at 16 kHz

class PcmRecorder extends AudioWorkletProcessor {
  constructor() {
    super()
    this.ratio = sampleRate / TARGET_RATE
    this.pos = 0
    this.sum = 0
    this.count = 0
    this.out = new Int16Array(CHUNK)
    this.idx = 0
  }

  process(inputs) {
    const input = inputs[0] && inputs[0][0]
    if (!input) return true
    for (let i = 0; i < input.length; i++) {
      // Average the input samples that fall into each output sample (a simple low-pass).
      this.sum += input[i]
      this.count++
      this.pos += 1
      if (this.pos >= this.ratio) {
        this.pos -= this.ratio
        const s = Math.max(-1, Math.min(1, this.sum / this.count))
        this.sum = 0
        this.count = 0
        this.out[this.idx++] = s < 0 ? s * 0x8000 : s * 0x7fff
        if (this.idx === CHUNK) {
          this.port.postMessage(this.out.buffer, [this.out.buffer])
          this.out = new Int16Array(CHUNK)
          this.idx = 0
        }
      }
    }
    return true
  }
}

registerProcessor('pcm-recorder', PcmRecorder)
