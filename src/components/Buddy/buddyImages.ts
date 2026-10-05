// The one place to swap or rename Buddy's images. Files live in public/buddy/.
export type BuddyState = 'idle' | 'waving' | 'listening' | 'thinking' | 'talking' | 'happy' | 'encouraging'

export const BUDDY_IMAGES: Record<BuddyState, string> = {
  // No buddy-idle.png yet, so idle borrows the waving pose. Change to 'buddy-idle.png' when it exists.
  idle: 'buddy_waving_happy.png',
  waving: 'buddy_waving_happy.png',
  listening: 'buddy_listening_sleepy.png',
  thinking: 'buddy-thinking.png', // missing → falls back to idle
  talking: 'buddy_talking_excited.png',
  happy: 'buddy-happy.png', // missing → falls back to idle
  encouraging: 'buddy-encouraging.png', // missing → falls back to idle
}

export const BUDDY_ALT: Record<BuddyState, string> = {
  idle: 'Buddy is waiting for you',
  waving: 'Buddy is waving hello',
  listening: 'Buddy is listening',
  thinking: 'Buddy is thinking',
  talking: 'Buddy is talking',
  happy: 'Buddy is happy',
  encouraging: 'Buddy is cheering you on',
}

export const buddySrc = (file: string) => `/buddy/${file}`
