// What the user picked on Home for the next call. Lives in memory only.
import type { Topic } from '../types'
import { createStore, useStore } from './createStore'

export interface CallSetup {
  topic: Topic
  photo: { file: File; url: string } | null
}

const store = createStore<CallSetup>({ topic: 'free', photo: null })

export function useCallSetup(): CallSetup {
  return useStore(store)
}

export function getCallSetup(): CallSetup {
  return store.get()
}

export function setTopic(topic: Topic) {
  store.set((s) => ({ ...s, topic }))
}

export function setPhoto(file: File | null) {
  store.set((s) => {
    if (s.photo) URL.revokeObjectURL(s.photo.url)
    return { ...s, photo: file ? { file, url: URL.createObjectURL(file) } : null }
  })
}
