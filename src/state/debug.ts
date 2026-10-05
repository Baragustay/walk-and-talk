// Prototype-only: show a live event log on the Call screen, to report what happened in a call.
import { createStore, useStore } from './createStore'

const KEY = 'wt-call-debug'

function load(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

const store = createStore<boolean>(load())

export function useCallDebug(): boolean {
  return useStore(store)
}

export function setCallDebug(on: boolean) {
  store.set(on)
  try {
    localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    // ignore
  }
}
