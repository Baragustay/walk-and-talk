// One phone call with Buddy over the Gemini Live API. No React in here.
import { GoogleGenAI, Modality, type FunctionDeclaration, type LiveServerMessage, type Session } from '@google/genai'
import type { BuddyState } from '../../components/Buddy/buddyImages'
import { keepScreenOn, releaseScreen } from '../wakeLock'
import { isAudioRunning, getAudioContext } from './audio/context'
import { MicError, startMic, type Mic } from './audio/mic'
import { PcmPlayer } from './audio/player'
import { LIVE_API_VERSION } from './model'
import type { ToolHandler } from './tools'

export type CallStatus = 'connecting' | 'live' | 'reconnecting' | 'ended' | 'error'
export type CallError = 'mic-denied' | 'mic-unsupported' | 'token' | 'network'

export interface Bubble {
  id: number
  who: 'buddy' | 'user'
  text: string
  done: boolean
}

export interface CallSnapshot {
  status: CallStatus
  error: CallError | null
  buddyState: BuddyState
  bubbles: Bubble[]
  /** When the line opened (ms), for the timer. */
  connectedAt: number | null
  /** The browser blocked or paused audio; the user needs to tap once. */
  audioBlocked: boolean
  /** Recent events, newest last. Shown when call debug is on in Settings. */
  log: string[]
}

export interface LiveCallOptions {
  systemPrompt: string
  kickoff: string
  tools?: FunctionDeclaration[]
  /** Runs Buddy's function calls; the returned object goes back to Buddy as the result. */
  onToolCall?: ToolHandler
  onChange: (s: CallSnapshot) => void
}

// If Buddy hasn't answered after real words (or a tool call), nudge it once, then give up.
const NUDGE_AFTER_MS = 8_000
const GIVE_UP_AFTER_MS = 10_000
const NUDGE = '(The user is waiting for your reply. Please continue.)'

export class LiveCall {
  private snap: CallSnapshot = {
    status: 'connecting',
    error: null,
    buddyState: 'thinking',
    bubbles: [],
    connectedAt: null,
    audioBlocked: false,
    log: [],
  }
  private startedAt = Date.now()
  private session: Session | null = null
  private sessionGen = 0
  private mic: Mic | null = null
  private player = new PcmPlayer(() => this.updateBuddyState())
  private token: { value: string; model: string; expiresAt: number } | null = null
  private resumeHandle: string | undefined
  private ending = false
  private screenHeld = false
  private nextBubbleId = 1
  // Raw signals that Buddy's state is derived from
  private userSpeaking = false
  private awaitingReplySince: number | null = null
  private thinkingTimer: ReturnType<typeof setTimeout> | null = null
  /** The user said actual words (or a tool ran) since Buddy last spoke, so a reply is owed. */
  private replyOwed = false
  private nudged = false
  private turnHadAudio = false

  constructor(private opts: LiveCallOptions) {}

  get snapshot() {
    return this.snap
  }

  async start() {
    keepScreenOn()
    this.screenHeld = true
    // Phones can pause audio mid-call (lock screen, other apps, notifications).
    getAudioContext().onstatechange = this.onAudioState
    try {
      this.mic = await startMic((pcm) => this.sendAudio(pcm))
    } catch (e) {
      return this.fail(e instanceof MicError && e.kind === 'unsupported' ? 'mic-unsupported' : 'mic-denied')
    }
    if (this.ending) return this.cleanup()

    if (!(await this.fetchToken())) return this.fail('token')
    if (this.ending) return this.cleanup()

    if (!(await this.connect())) return this.fail('network')
    if (this.ending) return this.cleanup()
    this.session?.sendClientContent({
      turns: [{ role: 'user', parts: [{ text: this.opts.kickoff }] }],
      turnComplete: true,
    })
    this.set({ status: 'live', connectedAt: Date.now(), audioBlocked: !isAudioRunning() })
    this.debug('connected')
    this.startThinking() // Buddy is about to pick up
  }

  /** Hang up. Safe to call more than once. */
  end() {
    if (this.ending) return
    this.ending = true
    this.cleanup()
    if (this.snap.status !== 'error') this.set({ status: 'ended' })
  }

  /**
   * Tell Buddy something mid-call, e.g. a time cue. Waits for a pause so it doesn't
   * cut Buddy or the user off (gives up waiting after 20 s and sends anyway).
   */
  sendNote(text: string) {
    const deadline = Date.now() + 20_000
    const trySend = () => {
      if (this.ending) return
      const busy = this.player.playing || this.userSpeaking || this.snap.status !== 'live'
      if (busy && Date.now() < deadline) {
        setTimeout(trySend, 500)
        return
      }
      this.debug(`note: ${text.slice(0, 40)}…`)
      this.session?.sendClientContent({ turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true })
    }
    trySend()
  }

