// Keeps the screen on during a call (mobile browsers may cut the mic when it locks).
let sentinel: WakeLockSentinel | null = null
let wanted = false

async function acquire() {
  if (!wanted || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return
  try {
    sentinel = await navigator.wakeLock.request('screen')
  } catch {
    // Not allowed right now (e.g. low battery mode). The call still works.
  }
}

// The lock is dropped whenever the page is hidden; take it again when we come back.
const onVisible = () => {
  if (document.visibilityState === 'visible') void acquire()
}

export function keepScreenOn() {
  wanted = true
  document.addEventListener('visibilitychange', onVisible)
  void acquire()
}

export function releaseScreen() {
  wanted = false
  document.removeEventListener('visibilitychange', onVisible)
  void sentinel?.release()
  sentinel = null
}