  /** Call from a tap if the browser blocked audio. */
  async unblockAudio() {
    await getAudioContext().resume()
    this.set({ audioBlocked: !isAudioRunning() })
  }

  // ---- connection -------------------------------------------------------

  private async fetchToken(): Promise<boolean> {
    try {
      const res = await fetch('/.netlify/functions/live-token', { method: 'POST' })
      if (!res.ok) return false
      const body = await res.json()
      this.token = { value: body.token, model: body.model, expiresAt: body.expiresAt }
      return true
    } catch {
      return false
    }
  }

  private async connect(): Promise<boolean> {
    if (!this.token) return false
    const gen = ++this.sessionGen
    const ai = new GoogleGenAI({ apiKey: this.token.value, httpOptions: { apiVersion: LIVE_API_VERSION } })
    try {
      this.session = await ai.live.connect({
        model: this.token.model,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: this.opts.systemPrompt,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          // Audio sessions stop at 15 min without this; walks can be 30.
          contextWindowCompression: { slidingWindow: {} },
          // Each connection lasts ~10 min; the handle lets us pick up where we left off.
          sessionResumption: { handle: this.resumeHandle },
          tools: this.opts.tools?.length ? [{ functionDeclarations: this.opts.tools }] : undefined,
        },
        callbacks: {
          onmessage: (m) => gen === this.sessionGen && this.onMessage(m),
          onclose: () => gen === this.sessionGen && this.onUnexpectedClose(),
          onerror: () => gen === this.sessionGen && this.onUnexpectedClose(),
        },
      })
      return true
    } catch {
      return false
    }
  }

  private async reconnect() {
    if (this.ending || this.snap.status === 'reconnecting') return
    this.debug('reconnecting')
    this.set({ status: 'reconnecting' })
    const old = this.session
    this.session = null
    this.sessionGen++ // ignore anything the old socket still says
    old?.close()
    this.player.clear()

    let ok = await this.connect()
    if (!ok && !this.ending && Date.now() > (this.token?.expiresAt ?? 0) - 60_000) {
      // Token ran out: get a fresh one and try once more.
      ok = (await this.fetchToken()) && (await this.connect())
    }
    if (this.ending) return
    if (ok) this.set({ status: 'live' })
    else this.fail('network')
  }

  private onUnexpectedClose() {
    if (this.ending) return
    this.debug(`socket closed${this.resumeHandle ? ', resuming' : ', no resume handle'}`)
    if (this.resumeHandle) void this.reconnect()
    else this.fail('network')
  }

  private sendAudio(base64Pcm: string) {
    if (this.snap.status !== 'live' || !this.session) return
    this.session.sendRealtimeInput({ audio: { data: base64Pcm, mimeType: 'audio/pcm;rate=16000' } })
  }

  // ---- server messages --------------------------------------------------

  private onMessage(m: LiveServerMessage) {
    if (m.sessionResumptionUpdate?.resumable && m.sessionResumptionUpdate.newHandle) {
      this.resumeHandle = m.sessionResumptionUpdate.newHandle
    }
    if (m.goAway) {
      this.debug(`goAway ${m.goAway.timeLeft ?? ''}`)
      void this.reconnect()
      return
    }

    // Server-side voice detection. The wire field is `type`; the SDK types call it voiceActivityType.
    const va = m.voiceActivity as { type?: string; voiceActivityType?: string } | undefined
    const vaType = va?.type ?? va?.voiceActivityType
    if (vaType) this.debug(vaType === 'ACTIVITY_START' ? 'you: speaking' : 'you: stopped')
    if (vaType === 'ACTIVITY_START') {
      this.userSpeaking = true
      this.awaitingReplySince = null
      if (this.thinkingTimer) clearTimeout(this.thinkingTimer)
      this.closeBubble('buddy')
    } else if (vaType === 'ACTIVITY_END') {
      this.userSpeaking = false
      this.startThinking()
    }

    if (m.toolCall?.functionCalls?.length) {
      const functionResponses = m.toolCall.functionCalls.map((fc) => {
        let response: Record<string, unknown>
        try {
          response = this.opts.onToolCall?.(fc.name ?? '', fc.args) ?? { error: 'Unknown function' }
        } catch {
          response = { error: 'Could not run that' }
        }
        this.debug(`tool ${fc.name} ${JSON.stringify(fc.args)} -> ${JSON.stringify(response)}`)
        return { id: fc.id, name: fc.name, response }
      })
      this.session?.sendToolResponse({ functionResponses })
      this.replyOwed = true
      this.startThinking()
    }

    const sc = m.serverContent
    if (sc) {
      if (sc.interrupted) this.debug('buddy interrupted')
      if (sc.turnComplete) this.debug('buddy turn complete')
      if (sc.interrupted) {
        this.player.clear()
        this.closeBubble('buddy')
      }
      if (sc.inputTranscription?.text) {
        this.replyOwed = true
        this.appendText('user', sc.inputTranscription.text)
      }
      for (const part of sc.modelTurn?.parts ?? []) {
        if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/')) {
          this.turnHadAudio = true
          this.replyOwed = false
          this.nudged = false
          this.stopThinking()
          this.closeBubble('user')
          this.player.enqueue(part.inlineData.data)
        }
      }
      if (sc.outputTranscription?.text) {
        this.closeBubble('user')
        this.appendText('buddy', sc.outputTranscription.text)
      }
      if (sc.turnComplete) {
        // An empty turn (e.g. right after a tool call) doesn't count as an answer.
        if (this.turnHadAudio) this.stopThinking()
        this.turnHadAudio = false
        this.closeBubble('buddy')
      }
    }
    this.updateBuddyState()
  }

  // ---- Buddy state ------------------------------------------------------

  private startThinking() {
    this.awaitingReplySince = Date.now()
    if (this.thinkingTimer) clearTimeout(this.thinkingTimer)
    this.thinkingTimer = setTimeout(() => this.onReplyLate(), NUDGE_AFTER_MS)
  }

  /** No answer yet. Real words → nudge Buddy once. Just a noise → go back to listening. */
  private onReplyLate() {
    if (this.ending || this.userSpeaking || this.player.playing) return
    if (this.replyOwed && !this.nudged && this.snap.status === 'live') {
      this.nudged = true
      this.debug('no reply, nudging')
      this.session?.sendClientContent({ turns: [{ role: 'user', parts: [{ text: NUDGE }] }], turnComplete: true })
      this.thinkingTimer = setTimeout(() => this.onReplyLate(), GIVE_UP_AFTER_MS)
      return
    }
    if (this.nudged) this.debug('still no reply')
    this.replyOwed = false
    this.stopThinking()
  }

  private stopThinking() {
    this.awaitingReplySince = null
    if (this.thinkingTimer) clearTimeout(this.thinkingTimer)
    this.thinkingTimer = null
    this.updateBuddyState()
  }

  private updateBuddyState() {
    let state: BuddyState
    if (this.snap.status === 'connecting') state = 'thinking'
    else if (this.player.playing) state = 'talking'
    else if (this.userSpeaking) state = 'listening'
    else if (this.awaitingReplySince !== null) state = 'thinking'
    else state = 'listening' // on the line, waiting for the user
    if (state !== this.snap.buddyState) this.set({ buddyState: state })
  }

  // ---- transcript bubbles -----------------------------------------------

  private appendText(who: Bubble['who'], text: string) {
    const bubbles = [...this.snap.bubbles]
    const last = bubbles[bubbles.length - 1]
    if (last && last.who === who && !last.done) {
      bubbles[bubbles.length - 1] = { ...last, text: last.text + text }
    } else {
      bubbles.push({ id: this.nextBubbleId++, who, text: text.trimStart(), done: false })
    }
    this.set({ bubbles })
  }

  private closeBubble(who: Bubble['who']) {
    const bubbles = this.snap.bubbles
    const i = bubbles.findLastIndex((b) => b.who === who && !b.done)
    if (i === -1) return
    const next = [...bubbles]
    next[i] = { ...next[i], done: true }
    this.set({ bubbles: next })
  }

  // ---- plumbing ---------------------------------------------------------

  private onAudioState = () => {
    const state = getAudioContext().state
    this.debug(`audio ${state}`)
    if (!this.ending) this.set({ audioBlocked: state !== 'running' })
  }

  private debug(event: string) {
    const t = Math.round((Date.now() - this.startedAt) / 1000)
    const stamp = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
    this.set({ log: [...this.snap.log.slice(-29), `${stamp} ${event}`] })
  }

  private fail(error: CallError) {
    this.debug(`error: ${error}`)
    this.ending = true
    this.cleanup()
    this.set({ status: 'error', error })
  }

  private cleanup() {
    this.sessionGen++
    this.session?.close()
    this.session = null
    this.mic?.stop()
    this.mic = null
    this.player.clear()
    if (this.thinkingTimer) clearTimeout(this.thinkingTimer)
    // Only once per call, so a late cleanup can't release a newer call's wake lock.
    const ctx = getAudioContext()
    if (ctx.onstatechange === this.onAudioState) ctx.onstatechange = null
    if (this.screenHeld) releaseScreen()
    this.screenHeld = false
  }

  private set(patch: Partial<CallSnapshot>) {
    this.snap = { ...this.snap, ...patch }
    this.opts.onChange(this.snap)
  }
}
